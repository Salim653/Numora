import { createHash, createHmac } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { and, asc, eq, isNotNull, lte, sql } from 'drizzle-orm';
import {
  assessmentAttempts,
  assessmentPackages,
  attemptAnswers,
  attemptItems,
  getDatabase,
  irtBatches,
  irtItemResults,
  questionVersions,
} from '@tka/database';
import type { IrtBatchInput, IrtBatchOutput, PrepareIrtBatch } from './irt-integration.contract';

function conflict(detail: string): never {
  throw new ConflictException({ code: 'IRT_BATCH_CONFLICT', detail });
}
function validateOutput(output: IrtBatchOutput, input: IrtBatchInput) {
  if (
    !output ||
    output.contractVersion !== '1' ||
    output.batchId !== input.batchId ||
    output.modelVersion !== input.modelVersion ||
    !Array.isArray(output.items) ||
    output.items.some((item) => !item || typeof item !== 'object')
  )
    throw new BadRequestException('Kontrak, batch, atau versi model IRT tidak sesuai.');
  const respondents = new Map<string, Set<string>>();
  for (const response of input.responses) {
    const set = respondents.get(response.questionVersionId) ?? new Set<string>();
    set.add(response.respondentId);
    respondents.set(response.questionVersionId, set);
  }
  if (
    output.items.length !== respondents.size ||
    new Set(output.items.map((i) => i.questionVersionId)).size !== output.items.length
  )
    throw new BadRequestException(
      'Output harus mencakup tepat satu hasil untuk setiap versi soal input.',
    );
  for (const item of output.items) {
    const count = respondents.get(item.questionVersionId)?.size;
    const values = [item.difficultyB, item.discriminationA, item.guessingC];
    if (
      count === undefined ||
      !Number.isInteger(item.sampleSize) ||
      item.sampleSize < 0 ||
      item.sampleSize > count ||
      !['SUFFICIENT', 'NOT_ENOUGH_DATA'].includes(item.dataStatus) ||
      values.some((v) => v !== null && (typeof v !== 'number' || !Number.isFinite(v))) ||
      (item.scaleId !== null && (typeof item.scaleId !== 'string' || item.scaleId.length > 160))
    )
      throw new BadRequestException('Nilai atau sample size output IRT tidak valid.');
    if (
      (item.sampleSize < 30 || item.dataStatus === 'NOT_ENOUGH_DATA') &&
      values.some((v) => v !== null)
    )
      throw new BadRequestException(
        'Parameter IRT tidak boleh ditampilkan ketika data belum cukup.',
      );
    if (
      item.dataStatus === 'SUFFICIENT' &&
      (item.sampleSize < 30 || values.every((v) => v === null))
    )
      throw new BadRequestException(
        'Hasil cukup data memerlukan sedikitnya 30 responden dan parameter model.',
      );
  }
}

