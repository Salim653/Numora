ALTER TABLE "pvp_matches" DROP CONSTRAINT "pvp_matches_time_ck";--> statement-breakpoint
ALTER TABLE "pvp_answers" ADD COLUMN "request_id" uuid;--> statement-breakpoint
ALTER TABLE "pvp_match_questions" ADD COLUMN "question_version_id" uuid;--> statement-breakpoint
UPDATE "pvp_match_questions" q SET "question_version_id" = i."question_version_id" FROM "package_items" i WHERE i."id" = q."package_item_id";--> statement-breakpoint
ALTER TABLE "pvp_match_questions" ALTER COLUMN "question_version_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD COLUMN "create_request_id" uuid;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD COLUMN "scoring_policy_version_id" uuid;--> statement-breakpoint
UPDATE "pvp_matches" m SET "scoring_policy_version_id" = p."scoring_policy_version_id", "created_at" = coalesce(m."started_at", m."ended_at", m."created_at") FROM "assessment_packages" p WHERE p."id" = m."package_id";--> statement-breakpoint
ALTER TABLE "pvp_match_questions" ADD CONSTRAINT "pvp_match_questions_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_match_questions" ADD CONSTRAINT "pvp_match_questions_item_version_fk" FOREIGN KEY ("package_item_id","question_version_id") REFERENCES "public"."package_items"("id","question_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD CONSTRAINT "pvp_matches_scoring_policy_version_id_scoring_policy_versions_id_fk" FOREIGN KEY ("scoring_policy_version_id") REFERENCES "public"."scoring_policy_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pvp_matches_creator_request_uq" ON "pvp_matches" USING btree ("creator_student_id","create_request_id");--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD CONSTRAINT "pvp_matches_difficulty_ck" CHECK ("pvp_matches"."difficulty" in ('easy', 'medium', 'hard'));--> statement-breakpoint
ALTER TABLE "pvp_matches" ADD CONSTRAINT "pvp_matches_time_ck" CHECK ("pvp_matches"."ended_at" is null or "pvp_matches"."ended_at" >= coalesce("pvp_matches"."started_at", "pvp_matches"."created_at"));
