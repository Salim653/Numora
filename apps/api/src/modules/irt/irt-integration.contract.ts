// ENGINEERING integration envelope. Statistical model and Tryout release policy remain OPEN-12/18.
export interface IrtResponse {
  respondentId: string;
  attemptId: string;
  attemptItemId: string;
  questionVersionId: string;
  packageId: string;
  assessmentType: 'PRETEST' | 'DRILL' | 'TRYOUT' | 'PVP';
  scoringPolicyVersionId: string | null;
  finishedAt: string;
  correct: boolean;
}
export interface IrtBatchInputV1 {
  contractVersion: '1';
  batchId: string;
  batchKind: 'DAILY' | 'TRYOUT';
  modelVersion: string;
  packageId: string | null;
  cutoffAt: string;
  responses: IrtResponse[];
}
export interface PrepareIrtBatch {
  batchId: string;
  batchKind: 'DAILY' | 'TRYOUT';
  modelVersion: string;
  packageId?: string;
  cutoffAt: string;
  /** PROPOSED v2 envelope; caller must coordinate scale/model with Data before activation. */
  contractVersion?: '1' | '2';
  scaleId?: string;
}
export interface IrtItemOutput {
  questionVersionId: string;
  sampleSize: number;
  dataStatus: 'SUFFICIENT' | 'NOT_ENOUGH_DATA';
  difficultyB: number | null;
  discriminationA: number | null;
  guessingC: number | null;
  scaleId: string | null;
}
export interface IrtBatchOutputV1 {
  contractVersion: '1';
  batchId: string;
  modelVersion: string;
  items: IrtItemOutput[];
}

// PROPOSED integration capability, not approval of a model, rubric, scale or release policy.
export interface IrtScoringResponse extends Omit<IrtResponse, 'correct'> {
  correct: boolean | null;
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE_MULTIPLE_ANSWER' | 'CATEGORY';
  answer: unknown;
  maxPoints: number;
  awardedPoints: number | null;
}
export interface IrtBatchInputV2 extends Omit<IrtBatchInputV1, 'contractVersion' | 'responses'> {
  contractVersion: '2';
  scaleId: string;
  responses: IrtScoringResponse[];
}
export interface IrtRespondentOutput {
  respondentId: string;
  attemptId: string;
  scoringPolicyVersionId: string | null;
  scaleId: string;
  score: number;
}
export interface IrtBatchOutputV2 extends Omit<IrtBatchOutputV1, 'contractVersion'> {
  contractVersion: '2';
  respondents: IrtRespondentOutput[];
}
export type IrtBatchInput = IrtBatchInputV1 | IrtBatchInputV2;
export type IrtBatchOutput = IrtBatchOutputV1 | IrtBatchOutputV2;
