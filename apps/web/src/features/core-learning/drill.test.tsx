import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ResultSummary } from './drill';
import type { DrillResult } from './types';

afterEach(cleanup);

const result: DrillResult = {
  attemptId: 'attempt',
  levelId: 'level',
  levelTitle: 'Level 1',
  score: 80,
  correctCount: 8,
  questionCount: 10,
  rawPoints: 8,
  mastered: false,
  stars: null,
  unlockedLevelId: null,
  isDemo: true,
  explanationState: 'available',
  questions: [],
};

describe('ringkasan hasil Drill', () => {
  it('mengikuti status tuntas dan unlock dari API, bukan menghitungnya dari skor', () => {
    const view = render(<ResultSummary result={result} />);
    expect(screen.getByText('Belum tuntas')).toBeTruthy();
    expect(screen.queryByText('Level berikutnya terbuka.')).toBeNull();

    view.rerender(
      <ResultSummary result={{ ...result, score: 70, mastered: true, unlockedLevelId: 'next' }} />,
    );
    expect(screen.getByText('Tuntas')).toBeTruthy();
    expect(screen.getByText('Level berikutnya terbuka.')).toBeTruthy();
  });
});
