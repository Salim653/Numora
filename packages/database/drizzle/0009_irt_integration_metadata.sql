-- The IRT fork may already have these columns; preserve its snapshots and history.
ALTER TABLE "irt_batches" ADD COLUMN IF NOT EXISTS "input_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "irt_batches" ADD COLUMN IF NOT EXISTS "output_digest" text;--> statement-breakpoint
ALTER TABLE "irt_batches" ADD COLUMN IF NOT EXISTS "failure_code" text;
