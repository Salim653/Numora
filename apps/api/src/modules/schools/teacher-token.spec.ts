import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash, createHmac } from 'node:crypto';
import { generateTeacherToken, hashTeacherToken, requireTeacherTokenPepper, teacherTokenHashes } from './teacher-token';

afterEach(() => vi.unstubAllEnvs());
describe('versioned teacher token compatibility', () => {
  it('generates eight unambiguous characters and hashes with the server pepper', () => {
    vi.stubEnv('TEACHER_TOKEN_PEPPER', 'test-only-pepper');
    const token = generateTeacherToken();
    expect(token).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    const digest = createHmac('sha256', 'test-only-pepper').update(token).digest('hex');
    expect(hashTeacherToken(` ${token.toLowerCase()} `)).toBe(`hmac-v1:${digest}`);
    expect(teacherTokenHashes(token)).toEqual([`hmac-v1:${digest}`, digest]);
  });
  it('retains case-sensitive legacy SHA-256 tokens', () => {
    const legacy = 'AbCdEfGh_1234567890-abcdefghXYZijklm';
    expect(teacherTokenHashes(` ${legacy} `)).toEqual([createHash('sha256').update(legacy).digest('hex')]);
    expect(teacherTokenHashes(legacy.toUpperCase())).not.toEqual(teacherTokenHashes(legacy));
  });
  it('rejects missing pepper and public secret configuration', () => {
    vi.stubEnv('TEACHER_TOKEN_PEPPER', '');
    expect(requireTeacherTokenPepper).toThrow('TEACHER_TOKEN_PEPPER is required');
    vi.stubEnv('TEACHER_TOKEN_PEPPER', 'test-only');
    vi.stubEnv('NEXT_PUBLIC_TEACHER_TOKEN_PEPPER', 'never-public');
    expect(requireTeacherTokenPepper).toThrow('never be exposed');
  });
});
