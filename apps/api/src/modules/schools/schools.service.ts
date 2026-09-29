import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { and, asc, eq, ilike, isNull } from 'drizzle-orm';
import { insertOne, mapDbError, updateOne } from '../../utils/db-helpers';
import { schoolStatus, schools, teacherVerificationTokens, teacherSchoolMemberships, users } from '@tka/database';
import { DEMO_ADMIN_AUTH_ID } from '../../config/demo-actor';
import type { Db } from '../../database/database.module';
import { DATABASE } from '../../database/database.module';
import { AuditService } from '../audit/audit.service';
import { ContentPolicies } from '../content/content.policies';
import type { CreateSchoolDto, ListSchoolsDto, UpdateSchoolDto } from './dto/schools.dto';

type SchoolStatus = (typeof schoolStatus.enumValues)[number];
type TokenRow = typeof teacherVerificationTokens.$inferSelect;
export type TokenStatus = 'ACTIVE' | 'USED' | 'REVOKED' | 'EXPIRED';

const MAX_LIMIT = 100;

/**
 * Token status is derived from the timestamps on Numora's shared token table
 * rather than a stored enum: REVOKED (revokedAt set), USED (usedAt set),
 * EXPIRED (past expiresAt), otherwise ACTIVE.
 */
export function deriveTokenStatus(token: TokenRow, now = new Date()): TokenStatus {
  if (token.revokedAt !== null) return 'REVOKED';
  if (token.usedAt !== null) return 'USED';
  if (token.expiresAt <= now) return 'EXPIRED';
  return 'ACTIVE';
}

function publicToken(token: TokenRow) {
  const { tokenHash: _omitted, ...rest } = token;
  void _omitted;
  return rest;
}

