import { Injectable } from '@nestjs/common';
import { getDatabase, irtBatches, irtItemResults, packageItems } from '@tka/database';
import { and, eq, inArray, isNotNull, lte } from 'drizzle-orm';

// IRT calculation is owned by Data. This service only verifies that a
// successful, explicitly released batch covers every pinned package item.
@Injectable()
export class TryoutReleaseService {
  async releasedPackageIds(packageIds: string[], now = new Date()): Promise<Set<string>> {
    if (!packageIds.length) return new Set();
    const { db } = getDatabase();
    const batches = await db
      .select({ id: irtBatches.id, packageId: irtBatches.packageId })
      .from(irtBatches)
      .where(and(
        inArray(irtBatches.packageId, packageIds),
        eq(irtBatches.status, 'SUCCEEDED'),
        isNotNull(irtBatches.resultReleasedAt),
        lte(irtBatches.resultReleasedAt, now),
      ));
    if (!batches.length) return new Set();
    const items = await db
      .select({ packageId: packageItems.packageId, questionVersionId: packageItems.questionVersionId })
      .from(packageItems)
      .where(inArray(packageItems.packageId, packageIds));
    const results = await db
      .select({
        batchId: irtItemResults.batchId,
        questionVersionId: irtItemResults.questionVersionId,
        sampleSize: irtItemResults.sampleSize,
        dataStatus: irtItemResults.dataStatus,
      })
      .from(irtItemResults)
      .where(inArray(irtItemResults.batchId, batches.map((batch) => batch.id)));
    const itemsByPackage = new Map<string, string[]>();
    for (const item of items)
      itemsByPackage.set(item.packageId, [
        ...(itemsByPackage.get(item.packageId) ?? []), item.questionVersionId,
      ]);
    const validByBatch = new Map<string, Set<string>>();
    for (const result of results) {
      if (result.sampleSize < 30 || result.dataStatus !== 'SUFFICIENT') continue;
      const versions = validByBatch.get(result.batchId) ?? new Set<string>();
      versions.add(result.questionVersionId);
      validByBatch.set(result.batchId, versions);
    }
    const released = new Set<string>();
    for (const batch of batches) {
      if (!batch.packageId) continue;
      const versions = itemsByPackage.get(batch.packageId) ?? [];
      if (versions.length && versions.every((id) => validByBatch.get(batch.id)?.has(id)))
        released.add(batch.packageId);
    }
    return released;
  }
}
