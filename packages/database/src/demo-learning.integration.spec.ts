import { afterAll, describe, expect, it } from 'vitest';
import { closeDatabaseConnection, getDatabase } from './client.js';
import { seedDemoLearning } from './demo-learning.js';

const integration = process.env.TEST_DATABASE_URL ? describe : describe.skip;
integration('learning-only demo fixtures', () => {
  afterAll(closeDatabaseConnection);
  it('seeds equivalent version-pinned packages idempotently without fake Auth profiles', async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const { db, client } = getDatabase();
    for (let run = 0; run < 2; run++) await db.transaction(async (tx) => seedDemoLearning(tx));
    const [state] = await client<{ packages: number; items: number; profiles: number }[]>`
      SELECT
        (SELECT count(*)::int FROM assessment_packages
         WHERE level_id = '00000000-0000-4000-8000-000000000102' AND assessment_type = 'DRILL') AS packages,
        (SELECT count(*)::int FROM package_items pi
         JOIN assessment_packages p ON p.id = pi.package_id
         JOIN question_versions v ON v.id = pi.question_version_id
         WHERE p.level_id = '00000000-0000-4000-8000-000000000102'
           AND p.assessment_type = 'DRILL') AS items,
        (SELECT count(*)::int FROM users WHERE auth_user_id IN
          ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003')) AS profiles`;
    expect(state).toEqual({ packages: 2, items: 20, profiles: 0 });
  });
});
