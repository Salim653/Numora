ALTER TABLE "assessment_attempts" ADD COLUMN "unlocked_level_id" uuid;--> statement-breakpoint
UPDATE "assessment_attempts" aa
SET "unlocked_level_id" = da."unlocked_level_id"
FROM "drill_attempts" da
WHERE aa."id" = da."id"
  AND aa."assessment_type" = 'DRILL'
  AND da."unlocked_level_id" is not null;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_unlocked_level_id_levels_id_fk" FOREIGN KEY ("unlocked_level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;
