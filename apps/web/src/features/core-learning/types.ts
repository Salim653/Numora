import type {
  CatalogDto,
  ChapterDto,
  ChapterDetailDto,
  DrillAttemptDto,
  DrillQuestionDto,
  DrillResultDto,
  AssessmentRecordDto,
  AssessmentHistoryDto,
  CurrentTryoutDto,
  TryoutAttemptDto,
  TryoutResultDto,
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

export type TryoutPackage = CurrentTryoutDto;
export type TryoutAttempt = TryoutAttemptDto;
export type TryoutResult = TryoutResultDto;
export type AssessmentRecord = AssessmentRecordDto;
export type AssessmentHistory = AssessmentHistoryDto;
