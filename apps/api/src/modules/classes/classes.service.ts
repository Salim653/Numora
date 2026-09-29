import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import {
  classes,
  classMemberships,
  getDatabase,
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

  async list(authorization?: string) {
    const teacherId = await this.teacher(authorization);
    const { db } = getDatabase();
    const items = await db
      .select({ id: classes.id, name: classes.name })
      .from(classes)
      .innerJoin(
        teacherSchoolMemberships,
        and(
          eq(teacherSchoolMemberships.teacherUserId, classes.teacherUserId),
          eq(teacherSchoolMemberships.schoolId, classes.schoolId),
          isNull(teacherSchoolMemberships.endedAt),
        ),
      )
      .where(and(eq(classes.teacherUserId, teacherId), isNull(classes.archivedAt)))
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
