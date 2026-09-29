import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import {
  chapters,
  contentStatus,
  levels,
  questionVersions,
  questions,
  relatedVideos,
  subchapters,
  tryoutPackageStatus,
  tryoutPackages,
} from '@tka/database';
import type { Db } from '../../database/database.module';
import { DATABASE } from '../../database/database.module';
import { insertOne, updateOne } from '../../utils/db-helpers';
import { AuditService } from '../audit/audit.service';
import { ContentPolicies, type ChoiceInput } from './content.policies';
import type {
  CreateChapterDto,
  CreateLevelDto,
  CreateQuestionDto,
  CreateQuestionVersionDto,
  CreateRelatedVideoDto,
  CreateSubchapterDto,
  CreateTryoutPackageDto,
  UpdateChapterDto,
  UpdateLevelDto,
  UpdateQuestionDto,
  UpdateRelatedVideoDto,
  UpdateSubchapterDto,
  UpdateTryoutPackageDto,
} from './dto/content.dto';

type ContentStatus = (typeof contentStatus.enumValues)[number];
type PackageStatus = (typeof tryoutPackageStatus.enumValues)[number];

const MAX_LIMIT = 100;

function pageParams(params: { page?: number; limit?: number }) {
  const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), MAX_LIMIT);
  const page = Math.max(Number(params.page ?? 1) || 1, 1);
  return { limit, offset: (page - 1) * limit, page };
}

@Injectable()
export class ContentService {
  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  // ---------------- Taxonomy ----------------

  async listHierarchy() {
    return this.db.query.chapters.findMany({
      with: {
        subchapters: {
          with: { levels: true, videos: true },
          orderBy: asc(subchapters.sortOrder),
        },
      },
      orderBy: [asc(chapters.sortOrder), asc(chapters.title)],
    });
  }

