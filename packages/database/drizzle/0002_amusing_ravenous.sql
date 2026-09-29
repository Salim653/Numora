CREATE TYPE "public"."drill_attempt_status" AS ENUM('IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "chapters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "drill_attempt_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_variant_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" text NOT NULL,
	"explanation" text NOT NULL,
	"selected_option_id" text
);
--> statement-breakpoint
ALTER TABLE "drill_attempt_questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "drill_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"level_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"status" "drill_attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"score" integer,
	"raw_points" integer,
	"correct_count" integer,
	"question_count" integer,
	"mastered" boolean,
	"stars" integer,
	"unlocked_level_id" uuid,
	"is_demo" boolean DEFAULT true NOT NULL,
	"scoring_policy_version" text DEFAULT 'DRILL_PG_DEMO_V1' NOT NULL,
	CONSTRAINT "drill_attempts_score_range" CHECK ("drill_attempts"."score" is null or ("drill_attempts"."score" between 0 and 100))
);
--> statement-breakpoint
ALTER TABLE "drill_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "drill_package_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"question_variant_id" uuid NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drill_package_questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "drill_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" uuid NOT NULL,
	"variant_set" integer NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "drill_packages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "level_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"level_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"latest_score" integer,
	"best_score" integer,
	"latest_attempt_id" uuid
);
--> statement-breakpoint
ALTER TABLE "level_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subchapter_id" uuid NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "levels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "question_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_version_id" uuid NOT NULL,
	"variant_no" integer NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" text NOT NULL,
	"explanation" text NOT NULL,
	"is_demo" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_variants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "question_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" uuid NOT NULL,
	"code" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subchapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "subchapters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "drill_attempt_questions" ADD CONSTRAINT "drill_attempt_questions_attempt_id_drill_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."drill_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_attempt_questions" ADD CONSTRAINT "drill_attempt_questions_question_variant_id_question_variants_id_fk" FOREIGN KEY ("question_variant_id") REFERENCES "public"."question_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_attempts" ADD CONSTRAINT "drill_attempts_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_attempts" ADD CONSTRAINT "drill_attempts_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_attempts" ADD CONSTRAINT "drill_attempts_package_id_drill_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."drill_packages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_attempts" ADD CONSTRAINT "drill_attempts_unlocked_level_id_levels_id_fk" FOREIGN KEY ("unlocked_level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_package_questions" ADD CONSTRAINT "drill_package_questions_package_id_drill_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."drill_packages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_package_questions" ADD CONSTRAINT "drill_package_questions_question_variant_id_question_variants_id_fk" FOREIGN KEY ("question_variant_id") REFERENCES "public"."question_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_packages" ADD CONSTRAINT "drill_packages_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "level_progress" ADD CONSTRAINT "level_progress_latest_attempt_id_drill_attempts_id_fk" FOREIGN KEY ("latest_attempt_id") REFERENCES "public"."drill_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_subchapter_id_subchapters_id_fk" FOREIGN KEY ("subchapter_id") REFERENCES "public"."subchapters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_variants" ADD CONSTRAINT "question_variants_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subchapters" ADD CONSTRAINT "subchapters_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "chapters_order_uq" ON "chapters" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "drill_attempt_questions_order_uq" ON "drill_attempt_questions" USING btree ("attempt_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "drill_attempts_one_active_uq" ON "drill_attempts" USING btree ("student_id","level_id") WHERE "drill_attempts"."status" = 'IN_PROGRESS';--> statement-breakpoint
CREATE INDEX "drill_attempts_student_level_idx" ON "drill_attempts" USING btree ("student_id","level_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drill_package_questions_order_uq" ON "drill_package_questions" USING btree ("package_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "drill_packages_level_set_uq" ON "drill_packages" USING btree ("level_id","variant_set");--> statement-breakpoint
CREATE UNIQUE INDEX "level_progress_student_level_uq" ON "level_progress" USING btree ("student_id","level_id");--> statement-breakpoint
CREATE UNIQUE INDEX "levels_subchapter_order_uq" ON "levels" USING btree ("subchapter_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "question_variants_version_no_uq" ON "question_variants" USING btree ("question_version_id","variant_no");--> statement-breakpoint
CREATE UNIQUE INDEX "question_versions_question_version_uq" ON "question_versions" USING btree ("question_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_code_uq" ON "questions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "questions_level_idx" ON "questions" USING btree ("level_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subchapters_chapter_order_uq" ON "subchapters" USING btree ("chapter_id","sort_order");