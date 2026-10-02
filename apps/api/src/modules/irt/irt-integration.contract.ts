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
export interface IrtBatchInput {
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
export interface IrtBatchOutput {
  contractVersion: '1';
  batchId: string;
  modelVersion: string;
  items: IrtItemOutput[];
}