  async createChapter(dto: CreateChapterDto) {
    const created = await insertOne(
      this.db
        .insert(chapters)
        .values({
          title: dto.title,
          description: dto.description,
          sortOrder: dto.sortOrder ?? 1,
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE',
      entityType: 'Chapter',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateChapter(id: string, dto: UpdateChapterDto) {
    const before = await this.findOne(chapters, id, 'Bab');
    const after = await updateOne(
      this.db.update(chapters).set(dto).where(eq(chapters.id, id)).returning(),
    );
    await this.audit.record({ action: 'UPDATE', entityType: 'Chapter', entityId: id, before, after });
    return after;
  }

  async createSubchapter(dto: CreateSubchapterDto) {
    await this.findOne(chapters, dto.chapterId, 'Bab');
    const created = await insertOne(
      this.db
        .insert(subchapters)
        .values({
          chapterId: dto.chapterId,
          title: dto.title,
          description: dto.description,
          sortOrder: dto.sortOrder ?? 1,
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE',
      entityType: 'Subchapter',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateSubchapter(id: string, dto: UpdateSubchapterDto) {
    const before = await this.findOne(subchapters, id, 'Subbab');
    const after = await updateOne(
      this.db.update(subchapters).set(dto).where(eq(subchapters.id, id)).returning(),
    );
    await this.audit.record({ action: 'UPDATE', entityType: 'Subchapter', entityId: id, before, after });
    return after;
  }

  async createLevel(dto: CreateLevelDto) {
    await this.findOne(subchapters, dto.subchapterId, 'Subbab');
    const created = await insertOne(
      this.db
        .insert(levels)
        .values({
          subchapterId: dto.subchapterId,
          title: dto.title,
          description: dto.description,
          sortOrder: dto.sortOrder ?? 1,
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE',
      entityType: 'Level',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateLevel(id: string, dto: UpdateLevelDto) {
    const before = await this.findOne(levels, id, 'Level');
    const after = await updateOne(
      this.db.update(levels).set(dto).where(eq(levels.id, id)).returning(),
    );
    await this.audit.record({ action: 'UPDATE', entityType: 'Level', entityId: id, before, after });
    return after;
  }

  async createVideo(subchapterId: string, dto: CreateRelatedVideoDto) {
    await this.findOne(subchapters, subchapterId, 'Subbab');
    const existing = await this.db.$count(relatedVideos, eq(relatedVideos.subchapterId, subchapterId));
    ContentPolicies.assertVideoCapacity(existing);
    const created = await insertOne(
      this.db
        .insert(relatedVideos)
        .values({
          subchapterId,
          title: dto.title,
          url: dto.url,
          sortOrder: dto.sortOrder ?? existing + 1,
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE',
      entityType: 'RelatedVideo',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateVideo(id: string, dto: UpdateRelatedVideoDto) {
    const before = await this.findOne(relatedVideos, id, 'Video');
    const after = await updateOne(
      this.db.update(relatedVideos).set(dto).where(eq(relatedVideos.id, id)).returning(),
    );
    await this.audit.record({ action: 'UPDATE', entityType: 'RelatedVideo', entityId: id, before, after });
    return after;
  }

  async removeVideo(id: string) {
    const before = await this.findOne(relatedVideos, id, 'Video');
    await this.db.delete(relatedVideos).where(eq(relatedVideos.id, id));
    await this.audit.record({ action: 'DELETE', entityType: 'RelatedVideo', entityId: id, before });
    return { deleted: true };
  }

  // ---------------- Questions ----------------

  async listQuestions(params: { page?: number; limit?: number; status?: ContentStatus | undefined }) {
    const { limit, offset, page } = pageParams(params);
    const condition = params.status ? eq(questions.status, params.status) : undefined;

    const items = await this.db
      .select()
      .from(questions)
      .where(condition)
      .orderBy(asc(questions.code))
      .limit(limit)
      .offset(offset);
    const total = condition ? await this.db.$count(questions, condition) : await this.db.$count(questions);

    return { items, meta: { page, limit, total } };
  }

  async getQuestion(id: string) {
    const rows = await this.db.query.questions.findMany({
      where: eq(questions.id, id),
      with: { versions: { orderBy: asc(questionVersions.versionNumber) } },
    });
    const question = rows[0];
    if (!question) throw new NotFoundException('Soal tidak ditemukan.');
    return question;
  }

  async createQuestion(dto: CreateQuestionDto) {
    await this.findOne(levels, dto.levelId, 'Level');
    const created = await insertOne(
      this.db
        .insert(questions)
        .values({
          levelId: dto.levelId,
          code: dto.code,
          type: 'MULTIPLE_CHOICE',
          stemLatex: dto.stemLatex,
          explanationLatex: dto.explanationLatex,
          tags: dto.tags ?? [],
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE',
      entityType: 'Question',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const before = await this.findOne(questions, id, 'Soal');
    const after = await updateOne(
      this.db.update(questions).set(dto).where(eq(questions.id, id)).returning(),
    );
    await this.audit.record({ action: 'UPDATE', entityType: 'Question', entityId: id, before, after });
    return after;
  }

  async updateQuestionStatus(id: string, status: ContentStatus) {
    const before = await this.findOne(questions, id, 'Soal');
    const after = await updateOne(
      this.db.update(questions).set({ status }).where(eq(questions.id, id)).returning(),
    );
    await this.audit.record({
      action: 'UPDATE',
      entityType: 'Question',
      entityId: id,
      before,
      after,
    });
    return after;
  }

  async createVersion(questionId: string, dto: CreateQuestionVersionDto) {
    const question = await this.findOne(questions, questionId, 'Soal');
    const last = await this.db.query.questionVersions.findFirst({
      where: eq(questionVersions.questionId, questionId),
      orderBy: asc(questionVersions.versionNumber),
    });
    const created = await insertOne(
      this.db
        .insert(questionVersions)
        .values({
          questionId,
          versionNumber: (last?.versionNumber ?? 0) + 1,
          choices: dto.choices,
          rationale: dto.rationale,
          contentSnapshot:
            dto.contentSnapshot ?? { code: question.code, stemLatex: question.stemLatex },
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE_DRAFT',
      entityType: 'QuestionVersion',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async publishVersion(id: string) {
    const before = await this.findOne(questionVersions, id, 'Versi soal');
    if (before.publishedAt !== null) {
      throw new BadRequestException('Versi yang telah diterbitkan tidak dapat diubah. Buat klon draf baru.');
    }
    ContentPolicies.assertPublishableChoices(before.choices as ChoiceInput[]);
    const after = await updateOne(
      this.db
        .update(questionVersions)
        .set({ publishedAt: new Date() })
        .where(eq(questionVersions.id, id))
        .returning(),
    );
    await this.db.update(questions).set({ status: 'PUBLISHED' }).where(eq(questions.id, after.questionId));
    await this.audit.record({ action: 'PUBLISH', entityType: 'QuestionVersion', entityId: id, before, after });
    return after;
  }

  async cloneVersion(id: string) {
    const original = await this.findOne(questionVersions, id, 'Versi soal');
    const last = await this.db.query.questionVersions.findFirst({
      where: eq(questionVersions.questionId, original.questionId),
      orderBy: asc(questionVersions.versionNumber),
    });
    const clone = await insertOne(
      this.db
        .insert(questionVersions)
        .values({
          questionId: original.questionId,
          versionNumber: (last?.versionNumber ?? original.versionNumber) + 1,
          choices: original.choices,
          rationale: original.rationale,
          contentSnapshot: original.contentSnapshot,
          publishedAt: null,
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CLONE_DRAFT',
      entityType: 'QuestionVersion',
      entityId: clone.id,
      before: original,
      after: clone,
    });
    return clone;
  }

  // ---------------- Tryout packages ----------------

  async listPackages(params: { page?: number; limit?: number; status?: PackageStatus | undefined }) {
    const { limit, offset, page } = pageParams(params);
    const condition = params.status ? eq(tryoutPackages.status, params.status) : undefined;

    const items = await this.db
      .select()
      .from(tryoutPackages)
      .where(condition)
      .orderBy(asc(tryoutPackages.title))
      .limit(limit)
      .offset(offset);
    const total = condition
      ? await this.db.$count(tryoutPackages, condition)
      : await this.db.$count(tryoutPackages);

    return { items, meta: { page, limit, total } };
  }

  async getPackage(id: string) {
    return this.findOne(tryoutPackages, id, 'Paket Tryout');
  }

  async createPackage(dto: CreateTryoutPackageDto) {
    const created = await insertOne(
      this.db
        .insert(tryoutPackages)
        .values({
          title: dto.title,
          code: dto.code,
          startsAt: new Date(dto.startsAt),
          endsAt: new Date(dto.endsAt),
          questionVersionIds: dto.questionVersionIds ?? [],
        })
        .returning(),
    );
    await this.audit.record({
      action: 'CREATE',
      entityType: 'TryoutPackage',
      entityId: created.id,
      after: created,
    });
    return created;
  }

  async updatePackage(id: string, dto: UpdateTryoutPackageDto) {
    const before = await this.findOne(tryoutPackages, id, 'Paket Tryout');
    if (before.status === 'PUBLISHED') {
      throw new BadRequestException('Paket terbit tidak dapat diubah; arsipkan atau buat paket baru.');
    }
    const changes: Record<string, unknown> = {};
    if (dto.title !== undefined) changes.title = dto.title;
    if (dto.startsAt !== undefined) changes.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) changes.endsAt = new Date(dto.endsAt);
    if (dto.questionVersionIds !== undefined) changes.questionVersionIds = dto.questionVersionIds;
    const after = await updateOne(
      this.db.update(tryoutPackages).set(changes).where(eq(tryoutPackages.id, id)).returning(),
    );
    await this.audit.record({ action: 'UPDATE', entityType: 'TryoutPackage', entityId: id, before, after });
    return after;
  }

  async publishPackage(id: string) {
    const before = await this.findOne(tryoutPackages, id, 'Paket Tryout');
    ContentPolicies.assertPublishablePackage(before.startsAt, before.endsAt, before.questionVersionIds.length);
    const after = await updateOne(
      this.db
        .update(tryoutPackages)
        .set({ status: 'PUBLISHED' })
        .where(eq(tryoutPackages.id, id))
        .returning(),
    );
    await this.audit.record({ action: 'PUBLISH', entityType: 'TryoutPackage', entityId: id, before, after });
    return { ...after, startsAtIsMondayMidnightWib: ContentPolicies.isMondayMidnightWib(after.startsAt) };
  }

  // ---------------- Dashboard aggregates ----------------

  /** Dashboard aggregates owned by the content module. */
  async dashboardAggregates() {
    const [chapterCount, questionCount] = await Promise.all([
      this.db.$count(chapters),
      this.db.$count(questions),
    ]);
    return { chapters: chapterCount, questions: questionCount };
  }

  /** Dashboard aggregate: published tryout packages. */
  async publishedPackageCount() {
    return this.db.$count(tryoutPackages, eq(tryoutPackages.status, 'PUBLISHED'));
  }

  // ---------------- Helpers ----------------

  /**
   * Fetch one row by id or throw NotFoundException. Returns the table's select
   * type at call sites; `any` here avoids Drizzle's verbose table generics
   * while `noUncheckedIndexedAccess` keeps row access honest.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(table: any, id: string, label: string): Promise<any> {
    const rows = await this.db.select().from(table).where(eq(table.id, id)).limit(1);
    const row = rows[0];
    if (!row) throw new NotFoundException(`${label} tidak ditemukan.`);
    return row;
  }
}
