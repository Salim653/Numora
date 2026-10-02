import { ForbiddenException, Injectable } from '@nestjs/common';
import {
  classes,
  classMemberships,
  getDatabase,
  leaderboardPeriod,
  leaderboardPeriods,
  pvpLeaderboardEntries,
  users,
} from '@tka/database';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { IdentityService } from '../identity/identity.service';
import type { Difficulty } from '../pvp/pvp.policy';
import type { LeaderboardDto } from './leaderboards.dto';

@Injectable()
export class LeaderboardsService {
  constructor(private readonly identity: IdentityService) {}
  private async student(authorization?: string) {
    const user = await this.identity.me(authorization);
    if (user.role !== 'STUDENT')
      throw new ForbiddenException({
        code: 'STUDENT_REQUIRED',
        detail: 'Akses Student diperlukan.',
      });
    return user;
  }
  private period(now: Date) {
    const p = leaderboardPeriod(now);
    return {
      startsAt: p.startsAt.toISOString(),
      endsAt: p.endsAt.toISOString(),
      timezone: 'Asia/Jakarta',
    };
  }
  async pvp(authorization: string | undefined, difficulty: Difficulty): Promise<LeaderboardDto> {
    const student = await this.student(authorization);
    const now = new Date();
    const period = this.period(now);
    const { db } = getDatabase();
    const [current] = await db
      .select()
      .from(leaderboardPeriods)
      .where(eq(leaderboardPeriods.startsAt, new Date(period.startsAt)));
    const empty: LeaderboardDto = {
      policyPending: true,
      reasonCode: 'OPEN-07',
      className: null,
      unit: 'points',
      period,
      updatedAt: null,
      entries: [],
      ownEntry: null,
    };
    if (!current) return empty;
    const selection = {
      studentId: users.id,
      displayName: users.displayName,
      points: pvpLeaderboardEntries.bestPoints,
      rank: pvpLeaderboardEntries.rank,
      updatedAt: pvpLeaderboardEntries.updatedAt,
    };
    const scope = and(
      eq(pvpLeaderboardEntries.periodId, current.id),
      eq(pvpLeaderboardEntries.difficulty, difficulty),
      eq(users.status, 'ACTIVE'),
    );
    const [top, own] = await Promise.all([
      db
        .select(selection)
        .from(pvpLeaderboardEntries)
        .innerJoin(users, eq(users.id, pvpLeaderboardEntries.studentId))
        .where(scope)
        .orderBy(asc(pvpLeaderboardEntries.rank), asc(users.id))
        .limit(20),
      db
        .select(selection)
        .from(pvpLeaderboardEntries)
        .innerJoin(users, eq(users.id, pvpLeaderboardEntries.studentId))
        .where(and(scope, eq(users.id, student.id)))
        .limit(1),
    ]);
    const map = (r: (typeof top)[number]) => ({
      studentId: r.studentId,
      displayName: r.displayName,
      points: Number(r.points),
      rank: r.rank!,
    });
    return {
      ...empty,
      entries: top.map(map),
      ownEntry: own[0] ? map(own[0]) : null,
      updatedAt: top[0]?.updatedAt.toISOString() ?? own[0]?.updatedAt.toISOString() ?? null,
    };
  }
  async class(authorization?: string): Promise<LeaderboardDto> {
    const student = await this.student(authorization);
    const { db } = getDatabase();
    const [membership] = await db
      .select({ name: classes.name })
      .from(classMemberships)
      .innerJoin(classes, eq(classes.id, classMemberships.classId))
      .where(and(eq(classMemberships.studentUserId, student.id), isNull(classMemberships.leftAt)));
    if (!membership)
      throw new ForbiddenException({
        code: 'CLASS_REQUIRED',
        detail: 'Bergabung ke kelas untuk mengakses peringkat kelas.',
      });
    // OPEN-11: projections can be reconciled, but no XP formula or public ranks are released.
    return {
      policyPending: true,
      reasonCode: 'OPEN-11',
      className: membership.name,
      unit: 'xp',
      period: this.period(new Date()),
      updatedAt: null,
      entries: [],
      ownEntry: null,
    };
  }
}
