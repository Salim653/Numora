import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function run() {
  const testUrl = process.env.TEST_DATABASE_URL;
  if (!testUrl) throw new Error('TEST_DATABASE_URL is required.');
  const name = `numora_upgrade_${randomBytes(4).toString('hex')}`;
  const upgradeUrl = new URL(testUrl);
  upgradeUrl.pathname = `/${name}`;
  const admin = postgres(testUrl, { max: 1 });
  const oldFolder = await mkdtemp(join(tmpdir(), 'numora-old-migrations-'));
  let client: ReturnType<typeof postgres> | undefined;

  try {
    await admin.unsafe(`CREATE DATABASE "${name}"`);
    client = postgres(upgradeUrl.toString(), { max: 1 });
    const folder = resolve(process.cwd(), 'drizzle');
    const journal = JSON.parse(await readFile(join(folder, 'meta', '_journal.json'), 'utf8')) as {
      entries: { tag: string }[];
    };
    const oldEntries = journal.entries.slice(0, 3);
    assert.equal(oldEntries.length, 3);
    await mkdir(join(oldFolder, 'meta'));
    await writeFile(join(oldFolder, 'meta', '_journal.json'), JSON.stringify({ ...journal, entries: oldEntries }));
    for (const entry of oldEntries) {
      await copyFile(join(folder, `${entry.tag}.sql`), join(oldFolder, `${entry.tag}.sql`));
    }
    await migrate(drizzle(client), { migrationsFolder: oldFolder });

    const [student] = await client<{ id: string }[]>`
      INSERT INTO users (auth_user_id, role, display_name, email)
      VALUES (gen_random_uuid(), 'STUDENT', 'Upgrade test', 'upgrade@example.invalid') RETURNING id`;
    const [chapter] = await client<{ id: string }[]>`
      INSERT INTO chapters (title, sort_order, published_at)
      VALUES ('Legacy chapter', 1, now()) RETURNING id`;
    const [subchapter] = await client<{ id: string }[]>`
      INSERT INTO subchapters (chapter_id, title, sort_order, published_at)
      VALUES (${chapter!.id}, 'Legacy subchapter', 1, now()) RETURNING id`;
    const [level] = await client<{ id: string }[]>`
      INSERT INTO levels (subchapter_id, title, sort_order, published_at)
      VALUES (${subchapter!.id}, 'Legacy level', 1, now()) RETURNING id`;
    const [question] = await client<{ id: string }[]>`
      INSERT INTO questions (level_id, code) VALUES (${level!.id}, 'LEGACY-1') RETURNING id`;
    const [version] = await client<{ id: string }[]>`
      INSERT INTO question_versions (question_id, version) VALUES (${question!.id}, 1) RETURNING id`;
    const options = JSON.stringify([{ id: 'A', text: '1' }, { id: 'B', text: '2' }]);
    const [original] = await client<{ id: string }[]>`
      INSERT INTO question_variants (question_version_id, variant_no, stem, options, correct_option_id, explanation)
      VALUES (${version!.id}, 1, '1 + 1?', ${options}::jsonb, 'B', 'Two') RETURNING id`;
    const [variant] = await client<{ id: string }[]>`
      INSERT INTO question_variants (question_version_id, variant_no, stem, options, correct_option_id, explanation)
      VALUES (${version!.id}, 2, '2 - 1?', ${options}::jsonb, 'A', 'One') RETURNING id`;
    const [drillPackage] = await client<{ id: string }[]>`
      INSERT INTO drill_packages (level_id, variant_set, published_at)
      VALUES (${level!.id}, 1, now()) RETURNING id`;
    await client`
      INSERT INTO drill_package_questions (package_id, question_variant_id, sort_order)
      VALUES (${drillPackage!.id}, ${original!.id}, 1), (${drillPackage!.id}, ${variant!.id}, 2)`;
    const [attempt] = await client<{ id: string }[]>`
      INSERT INTO drill_attempts (student_id, level_id, package_id, status, completed_at, score)
      VALUES (${student!.id}, ${level!.id}, ${drillPackage!.id}, 'COMPLETED', now(), 100) RETURNING id`;
    await client`
      INSERT INTO drill_attempt_questions
        (attempt_id, question_variant_id, sort_order, stem, options, correct_option_id, explanation, selected_option_id)
      VALUES (${attempt!.id}, ${variant!.id}, 1, '2 - 1?', ${options}::jsonb, 'A', 'One', 'A')`;
    await client`
      INSERT INTO level_progress (student_id, level_id, latest_attempt_id, latest_score, best_score)
      VALUES (${student!.id}, ${level!.id}, ${attempt!.id}, 100, 100)`;

    await migrate(drizzle(client), { migrationsFolder: folder });
    const [result] = await client<{
      variants: number; versions: number; pinned: number; progress: number; ready: number;
    }[]>`
      SELECT
        (SELECT count(*)::int FROM question_variants WHERE question_id = ${question!.id}) AS variants,
        (SELECT count(*)::int FROM question_versions WHERE variant_id IN (${original!.id}, ${variant!.id})) AS versions,
        (SELECT count(*)::int FROM drill_package_questions pq
          JOIN question_versions qv ON qv.id = pq.question_version_id AND qv.variant_id = pq.question_variant_id
          WHERE pq.package_id = ${drillPackage!.id}) AS pinned,
        (SELECT count(*)::int FROM legacy_level_progress_attempts WHERE drill_attempt_id = ${attempt!.id}) AS progress,
        (SELECT count(*)::int FROM chapters WHERE id = ${chapter!.id} AND status = 'READY') AS ready`;
    assert.deepEqual(result, { variants: 2, versions: 2, pinned: 2, progress: 1, ready: 1 });
    console.log('Legacy Drill data survived the forward migration.');
  } finally {
    if (client) await client.end();
    await admin.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    await admin.end();
    await rm(oldFolder, { recursive: true, force: true });
  }
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
