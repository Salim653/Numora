import { describe, expect, it } from 'vitest';
import { parseQaManifest, QA_PROJECT_REF, requireQaTarget } from './qa-seed-input.js';

const actors = {
  admin: '00000000-0000-4000-8000-000000000001',
  teacherA: '00000000-0000-4000-8000-000000000002',
  teacherB: '00000000-0000-4000-8000-000000000003',
  studentA: '00000000-0000-4000-8000-000000000004',
  studentB: '00000000-0000-4000-8000-000000000005',
  studentC: '00000000-0000-4000-8000-000000000006',
};

describe('QA seed boundary', () => {
  it('accepts six distinct actor IDs only for the Development project', () => {
    expect(parseQaManifest({ projectRef: QA_PROJECT_REF, actors }).actors).toEqual(actors);
    expect(parseQaManifest({ projectRef: QA_PROJECT_REF, mode: 'EMAIL_QA', actors }).mode).toBe('EMAIL_QA');
    expect(() => parseQaManifest({ projectRef: QA_PROJECT_REF, mode: 'PASSWORD', actors })).toThrow();
    expect(() => parseQaManifest({ projectRef: 'bfvbstmkcpanqqehfevr', actors })).toThrow();
    expect(() =>
      parseQaManifest({
        projectRef: QA_PROJECT_REF,
        actors: { ...actors, teacherB: actors.teacherA },
      }),
    ).toThrow();
    expect(() =>
      parseQaManifest({
        projectRef: QA_PROJECT_REF,
        actors: { ...actors, teacherB: actors.teacherA.toUpperCase() },
      }),
    ).toThrow();
    expect(() =>
      parseQaManifest({ projectRef: QA_PROJECT_REF, actors: { ...actors, extra: actors.admin } }),
    ).toThrow();
  });

  it('rejects a mismatched Auth or database project and a non-TLS URL', () => {
    const env = {
      NODE_ENV: 'development',
      SUPABASE_PROJECT_REF: QA_PROJECT_REF,
      SUPABASE_URL: `https://${QA_PROJECT_REF}.supabase.co`,
      DATABASE_URL: `postgresql://postgres.${QA_PROJECT_REF}:redacted@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require`,
    };
    expect(requireQaTarget(env)).toBe(env.DATABASE_URL);
    expect(() => requireQaTarget({ ...env, NODE_ENV: 'production' })).toThrow();
    expect(() =>
      requireQaTarget({ ...env, SUPABASE_URL: 'https://bfvbstmkcpanqqehfevr.supabase.co' }),
    ).toThrow();
    expect(() =>
      requireQaTarget({
        ...env,
        DATABASE_URL: env.DATABASE_URL.replace(QA_PROJECT_REF, 'bfvbstmkcpanqqehfevr'),
      }),
    ).toThrow();
    expect(() =>
      requireQaTarget({
        ...env,
        DATABASE_URL: env.DATABASE_URL.replace('sslmode=require', 'sslmode=disable'),
      }),
    ).toThrow();
    expect(() =>
      requireQaTarget({ ...env, DATABASE_URL: `${env.DATABASE_URL}&sslmode=disable` }),
    ).toThrow();
  });
});
