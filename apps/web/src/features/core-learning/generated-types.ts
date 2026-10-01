// Generated from packages/contracts/openapi/openapi.json. Do not edit by hand.
// Run pnpm contracts:types after changing NestJS DTOs.

export type ChapterDto = { "id": string; "title": string; "order": number; };

export type SubchapterDto = { "id": string; "chapterId": string; "title": string; "order": number; };

export type LevelDto = { "id": string; "title": string; "order": number; "status": "locked" | "open" | "inProgress" | "completed"; "latestScore": number | null; "bestScore": number | null; };

export type CatalogDto = { "chapters": ChapterDto[]; };

export type ChapterDetailDto = { "chapter": ChapterDto; "subchapters": SubchapterDto[]; };

export type SubchapterDetailDto = { "subchapter": SubchapterDto; "levels": LevelDto[]; };

export type StudentProgressDto = { "completedLevels": number; "totalLevels": number; "latestScore": number | null; };

export type OptionDto = { "id": string; "text": string; };

export type DrillQuestionDto = { "questionInstanceId": string; "stem": string; "options": OptionDto[]; "selectedOptionId": string | null; };

export type DrillAttemptDto = { "id": string; "levelId": string; "levelTitle": string; "status": "inProgress" | "completed"; "startedAt": string; "isDemo": boolean; "questions": DrillQuestionDto[]; };

export type SavedAnswerDto = { "questionInstanceId": string; "selectedOptionId": string | null; };

export type ReviewedQuestionDto = { "questionInstanceId": string; "stem": string; "options": OptionDto[]; "selectedOptionId": string | null; "correctOptionId": string; "explanation": string; };

export type DrillResultDto = { "attemptId": string; "levelId": string; "levelTitle": string; "score": number; "rawPoints": number; "correctCount": number; "questionCount": number; "mastered": boolean; "stars": number | null; "unlockedLevelId": string | null; "isDemo": boolean; "explanationState": "available" | "expired"; "questions": ReviewedQuestionDto[]; };

export type AssessmentRecordDto = { "attemptId": string; "activity": "drill" | "tryout"; "title": string; "submittedAt": string; "resultState": "ready" | "waitingIrt"; "score": number | null; "isDemo": boolean; };

export type AssessmentHistoryDto = { "records": AssessmentRecordDto[]; "nextCursor": string | null; };

export type CurrentTryoutDto = { "state": "unavailable"; "eligible": boolean; };
