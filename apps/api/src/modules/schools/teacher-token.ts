import { createHash, createHmac, randomInt } from 'node:crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const TEACHER_TOKEN_PATTERN = '^(?:[A-Za-z0-9]{8}|[A-Za-z0-9_-]{32,128})$';

export function requireTeacherTokenPepper(): string {
  const pepper = process.env.TEACHER_TOKEN_PEPPER;
  if (!pepper?.trim()) throw new Error('TEACHER_TOKEN_PEPPER is required on the API server.');
  if (process.env.NEXT_PUBLIC_TEACHER_TOKEN_PEPPER)
    throw new Error('Teacher token pepper must never be exposed through NEXT_PUBLIC_ configuration.');
  return pepper;
}

export function generateTeacherToken(): string {
  return Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
}

export function hashTeacherToken(token: string): string {
  return `hmac-v1:${createHmac('sha256', requireTeacherTokenPepper())
    .update(token.trim().toUpperCase()).digest('hex')}`;
}

export function teacherTokenHashes(token: string): string[] {
  const raw = token.trim();
  if (/^[A-Za-z0-9]{8}$/.test(raw)) {
    const versioned = hashTeacherToken(raw);
    // Compatibility with short tokens issued by PR #26 before the version marker.
    return [versioned, versioned.slice('hmac-v1:'.length)];
  }
  // Legacy base64url tokens are case-sensitive. Never uppercase before SHA-256.
  return [createHash('sha256').update(raw).digest('hex')];
}