@Injectable()
export class IrtIntegrationService {
  async prepare(input: PrepareIrtBatch): Promise<IrtBatchInput> {
    if (
      !input ||
      !isUUID(input.batchId) ||
      (input.packageId !== undefined && !isUUID(input.packageId)) ||
      !['DAILY', 'TRYOUT'].includes(input.batchKind) ||
      typeof input.modelVersion !== 'string' ||
      !input.modelVersion.trim() ||
      input.modelVersion.length > 160 ||
      typeof input.cutoffAt !== 'string' ||
      !Number.isFinite(Date.parse(input.cutoffAt)) ||
      Date.parse(input.cutoffAt) > Date.now() ||
      (input.batchKind === 'TRYOUT' && !input.packageId)
    )
      throw new BadRequestException('Input persiapan IRT tidak valid.');
    const key = process.env.IRT_PSEUDONYM_KEY;
    if (!key || Buffer.byteLength(key) < 32)
      throw new ServiceUnavailableException(
        'IRT_PSEUDONYM_KEY minimal 32 byte harus dikonfigurasi oleh operator.',
      );
    return getDatabase().db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.batchId}))`);
      const [existing] = await tx.select().from(irtBatches).where(eq(irtBatches.id, input.batchId));
      if (existing) {
        const snapshot = existing.inputSnapshot as IrtBatchInput | null;
        if (
          !snapshot ||
          snapshot.modelVersion !== input.modelVersion ||
          snapshot.packageId !== (input.packageId ?? null) ||
          snapshot.batchKind !== input.batchKind ||
          snapshot.cutoffAt !== new Date(input.cutoffAt).toISOString()
        )
          conflict('Batch ID sudah dipakai dengan input lain.');
        return snapshot;
      }
      if (input.packageId) {
        const [pkg] = await tx
          .select()
          .from(assessmentPackages)
          .where(eq(assessmentPackages.id, input.packageId));
        if (!pkg || (input.batchKind === 'TRYOUT' && pkg.assessmentType !== 'TRYOUT'))
          throw new BadRequestException('Paket IRT tidak sesuai.');
      }
      const rows = await tx
        .select({ attempt: assessmentAttempts, item: attemptItems, answer: attemptAnswers })
        .from(assessmentAttempts)
        .innerJoin(attemptItems, eq(attemptItems.attemptId, assessmentAttempts.id))
        .innerJoin(attemptAnswers, eq(attemptAnswers.attemptItemId, attemptItems.id))
        .innerJoin(questionVersions, eq(questionVersions.id, attemptItems.questionVersionId))
        .where(
          and(
            eq(assessmentAttempts.status, 'GRADED'),
            eq(questionVersions.questionType, 'SINGLE_CHOICE'),
            isNotNull(assessmentAttempts.finishedAt),
            lte(assessmentAttempts.finishedAt, new Date(input.cutoffAt)),
            isNotNull(attemptAnswers.gradedAt),
            isNotNull(attemptAnswers.awardedPoints),
            input.packageId ? eq(assessmentAttempts.packageId, input.packageId) : undefined,
          ),
        )
        .orderBy(asc(assessmentAttempts.id), asc(attemptItems.displayOrder));
      const snapshot: IrtBatchInput = {
        contractVersion: '1',
        batchId: input.batchId,
        batchKind: input.batchKind,
        modelVersion: input.modelVersion,
        packageId: input.packageId ?? null,
        cutoffAt: new Date(input.cutoffAt).toISOString(),
        responses: rows.map(({ attempt, item, answer }) => ({
          respondentId: createHmac('sha256', key).update(attempt.studentId).digest('hex'),
          attemptId: attempt.id,
          attemptItemId: item.id,
          questionVersionId: item.questionVersionId,
          packageId: attempt.packageId,
          assessmentType: attempt.assessmentType,
          scoringPolicyVersionId: attempt.scoringPolicyVersionId,
          finishedAt: attempt.finishedAt!.toISOString(),
          correct: Number(answer.awardedPoints) === Number(item.maxPoints),
        })),
      };
      await tx
        .insert(irtBatches)
        .values({
          id: input.batchId,
          packageId: input.packageId,
          batchKind: input.batchKind,
          modelVersion: input.modelVersion,
          status: 'PENDING',
          inputSnapshot: snapshot,
        });
      return snapshot;
    });
  }
  async complete(output: IrtBatchOutput) {
    if (!output || !isUUID(output.batchId)) throw new BadRequestException('Batch ID tidak valid.');
    return getDatabase().db.transaction(async (tx) => {
      const [batch] = await tx
        .select()
        .from(irtBatches)
        .where(eq(irtBatches.id, output.batchId))
        .for('update');
      if (!batch) throw new NotFoundException('Batch IRT tidak ditemukan.');
      const input = batch.inputSnapshot as IrtBatchInput | null;
      if (!input) conflict('Batch legacy tidak memiliki snapshot integrasi.');
      validateOutput(output, input);
      const items = [...output.items]
        .sort((a, b) => a.questionVersionId.localeCompare(b.questionVersionId))
        .map((i) => ({
          questionVersionId: i.questionVersionId,
          sampleSize: i.sampleSize,
          dataStatus: i.dataStatus,
          difficultyB: i.difficultyB,
          discriminationA: i.discriminationA,
          guessingC: i.guessingC,
          scaleId: i.scaleId,
        }));
      const digest = createHash('sha256')
        .update(JSON.stringify({ modelVersion: output.modelVersion, items }))
        .digest('hex');
      if (batch.status === 'SUCCEEDED') {
        if (batch.outputDigest !== digest)
          conflict('Batch selesai tidak dapat ditimpa dengan hasil lain.');
        return { id: batch.id };
      }
      if (items.length)
        await tx
          .insert(irtItemResults)
          .values(
            items.map((i) => ({
              batchId: batch.id,
              questionVersionId: i.questionVersionId,
              sampleSize: i.sampleSize,
              dataStatus: i.dataStatus,
              difficultyB: i.difficultyB?.toString() ?? null,
              discriminationA: i.discriminationA?.toString() ?? null,
              guessingC: i.guessingC?.toString() ?? null,
              scaleId: i.scaleId,
            })),
          );
      await tx
        .update(irtBatches)
        .set({
          status: 'SUCCEEDED',
          finishedAt: new Date(),
          outputDigest: digest,
          failureCode: null,
        })
        .where(eq(irtBatches.id, batch.id));
      // Statistical completion is separate from approved Tryout release. Never set resultReleasedAt here.
      return { id: batch.id };
    });
  }
  async fail(batchId: string, failureCode: string) {
    if (!isUUID(batchId) || !/^[A-Z0-9_]{1,80}$/.test(failureCode))
      throw new BadRequestException('Kode kegagalan IRT tidak valid.');
    return getDatabase().db.transaction(async (tx) => {
      const [batch] = await tx
        .select()
        .from(irtBatches)
        .where(eq(irtBatches.id, batchId))
        .for('update');
      if (!batch) throw new NotFoundException('Batch IRT tidak ditemukan.');
      if (batch.status === 'SUCCEEDED') conflict('Batch selesai tidak dapat diubah menjadi gagal.');
      await tx
        .update(irtBatches)
        .set({ status: 'FAILED', failureCode, finishedAt: new Date() })
        .where(eq(irtBatches.id, batchId));
      return { id: batchId };
    });
  }
  async readiness(batchId: string) {
    const [batch] = await getDatabase()
      .db.select()
      .from(irtBatches)
      .where(eq(irtBatches.id, batchId));
    if (!batch) throw new NotFoundException('Batch IRT tidak ditemukan.');
    const items = await getDatabase()
      .db.select()
      .from(irtItemResults)
      .where(eq(irtItemResults.batchId, batchId));
    return {
      batchSucceeded: batch.status === 'SUCCEEDED',
      enoughData:
        items.length > 0 && items.every((i) => i.sampleSize >= 30 && i.dataStatus === 'SUFFICIENT'),
      releasePolicyOpen: true as const,
    };
  }
}
