CREATE TYPE "public"."content_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."report_reference_type" AS ENUM('QUESTION', 'VIDEO');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');--> statement-breakpoint
CREATE TYPE "public"."tryout_package_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
ALTER TYPE "public"."school_status" ADD VALUE 'ARCHIVED';--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "irt_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_version_id" uuid NOT NULL,
	"response_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"difficulty" real,
	"discrimination" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "irt_aggregates_question_version_id_unique" UNIQUE("question_version_id")
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subchapter_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"choices" jsonb NOT NULL,
	"rationale" text,
	"content_snapshot" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" uuid NOT NULL,
	"code" varchar NOT NULL,
	"type" varchar DEFAULT 'MULTIPLE_CHOICE' NOT NULL,
	"stem_latex" text NOT NULL,
	"explanation_latex" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "related_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subchapter_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text NOT NULL,
	"reference_type" "report_reference_type" NOT NULL,
	"reference_id" uuid NOT NULL,
	"message" text,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subchapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tryout_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"code" varchar NOT NULL,
	"status" "tryout_package_status" DEFAULT 'DRAFT' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"question_version_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "province" text;--> statement-breakpoint
ALTER TABLE "irt_aggregates" ADD CONSTRAINT "irt_aggregates_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_subchapter_id_subchapters_id_fk" FOREIGN KEY ("subchapter_id") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "related_videos" ADD CONSTRAINT "related_videos_subchapter_id_subchapters_id_fk" FOREIGN KEY ("subchapter_id") REFERENCES "public"."subchapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subchapters" ADD CONSTRAINT "subchapters_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chapters_sort_order_idx" ON "chapters" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "irt_aggregates_question_version_idx" ON "irt_aggregates" USING btree ("question_version_id");--> statement-breakpoint
CREATE INDEX "levels_subchapter_idx" ON "levels" USING btree ("subchapter_id");--> statement-breakpoint
CREATE INDEX "levels_sort_order_idx" ON "levels" USING btree ("subchapter_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "question_versions_question_version_uq" ON "question_versions" USING btree ("question_id","version_number");--> statement-breakpoint
CREATE INDEX "question_versions_published_idx" ON "question_versions" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_code_uq" ON "questions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "questions_level_idx" ON "questions" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "related_videos_subchapter_idx" ON "related_videos" USING btree ("subchapter_id","sort_order");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_reference_idx" ON "reports" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "subchapters_chapter_idx" ON "subchapters" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "subchapters_sort_order_idx" ON "subchapters" USING btree ("chapter_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "tryout_packages_code_uq" ON "tryout_packages" USING btree ("code");--> statement-breakpoint
CREATE INDEX "tryout_packages_status_idx" ON "tryout_packages" USING btree ("status");