import { describe, expect, it } from 'vitest';
import { isJakartaMondayMidnight, normalizedScore } from './tryout.policy';

describe('Tryout time and PG score policy', () => {
  it('recognizes Monday 00:00 WIB at Sunday 17:00 UTC', () => {
    expect(isJakartaMondayMidnight(new Date('2026-10-04T17:00:00.000Z'))).toBe(true);
    expect(isJakartaMondayMidnight(new Date('2026-10-04T16:59:59.999Z'))).toBe(false);
    expect(isJakartaMondayMidnight(new Date('2026-10-04T17:00:01.000Z'))).toBe(false);
  });

  it('normalizes earned points against pinned maximum points', () => {
    expect(normalizedScore(1, 2)).toBe(50);
    expect(normalizedScore(7, 10)).toBe(70);
    expect(() => normalizedScore(0, 0)).toThrow();
  });
});
