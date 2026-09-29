import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { and, asc, eq, isNull } from 'drizzle-orm';
import {
  auditLogs,
  classes,
  classMemberships,
  getDatabase,
  schools,
  teacherSchoolMemberships,
  users,
} from '@tka/database';
import { IdentityService } from '../identity/identity.service';

@Injectable()
export class ClassesService {
  constructor(private readonly identity: IdentityService) {}

  private async teacher(authorization?: string) {
    const profile = await this.identity.me(authorization);
    if (profile.role !== 'TEACHER' || !profile.teacherVerified) {
      throw new ForbiddenException({
        code: 'TEACHER_ACCESS_REQUIRED',
        detail: 'Akses Guru terverifikasi diperlukan.',
      });
    }
    return profile.id;
  }

  async create(authorization: string | undefined, name: string) {
    if (!name.trim())
      throw new ConflictException({ code: 'CLASS_NAME_REQUIRED', detail: 'Nama Class wajib diisi.' });
    const teacherId = await this.teacher(authorization);
    const { db } = getDatabase();
    const [membership] = await db
      .select({ schoolId: teacherSchoolMemberships.schoolId })
      .from(teacherSchoolMemberships)
      .innerJoin(schools, eq(schools.id, teacherSchoolMemberships.schoolId))
      .where(
        and(
          eq(teacherSchoolMemberships.teacherUserId, teacherId),
          isNull(teacherSchoolMemberships.endedAt),
          eq(schools.status, 'ACTIVE'),
        ),
      )
      .limit(1);
    if (!membership)
      throw new ForbiddenException({
        code: 'SCHOOL_FORBIDDEN',
        detail: 'Sekolah aktif dan verifikasi Guru diperlukan.',
      });
    const joinCode = randomBytes(10).toString('base64url').toUpperCase();
    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(classes)
        .values({
          schoolId: membership.schoolId,
          teacherUserId: teacherId,
          name: name.trim(),
          joinCode,
        })
        .returning({ id: classes.id, name: classes.name, joinCode: classes.joinCode });
      await tx.insert(auditLogs).values({
        actorUserId: teacherId,
        action: 'class_created',
        entityType: 'class',
        entityId: created!.id,
      });
      return created!;
    });
  }

  async join(authorization: string | undefined, joinCode: string) {
    const profile = await this.identity.me(authorization);
    if (profile.role !== 'STUDENT')
      throw new ForbiddenException({ code: 'STUDENT_REQUIRED', detail: 'Akses Siswa diperlukan.' });
    const { db } = getDatabase();
    const [target] = await db
      .select({ id: classes.id, name: classes.name, joinCode: classes.joinCode })
      .from(classes)
      .innerJoin(schools, eq(schools.id, classes.schoolId))
      .where(
        and(
          eq(classes.joinCode, joinCode.trim().toUpperCase()),
          isNull(classes.archivedAt),
          eq(schools.status, 'ACTIVE'),
        ),
      )
      .limit(1);
    if (!target)
      throw new NotFoundException({ code: 'CLASS_NOT_FOUND', detail: 'Kode Class tidak valid.' });
    return db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ classId: classMemberships.classId })
        .from(classMemberships)
        .where(
          and(
            eq(classMemberships.studentUserId, profile.id),
            isNull(classMemberships.leftAt),
          ),
        )
        .limit(1);
      if (existing) {
        if (existing.classId === target.id) return { class: target, joined: true };
        throw new ConflictException({
          code: 'ALREADY_IN_CLASS',
          detail: 'Siswa sudah menjadi anggota Class lain.',
        });
      }
      const [created] = await tx
        .insert(classMemberships)
        .values({ classId: target.id, studentUserId: profile.id })
        .onConflictDoNothing()
        .returning({ id: classMemberships.id });
      if (!created)
        throw new ConflictException({
          code: 'ALREADY_IN_CLASS',
          detail: 'Siswa sudah menjadi anggota Class lain.',
        });
      await tx.insert(auditLogs).values({
        actorUserId: profile.id,
        action: 'student_joined_class',
        entityType: 'class',
        entityId: target.id,
      });
      return { class: target, joined: true };
    });
  }

  async list(authorization?: string) {
    const teacherId = await this.teacher(authorization);
    const { db } = getDatabase();
    const items = await db
      .select({ id: classes.id, name: classes.name, joinCode: classes.joinCode })
      .from(classes)
      .innerJoin(
        teacherSchoolMemberships,
        and(
          eq(teacherSchoolMemberships.teacherUserId, classes.teacherUserId),
          eq(teacherSchoolMemberships.schoolId, classes.schoolId),
          isNull(teacherSchoolMemberships.endedAt),
        ),
      )
      .innerJoin(schools, eq(schools.id, classes.schoolId))
      .where(and(eq(classes.teacherUserId, teacherId), isNull(classes.archivedAt), eq(schools.status, 'ACTIVE')))
      .orderBy(asc(classes.name), asc(classes.id));
    return { items };
  }

  async students(authorization: string | undefined, classId: string) {
    const teacherId = await this.teacher(authorization);
    const { db } = getDatabase();
    const [ownedClass] = await db
      .select({
        id: classes.id,
        name: classes.name,
        schoolId: classes.schoolId,
        teacherUserId: classes.teacherUserId,
        archivedAt: classes.archivedAt,
      })
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);
    if (!ownedClass || ownedClass.archivedAt) {
      throw new NotFoundException({ code: 'CLASS_NOT_FOUND', detail: 'Class tidak ditemukan.' });
    }
    if (ownedClass.teacherUserId !== teacherId) {
      throw new ForbiddenException({ code: 'CLASS_FORBIDDEN', detail: 'Akses Class ditolak.' });
    }
    const [membership] = await db
      .select({ id: teacherSchoolMemberships.id })
      .from(teacherSchoolMemberships)
      .where(
        and(
          eq(teacherSchoolMemberships.teacherUserId, teacherId),
          eq(teacherSchoolMemberships.schoolId, ownedClass.schoolId),
          isNull(teacherSchoolMemberships.endedAt),
        ),
      )
      .limit(1);
    if (!membership) {
      throw new ForbiddenException({ code: 'SCHOOL_FORBIDDEN', detail: 'Akses sekolah ditolak.' });
    }
    const [activeSchool] = await db.select({ id: schools.id }).from(schools)
      .where(and(eq(schools.id, ownedClass.schoolId), eq(schools.status, 'ACTIVE'))).limit(1);
    if (!activeSchool) {
      throw new ForbiddenException({ code: 'SCHOOL_FORBIDDEN', detail: 'Sekolah tidak aktif.' });
    }
    const items = await db
      .select({ id: users.id, displayName: users.displayName })
      .from(classMemberships)
      .innerJoin(users, eq(users.id, classMemberships.studentUserId))
      .where(
        and(
          eq(classMemberships.classId, classId),
          isNull(classMemberships.leftAt),
          eq(users.role, 'STUDENT'),
        ),
      )
      .orderBy(asc(users.displayName), asc(users.id));
    return { class: { id: ownedClass.id, name: ownedClass.name }, items };
  }
}
