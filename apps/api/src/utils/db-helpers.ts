import { BadRequestException, ConflictException } from '@nestjs/common';
/**
 * Drizzle's `.returning()` yields an array that TypeScript treats as possibly
 * empty under `noUncheckedIndexedAccess`. These helpers assert a single
 * returned row for our idempotent admin mutations. Call `.returning()` at the
 * call site so Drizzle infers the row type.
 */

export async function insertOne<T>(rows: Promise<T[]>): Promise<T> {
  const list = await rows;
  const row = list[0];
  if (!row) throw new Error('Insert did not return a row.');
  return row;
}

export async function updateOne<T>(rows: Promise<T[]>): Promise<T> {
  const list = await rows;
  const row = list[0];
  if (!row) throw new Error('Update did not return a row.');
  return row;
}


/**
 * Translate a thrown Drizzle/Postgres error into the matching Nest HTTP error so
 * the API returns 4xx (not 500) for expected domain conflicts.
 */
export function mapDbError(error: unknown): never {
  // Drizzle wraps driver errors in DrizzleQueryError; the Postgres code lives on `cause`.
  const code =
    (error as { code?: string })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  const detail =
    (error as { detail?: string })?.detail ??
    (error as { cause?: { detail?: string } })?.cause?.detail;
  if (code === '23505') {
    
    throw new ConflictException((detail ?? 'Duplicate value.').replace(/^Key \(.*?\)=\(.*?\) already exists\.$/, 'Value already in use.'));
  }
  if (code === '23503') {
    throw new BadRequestException('Referenced record does not exist.');
  }
  if (code === '23502') {
    throw new BadRequestException('Missing required field.');
  }
  throw error;
}
