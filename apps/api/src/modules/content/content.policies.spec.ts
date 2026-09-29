import { describe, expect, it } from 'vitest';
import { ContentPolicies } from './content.policies';

describe('ContentPolicies', () => {
  it('issues teacher tokens exactly 72 hours into the future', () => {
    const now = new Date('2026-09-28T00:00:00.000Z');
    expect(ContentPolicies.tokenExpiresAt(now).toISOString()).toBe(
      '2026-10-01T00:00:00.000Z',
    );
  });

  it('accepts only a complete A-D multiple-choice version with one answer', () => {
    expect(() =>
      ContentPolicies.assertPublishableChoices([
        { key: 'A', text: '1', isCorrect: true },
        { key: 'B', text: '2', isCorrect: false },
        { key: 'C', text: '3', isCorrect: false },
        { key: 'D', text: '4', isCorrect: false },
      ]),
    ).not.toThrow();
    expect(() =>
      ContentPolicies.assertPublishableChoices([
        { key: 'A', text: '1', isCorrect: true },
        { key: 'B', text: '2', isCorrect: true },
      ]),
    ).toThrow(/A-D/);
  });

  it('caps related-video metadata at three items', () => {
    expect(() => ContentPolicies.assertVideoCapacity(3)).toThrow(/maksimal 3/);
    expect(() => ContentPolicies.assertVideoCapacity(2)).not.toThrow();
  });

  it('requires a valid schedule and at least one version to publish a tryout', () => {
    expect(() =>
      ContentPolicies.assertPublishablePackage(
        new Date('2026-10-02'),
        new Date('2026-10-01'),
        1,
      ),
    ).toThrow(/akhir/);
    expect(() =>
      ContentPolicies.assertPublishablePackage(
        new Date('2026-10-01'),
        new Date('2026-10-02'),
        0,
      ),
    ).toThrow(/minimal/);
  });

  it('hides IRT metrics until 30 responses', () => {
    expect(
      ContentPolicies.irtVisibility({
        responseCount: 29,
        correctCount: 20,
        difficulty: 0.69,
        discrimination: 0.2,
      }),
    ).toEqual({ dataSufficient: false, message: 'Data belum cukup' });
    expect(
      ContentPolicies.irtVisibility({
        responseCount: 30,
        correctCount: 20,
        difficulty: 0.67,
        discrimination: 0.2,
      }),
    ).toMatchObject({ dataSufficient: true, responseCount: 30 });
  });
});
