import { randomUUID } from 'node:crypto';
import { expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  assessmentPackages,
  assessmentAttempts,
  attemptItems,
  auditLogs,
  getDatabase,
  packageItems,
  questionVersions,
} from '@tka/database';
import { DrillPackagesService } from './drill-packages.service';
import { databaseSuite, installFerdiFixture } from './ferdi-content.fixture';
databaseSuite('Drill packages through HTTP/PostgreSQL', () => {
  const fixture = installFerdiFixture();
  it('protects new endpoints and rejects forged identity/invalid inputs', async () => {
    const { request, body, other, versionIds } = fixture;
    for (const token of ['', 'bad', 'student', 'teacher', 'disabled'])
      expect((await request('admin/content/drill-packages', 'GET', undefined, token)).status).toBe(
        token === '' || token === 'bad' ? 401 : 403,
      );
    expect(
      (await request('admin/content/drill-packages', 'POST', { ...body, actorId: other })).status,
    ).toBe(400);
    expect(
      (
        await request('admin/content/drill-packages', 'POST', {
          ...body,
          questionVersionIds: [versionIds[0], versionIds[0]],
        })
      ).status,
    ).toBe(400);
  });
  it('publishes complete packages once under concurrent requests and preserves pinned items', async () => {
    const { request, body, versionIds, policy, student } = fixture;
    const { db } = getDatabase();
    const created = await request('admin/content/drill-packages', 'POST', body);
    expect(created.status).toBe(201);
    const draft = ((await created.json()) as { id: string }).id;
    expect((await request('admin/content/drill-packages', 'POST', body)).status).toBe(409);
    const results = await Promise.all([
      request(`admin/content/drill-packages/${draft}/publish`, 'POST'),
      request(`admin/content/drill-packages/${draft}/publish`, 'POST'),
    ]);
    expect(results.map((r) => r.status)).toEqual([201, 201]);
    expect(
      (await (await request(`admin/content/drill-packages/${draft}`)).json()) as object,
    ).toMatchObject({ status: 'PUBLISHED', questionVersionIds: versionIds });
    expect(
      (
        await request(`admin/content/drill-packages/${draft}`, 'PATCH', {
          name: 'overwrite',
          scoringPolicyVersionId: policy,
          questionVersionIds: [],
        })
      ).status,
    ).toBe(409);
    const [packageItem] = await db
      .select()
      .from(packageItems)
      .where(eq(packageItems.packageId, draft));
    const [attempt] = await db
      .insert(assessmentAttempts)
      .values({
        studentId: student,
        packageId: draft,
        assessmentType: 'DRILL',
        scoringPolicyVersionId: policy,
        status: 'GRADED',
        rawPoints: '1',
        score0To100: '100',
        startedAt: new Date(Date.now() - 1000),
        finishedAt: new Date(),
      })
      .returning();
    const [pinned] = await db
      .insert(attemptItems)
      .values({
        attemptId: attempt!.id,
        packageId: draft,
        packageItemId: packageItem!.id,
        questionVersionId: packageItem!.questionVersionId,
        displayOrder: 1,
        maxPoints: '1',
      })
      .returning();
    const [source] = await db
      .select()
      .from(questionVersions)
      .where(eq(questionVersions.id, packageItem!.questionVersionId));
    const [revised] = await db
      .insert(questionVersions)
      .values({
        ...source!,
        id: randomUUID(),
        versionNumber: source!.versionNumber + 1,
        stem: { text: 'TEST revised stem' },
      })
      .returning();
    const revision = await request('admin/content/drill-packages', 'POST', {
      ...body,
      packageVersion: 2,
      name: 'TEST revision',
      questionVersionIds: versionIds.map((id) =>
        id === packageItem!.questionVersionId ? revised!.id : id,
      ),
    });
    expect(revision.status).toBe(201);
    expect((await request(`admin/content/drill-packages/${draft}/archive`, 'POST')).status).toBe(
      201,
    );
    expect((await request(`admin/content/drill-packages/${draft}/publish`, 'POST')).status).toBe(
      409,
    );
    expect(
      await getDatabase().db.select().from(packageItems).where(eq(packageItems.packageId, draft)),
    ).toHaveLength(10);
    expect(
      (await db.select().from(attemptItems).where(eq(attemptItems.id, pinned!.id)))[0],
    ).toEqual(pinned);
    expect(
      (await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.id, attempt!.id)))[0],
    ).toEqual(attempt);
    expect(
      (await db.select().from(questionVersions).where(eq(questionVersions.id, source!.id)))[0],
    ).toEqual(source);
  });
  it('reads incomplete legacy metadata honestly and rejects publication until configured', async () => {
    const { db } = getDatabase();
    const [legacy] = await db
      .insert(assessmentPackages)
      .values({
        familyCode: `LEGACY-${fixture.suffix}`,
        packageVersion: 1,
        name: 'TEST legacy draft',
        assessmentType: 'DRILL',
        levelId: fixture.level,
      })
      .returning();
    const detail = await fixture.request(`admin/content/drill-packages/${legacy!.id}`);
    expect(detail.status).toBe(200);
    expect(await detail.json()).toMatchObject({ variantIndex: null, scoringPolicyVersionId: null });
    const publication = await fixture.request(
      `admin/content/drill-packages/${legacy!.id}/publish`,
      'POST',
    );
    expect(publication.status).toBe(409);
    expect(await publication.json()).toMatchObject({ code: 'DRILL_PACKAGE_NOT_READY' });
  });
  it('rejects incomplete, unready and malformed content; rolls back audit failures', async () => {
    const { admin, body, suffix, versionIds } = fixture;
    const service = new DrillPackagesService();
    const incomplete = await service.create(admin, {
      ...body,
      familyCode: `SHORT-${suffix}`,
      questionVersionIds: versionIds.slice(0, 9),
    });
    await expect(service.publish(admin, incomplete.id)).rejects.toMatchObject({ status: 409 });
    const { db } = getDatabase();
    const malformed = await service.create(admin, { ...body, familyCode: `BAD-${suffix}` });
    await db
      .update(questionVersions)
      .set({ answerKey: { optionId: 'Z' } })
      .where(eq(questionVersions.id, versionIds[9]!));
    await expect(service.publish(admin, malformed.id)).rejects.toMatchObject({ status: 409 });
    await db
      .update(questionVersions)
      .set({ answerKey: { optionId: 'A' }, contentStatus: 'DRAFT' })
      .where(eq(questionVersions.id, versionIds[9]!));
    await expect(service.publish(admin, malformed.id)).rejects.toMatchObject({ status: 409 });
    await db
      .update(questionVersions)
      .set({ contentStatus: 'READY' })
      .where(eq(questionVersions.id, versionIds[9]!));
    await expect(
      service.create(randomUUID(), { ...body, familyCode: `ROLLBACK-${suffix}` }),
    ).rejects.toMatchObject({ status: 400 });
    expect(
      await db
        .select()
        .from(assessmentPackages)
        .where(eq(assessmentPackages.familyCode, `ROLLBACK-${suffix}`)),
    ).toHaveLength(0);
    expect(
      (await db.select().from(auditLogs).where(eq(auditLogs.entityId, malformed.id))).map(
        (a) => a.action,
      ),
    ).toEqual(['drill_package_created']);
  });
});
