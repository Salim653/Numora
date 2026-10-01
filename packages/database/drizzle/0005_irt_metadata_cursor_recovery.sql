-- Retained legacy migration timestamps can cause Drizzle to skip 0004.
-- Keep existing history and metadata intact on both upgrade paths.
ALTER TABLE "irt_batches" ADD COLUMN IF NOT EXISTS "input_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "irt_batches" ADD COLUMN IF NOT EXISTS "output_digest" text;--> statement-breakpoint
ALTER TABLE "irt_batches" ADD COLUMN IF NOT EXISTS "failure_code" text;
