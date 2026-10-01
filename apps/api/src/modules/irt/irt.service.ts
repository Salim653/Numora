import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { getDatabase, irtBatches, irtItemResults } from '@tka/database';
import type { ContentPageDto } from '../content/content.dto';
import type { AdminIrtDto } from './irt.controller';

@Injectable()
export class IrtService {
  async batches(page: ContentPageDto) {
    const rows = await getDatabase()
      .db.select()
      .from(irtBatches)
      .orderBy(desc(irtBatches.startedAt), desc(irtBatches.id))
      .limit(page.limit)
      .offset(page.offset);
    return {
      items: rows.map((batch) => ({
        id: batch.id,
        packageId: batch.packageId,
        batchKind: batch.batchKind,
        modelVersion: batch.modelVersion,
        status: batch.status,
        startedAt: batch.startedAt.toISOString(),
        finishedAt: batch.finishedAt?.toISOString() ?? null,
        resultReleasedAt: batch.resultReleasedAt?.toISOString() ?? null,
        failureCode: batch.failureCode,
      })),
    };
  }
  async list(page: ContentPageDto): Promise<AdminIrtDto> {
    const rows = await getDatabase()
      .db.select({
        item: irtItemResults,
        batch: {
          id: irtBatches.id,
          modelVersion: irtBatches.modelVersion,
          status: irtBatches.status,
          startedAt: irtBatches.startedAt,
        },
      })
      .from(irtItemResults)
      .innerJoin(irtBatches, eq(irtBatches.id, irtItemResults.batchId))
      .orderBy(desc(irtBatches.startedAt), desc(irtItemResults.id))
      .limit(page.limit)
      .offset(page.offset);
    return {
      items: rows.map(({ item, batch }) => ({
        id: item.id,
        batchId: batch.id,
        questionVersionId: item.questionVersionId,
        modelVersion: batch.modelVersion,
        batchStatus: batch.status,
        sampleSize: item.sampleSize,
        dataStatus: item.dataStatus,
        difficultyB:
          item.sampleSize >= 30 && batch.status === 'SUCCEEDED' ? item.difficultyB : null,
        discriminationA:
          item.sampleSize >= 30 && batch.status === 'SUCCEEDED' ? item.discriminationA : null,
        guessingC: item.sampleSize >= 30 && batch.status === 'SUCCEEDED' ? item.guessingC : null,
      })),
    };
  }
}
