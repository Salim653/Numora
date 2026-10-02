import { randomInt } from 'node:crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateClassJoinCode(): string {
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
}
export function isJoinCodeCollision(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  if (
    'code' in error &&
    error.code === '23505' &&
    (('constraint' in error && error.constraint === 'classes_join_code_uq') ||
      ('constraint_name' in error && error.constraint_name === 'classes_join_code_uq'))
  )
    return true;
  return 'cause' in error && isJoinCodeCollision(error.cause);
}
