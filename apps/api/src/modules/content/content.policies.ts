import { BadRequestException } from '@nestjs/common';

export type ChoiceInput = { key: string; text: string; isCorrect: boolean };

export type AggregateInput = {
  responseCount: number;
  correctCount: number;
  difficulty: number | null;
  discrimination: number | null;
};

/**
 * Content domain rules ported from the standalone numora-admin project.
 *
 * These are PRD-aligned content publication rules; they are pure functions so
 * they can be unit tested without a database.
 */
export class ContentPolicies {
  /** PRD: teacher verification token TTL is 3x24 hours. */
  static tokenExpiresAt(now = new Date()): Date {
    return new Date(now.getTime() + 72 * 60 * 60 * 1000);
  }

  /** A publishable PG version has exactly four choices A-D and one correct. */
  static assertPublishableChoices(choices: ChoiceInput[]): void {
    const keys = choices
      .map((choice) => choice.key)
      .sort()
      .join('');
    const valid =
      choices.length === 4 &&
      keys === 'ABCD' &&
      choices.every((choice) => choice.text.trim().length > 0) &&
      choices.filter((choice) => choice.isCorrect).length === 1;

    if (!valid) {
      throw new BadRequestException(
        'Versi soal harus memiliki tepat empat pilihan A-D dan satu jawaban benar.',
      );
    }
  }

  /** A subchapter may hold at most three related-video metadata entries. */
  static assertVideoCapacity(existingCount: number): void {
    if (existingCount >= 3) {
      throw new BadRequestException('Satu subbab maksimal 3 video terkait.');
    }
  }

  /** Tryout package publishability: ends after start and at least one version. */
  static assertPublishablePackage(
    startsAt: Date,
    endsAt: Date,
    questionCount: number,
  ): void {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      throw new BadRequestException('Waktu akhir paket harus setelah waktu mulai.');
    }
    if (questionCount < 1) {
      throw new BadRequestException('Paket Tryout minimal memerlukan satu versi soal.');
    }
  }

  /** Weekly release sanity check: Monday 00:00 Asia/Jakarta. Utility only; no cron. */
  static isMondayMidnightWib(value: Date): boolean {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(value);
    const get = (type: string): string | undefined =>
      parts.find((part) => part.type === type)?.value;
    return get('weekday') === 'Mon' && get('hour') === '00' && get('minute') === '00';
  }

  /** PRD baseline: IRT metrics are hidden below 30 responses. */
  static irtVisibility(aggregate: AggregateInput): Record<string, unknown> {
    if (aggregate.responseCount < 30) {
      return { dataSufficient: false, message: 'Data belum cukup' };
    }
    return {
      dataSufficient: true,
      responseCount: aggregate.responseCount,
      correctCount: aggregate.correctCount,
      difficulty: aggregate.difficulty,
      discrimination: aggregate.discrimination,
    };
  }
}
