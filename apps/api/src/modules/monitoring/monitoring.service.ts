import { Injectable, NotFoundException } from '@nestjs/common';
import {
  chapters,
  drillAttempts,
  getDatabase,
  levelProgress,
  levels,
  subchapters,
} from '@tka/database';
import { and, asc, desc, eq, isNotNull } from 'drizzle-orm';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class MonitoringService {
  constructor(private readonly classes: ClassesService) {}

  async studentProgress(authorization: string | undefined, classId: string, studentId: string) {
    const owned = await this.classes.students(authorization, classId);
    const student = owned.items.find((item) => item.id === studentId);
    if (!student)
      throw new NotFoundException({
        code: 'STUDENT_NOT_FOUND',
        detail: 'Student tidak ditemukan pada Class ini.',
      });
    const { db } = getDatabase();
    const published = await db
      .select({
        levelId: levels.id,
        levelLabel: levels.title,
        levelOrder: levels.sortOrder,
        subchapterLabel: subchapters.title,
        subchapterOrder: subchapters.sortOrder,
        chapterLabel: chapters.title,
        chapterOrder: chapters.sortOrder,
      })
      .from(levels)
      .innerJoin(subchapters, eq(subchapters.id, levels.subchapterId))
      .innerJoin(chapters, eq(chapters.id, subchapters.chapterId))
      .where(
        and(
          isNotNull(levels.publishedAt),
          isNotNull(subchapters.publishedAt),
          isNotNull(chapters.publishedAt),
        ),
      )
      .orderBy(asc(chapters.sortOrder), asc(subchapters.sortOrder), asc(levels.sortOrder));
    const states = await db
      .select()
      .from(levelProgress)
      .where(eq(levelProgress.studentId, studentId));
    const active = await db
      .select({ levelId: drillAttempts.levelId })
      .from(drillAttempts)
      .where(and(eq(drillAttempts.studentId, studentId), eq(drillAttempts.status, 'IN_PROGRESS')));
    const progressByLevel = new Map(states.map((row) => [row.levelId, row]));
    const activeLevelIds = new Set(active.map((row) => row.levelId));
    const [latest] = await db
      .select({ score: drillAttempts.score })
      .from(drillAttempts)
      .where(and(eq(drillAttempts.studentId, studentId), eq(drillAttempts.status, 'COMPLETED')))
      .orderBy(desc(drillAttempts.completedAt), desc(drillAttempts.id))
      .limit(1);
    return {
      class: owned.class,
      student,
      latestDrillScore: latest?.score ?? null,
      levels: published.map((level) => {
        const state = progressByLevel.get(level.levelId);
        return {
          levelId: level.levelId,
          chapterLabel: level.chapterLabel,
          subchapterLabel: level.subchapterLabel,
          levelLabel: level.levelLabel,
          accessStatus: state || level.levelOrder === 1 ? 'UNLOCKED' : 'LOCKED',
          inProgress: activeLevelIds.has(level.levelId),
          latestDrillScore: state?.latestScore ?? null,
          bestDrillScore: state?.bestScore ?? null,
        };
      }),
    };
  }
}
