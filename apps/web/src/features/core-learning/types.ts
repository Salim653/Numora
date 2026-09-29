// PROPOSED until the NestJS OpenAPI contract is generated. Replace these with
// generated types when the matching backend endpoints land.
export type Level = {
  id: string;
  title: string;
  order: number;
  status: 'locked' | 'open' | 'inProgress' | 'completed';
  latestScore: number | null;
  bestScore: number | null;
};

export type Chapter = { id: string; title: string; order: number };
export type Subchapter = { id: string; chapterId: string; title: string; order: number };
export type Catalog = { chapters: Chapter[] };
export type ChapterDetail = { chapter: Chapter; subchapters: Subchapter[] };
export type SubchapterDetail = { subchapter: Subchapter; levels: Level[] };
export type StudentProgress = {
  completedLevels: number;
  totalLevels: number;
  latestScore: number | null;
};

export type DrillQuestion = {
  questionInstanceId: string;
  stem: string;
  options: { id: string; text: string }[];
  selectedOptionId: string | null;
};

export type DrillAttempt = {
  id: string;
  levelId: string;
  levelTitle: string;
  status: 'inProgress' | 'completed';
  startedAt: string;
  isDemo: boolean;
  questions: DrillQuestion[];
};

export type DrillResult = {
  attemptId: string;
  levelId: string;
  levelTitle: string;
  score: number;
  correctCount: number;
  questionCount: number;
  rawPoints: number;
  mastered: boolean;
  stars: number | null;
  unlockedLevelId: string | null;
  isDemo: boolean;
  explanationState: 'available' | 'expired';
  questions: {
    questionInstanceId: string;
    stem: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    options: { id: string; text: string }[];
    explanation: string;
  }[];
};

// PROPOSED until the Backend publishes its generated OpenAPI contract.
export type TryoutPackage =
  | { state: 'unavailable' }
  | {
      id: string;
      title: string;
      releaseAt: string;
      state: 'open' | 'inProgress' | 'waitingIrt' | 'resultReady';
      eligible: boolean;
      attemptId: string | null;
      questionCount: number | null;
      durationSeconds: number | null;
    };

export type TryoutAttempt = {
  id: string;
  packageId: string;
  packageTitle: string;
  status: 'inProgress' | 'submitted';
  deadlineAt: string | null;
  questions: DrillQuestion[];
};

export type TryoutResult = {
  attemptId: string;
  packageTitle: string;
  score: number;
  correctCount: number;
  questionCount: number;
  explanation: {
    questionInstanceId: string;
    stem: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    explanation: string;
  }[];
};

export type AssessmentRecord = {
  attemptId: string;
  activity: 'drill' | 'tryout';
  title: string;
  submittedAt: string;
  resultState: 'ready' | 'waitingIrt';
  score: number | null;
};

export type AssessmentHistory = { records: AssessmentRecord[]; nextCursor: string | null };
