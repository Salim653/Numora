import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '@tka/database';
import { insertOne, updateOne } from '../../utils/db-helpers';
import { irtAggregates, questionVersions } from '@tka/database';
import { DEMO_ADMIN_AUTH_ID } from '../../config/demo-actor';
import type { Db } from '../../database/database.module';
import { DATABASE } from '../../database/database.module';
import { AuditService } from '../audit/audit.service';
import { ContentPolicies } from '../content/content.policies';
import type { UpsertIrtAggregateDto } from '../content/dto/content.dto';


@Injectable()
export class IrtService {
  private async resolveActorId(): Promise<string> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, DEMO_ADMIN_AUTH_ID))
      .limit(1);
    return rows[0]?.id ?? '00000000-0000-4000-8000-000000000001';
  }


  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  async getAggregate(questionVersionId: string) {
    const rows = await this.db
      .select()
      .from(irtAggregates)
      .where(eq(irtAggregates.questionVersionId, questionVersionId))
      .limit(1);
    const aggregate = rows[0];
    if (!aggregate) {
      return { dataSufficient: false, message: 'Data belum cukup' };
    }
    return ContentPolicies.irtVisibility(aggregate);
  }

  async upsertAggregate(questionVersionId: string, dto: UpsertIrtAggregateDto, actorUserId?: string) {
    const actor = actorUserId ?? (await this.resolveActorId());
    const versionRows = await this.db
      .select({ id: questionVersions.id })
      .from(questionVersions)
      .where(eq(questionVersions.id, questionVersionId))
      .limit(1);
    if (versionRows.length === 0) {
      throw new NotFoundException('Versi soal tidak ditemukan.');
    }
    if ((dto.correctCount ?? 0) > (dto.responseCount ?? 0)) {
      throw new BadRequestException('correctCount tidak boleh lebih besar dari responseCount.');
    }

    const existing = await this.db
      .select()
      .from(irtAggregates)
      .where(eq(irtAggregates.questionVersionId, questionVersionId))
      .limit(1);
    const before = existing[0];

    const values = {
      questionVersionId,
      responseCount: dto.responseCount,
      correctCount: dto.correctCount,
      difficulty: dto.difficulty ?? null,
      discrimination: dto.discrimination ?? null,
    };

    const after = before
      ? await updateOne(
          this.db
            .update(irtAggregates)
            .set(values)
            .where(eq(irtAggregates.id, before.id))
            .returning(),
        )
      : await insertOne(this.db.insert(irtAggregates).values(values).returning());

    await this.audit.record({
      actorUserId: actor,
      action: 'UPSERT',
      entityType: 'IrtAggregate',
      entityId: after.id,
      before,
      after,
    });
    return ContentPolicies.irtVisibility(after);
  }
}