@Injectable()
export class SchoolsService {
  /** Resolve the seeded DEMO admin's real `users.id` for audit actor FK. */
  private async resolveActorId(): Promise<string | undefined> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, DEMO_ADMIN_AUTH_ID))
      .limit(1);
    return rows[0]?.id;
  }

  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  // ---------------- Schools ----------------

  async listSchools(query: ListSchoolsDto) {
    const limit = Math.min(Math.max(Number(query.limit ?? 20) || 20, 1), MAX_LIMIT);
    const page = Math.max(Number(query.page ?? 1) || 1, 1);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (query.search) conditions.push(ilike(schools.name, `%${query.search}%`));
    if (query.status) conditions.push(eq(schools.status, query.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await this.db
      .select()
      .from(schools)
      .where(where)
      .orderBy(asc(schools.name))
      .limit(limit)
      .offset(offset);
    const total = where ? await this.db.$count(schools, where) : await this.db.$count(schools);

    return { items, meta: { page, limit, total } };
  }

  async getSchool(id: string) {
    return this.findOneSchool(id);
  }

  async createSchool(dto: CreateSchoolDto, actorUserId?: string) { {
    try {
    const actor = actorUserId ?? (await this.resolveActorId());
    const created = await insertOne(
      this.db
        .insert(schools)
        .values({ code: dto.code, name: dto.name, city: dto.city, province: dto.province })
        .returning(),
    );
    await this.audit.record({
      actorUserId: actor,
      action: 'CREATE',
      entityType: 'School',
      entityId: created.id,
      after: created,
    });
    return created;
    } catch (e) {
      mapDbError(e);
    }
  }
  }

  async updateSchool(id: string, dto: UpdateSchoolDto, actorUserId?: string) { {
    try {
    const actor = actorUserId ?? (await this.resolveActorId());
    const before = await this.findOneSchool(id);
    const changes: Record<string, unknown> = {};
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.city !== undefined) changes.city = dto.city;
    if (dto.province !== undefined) changes.province = dto.province;
    const [after] = await this.db.update(schools).set(changes).where(eq(schools.id, id)).returning();
    await this.audit.record({
      actorUserId: actor,
      action: 'UPDATE',
      entityType: 'School',
      entityId: id,
      before,
      after,
    });
    return after;
    } catch (e) {
      mapDbError(e);
    }
  }
  }

  async updateSchoolStatus(id: string, status: SchoolStatus, actorUserId?: string) { {
    try {
    const actor = actorUserId ?? (await this.resolveActorId());
    const before = await this.findOneSchool(id);
    const [after] = await this.db.update(schools).set({ status }).where(eq(schools.id, id)).returning();
    await this.audit.record({
      actorUserId: actor,
      action: 'UPDATE_STATUS',
      entityType: 'School',
      entityId: id,
      before,
      after,
    });
    return after;
    } catch (e) {
      mapDbError(e);
    }
  }
  }

  async removeSchool(id: string, actorUserId?: string) { {
    try {
    const actor = actorUserId ?? (await this.resolveActorId());
    const before = await this.findOneSchool(id);
    // Schools referenced by active teacher memberships cannot be deleted.
    // The full class/user referential check stays in the classes module's
    // scope, matching the source project's safety hook.
    const memberships = await this.db
      .select({ id: teacherSchoolMemberships.id })
      .from(teacherSchoolMemberships)
      .where(
        and(
          eq(teacherSchoolMemberships.schoolId, id),
          isNull(teacherSchoolMemberships.endedAt),
        ),
      )
      .limit(1);
    if (memberships.length > 0) {
      throw new BadRequestException(
        'Sekolah tidak dapat dihapus karena masih memiliki teacher membership aktif.',
      );
    }
    // Schools with live verification tokens must keep their audit trail intact.
    const activeTokens = await this.db
      .select({ id: teacherVerificationTokens.id })
      .from(teacherVerificationTokens)
      .where(
        and(
          eq(teacherVerificationTokens.schoolId, id),
          isNull(teacherVerificationTokens.revokedAt),
          isNull(teacherVerificationTokens.usedAt),
        ),
      )
      .limit(1);
    if (activeTokens.length > 0) {
      throw new ConflictException(
        'Sekolah tidak dapat dihapus karena masih memiliki token verifikasi aktif. ' +
          'Cabut token terlebih dahulu.',
      );
    }
    await this.db.delete(schools).where(eq(schools.id, id));
    await this.audit.record({
      actorUserId: actor,
      action: 'DELETE',
      entityType: 'School',
      entityId: id,
      before,
    });
    return { deleted: true };
    } catch (e) {
      mapDbError(e);
    }
  }
  }

  /** Dashboard aggregates owned by the schools module. */
  async dashboardAggregates(now = new Date()) {
    const rows = await this.db.select().from(schools);
    const byStatus: Record<string, number> = {};
    for (const status of schoolStatus.enumValues) {
      byStatus[status] = rows.filter((school) => school.status === status).length;
    }

    const tokenRows = await this.db.select().from(teacherVerificationTokens);
    const tokenCounts = { active: 0, revoked: 0, used: 0, expired: 0 };
    for (const token of tokenRows) {
      const derived = deriveTokenStatus(token, now).toLowerCase() as keyof typeof tokenCounts;
      tokenCounts[derived] += 1;
    }

    return { schools: byStatus, teacherTokens: tokenCounts };
  }

  // ---------------- Teacher verification tokens ----------------

  async listTokens(schoolId: string, status?: TokenStatus) {
    await this.findOneSchool(schoolId);
    const rows = await this.db
      .select()
      .from(teacherVerificationTokens)
      .where(eq(teacherVerificationTokens.schoolId, schoolId))
      .orderBy(teacherVerificationTokens.createdAt);
    const mapped = rows.map((row) => ({
      ...publicToken(row),
      status: deriveTokenStatus(row),
    }));
    return status ? mapped.filter((token) => token.status === status) : mapped;
  }

  async issueToken(schoolId: string, actorUserId?: string, reissue = false) { {
    try {
    const actor = actorUserId ?? (await this.resolveActorId());
    await this.findOneSchool(schoolId);
    if (reissue) {
      const active = await this.db
        .select()
        .from(teacherVerificationTokens)
        .where(
          and(
            eq(teacherVerificationTokens.schoolId, schoolId),
            isNull(teacherVerificationTokens.revokedAt),
            isNull(teacherVerificationTokens.usedAt),
          ),
        );
      for (const token of active) {
        await this.db
          .update(teacherVerificationTokens)
          .set({ revokedAt: new Date() })
          .where(eq(teacherVerificationTokens.id, token.id));
        await this.audit.record({
          actorUserId: actor,
          action: 'REVOKE',
          entityType: 'TeacherToken',
          entityId: token.id,
          after: publicToken(token),
        });
      }
    }

    const rawToken = randomBytes(24).toString('base64url');
    const created = await insertOne(
      this.db
        .insert(teacherVerificationTokens)
        .values({
          schoolId,
          tokenHash: createHash('sha256').update(rawToken).digest('hex'),
          createdByUserId: actor as string,
          expiresAt: ContentPolicies.tokenExpiresAt(),
        })
        .returning(),
    );
    await this.audit.record({
      actorUserId: actor,
      action: 'ISSUE',
      entityType: 'TeacherToken',
      entityId: created.id,
      after: publicToken(created),
    });
    return {
      ...publicToken(created),
      status: 'ACTIVE' as const,
      token: rawToken,
      tokenNotice: 'Simpan token ini sekarang; token mentah tidak dapat dilihat lagi.',
    };
    } catch (e) {
      mapDbError(e);
    }
  }
  }

  async revokeToken(id: string, actorUserId?: string) { {
    try {
    const actor = actorUserId ?? (await this.resolveActorId());
    const before = await this.findOneToken(id);
    if (before.revokedAt !== null || before.usedAt !== null) {
      throw new BadRequestException('Hanya token aktif yang dapat dicabut.');
    }
    const after = await updateOne(
      this.db
        .update(teacherVerificationTokens)
        .set({ revokedAt: new Date() })
        .where(eq(teacherVerificationTokens.id, id))
        .returning(),
    );
    await this.audit.record({
      actorUserId: actor,
      action: 'REVOKE',
      entityType: 'TeacherToken',
      entityId: id,
      before: publicToken(before),
      after: publicToken(after),
    });
    return { ...publicToken(after), status: 'REVOKED' as const };
    } catch (e) {
      mapDbError(e);
    }
  }
  }

  // ---------------- Helpers ----------------

  private async findOneSchool(id: string) {
    const rows = await this.db.select().from(schools).where(eq(schools.id, id)).limit(1);
    const school = rows[0];
    if (!school) throw new NotFoundException('Sekolah tidak ditemukan.');
    return school;
  }

  private async findOneToken(id: string) {
    const rows = await this.db
      .select()
      .from(teacherVerificationTokens)
      .where(eq(teacherVerificationTokens.id, id))
      .limit(1);
    const token = rows[0];
    if (!token) throw new NotFoundException('Token guru tidak ditemukan.');
    return token;
  }
}
