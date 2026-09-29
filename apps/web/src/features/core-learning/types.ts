import type {
  CatalogDto,
  ChapterDto,
  ChapterDetailDto,
  DrillAttemptDto,
  DrillQuestionDto,
  DrillResultDto,
  LevelDto,
  StudentProgressDto,
  SubchapterDto,
  SubchapterDetailDto,
} from './generated-types';

export type Level = LevelDto;
export type Chapter = ChapterDto;
export type Subchapter = SubchapterDto;
export type Catalog = CatalogDto;
export type ChapterDetail = ChapterDetailDto;
export type SubchapterDetail = SubchapterDetailDto;
export type StudentProgress = StudentProgressDto;
export type DrillQuestion = DrillQuestionDto;
export type DrillAttempt = DrillAttemptDto;
export type DrillResult = DrillResultDto;

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
