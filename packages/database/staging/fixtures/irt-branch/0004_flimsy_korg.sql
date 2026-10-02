ALTER TABLE "irt_batches" ADD COLUMN "input_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "irt_batches" ADD COLUMN "output_digest" text;--> statement-breakpoint
ALTER TABLE "irt_batches" ADD COLUMN "failure_code" text;