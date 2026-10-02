ALTER TABLE "assessment_attempts" ADD COLUMN "level_id_at_start" uuid;--> statement-breakpoint
ALTER TABLE "assessment_packages" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_packages_id_level_uq" ON "assessment_packages" USING btree ("id","level_id");--> statement-breakpoint

-- ENGINEERING DECISION: preserve the approved Drill v0.5 baseline while the
-- final XP formula (OPEN-11) remains outside scoring.
INSERT INTO "scoring_policy_versions" (
  "id", "policy_code", "version", "configuration", "effective_at", "status"
) VALUES (
  '00000000-0000-4000-8000-000000000901', 'DRILL_PG_DEMO', 1,
  '{"questionType":"SINGLE_CHOICE","questionCount":10,"masteryThreshold":80,"stars":{"one":{"minExclusive":0,"maxInclusive":50},"two":{"minExclusive":50,"maxInclusive":90},"three":{"minExclusive":90,"maxInclusive":100}}}'::jsonb,
  now(), 'PUBLISHED'
) ON CONFLICT ("policy_code", "version") DO NOTHING;--> statement-breakpoint

-- A mismatch needs review before cutover; silently dropping a legacy row would
-- make existing result URLs disappear or change their historical content.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "drill_attempts"
    WHERE "scoring_policy_version" <> 'DRILL_PG_DEMO_V1'
  ) THEN
    RAISE EXCEPTION 'Drill migration: unknown historical scoring policy';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM "drill_attempt_questions" daq
    JOIN "drill_attempts" da ON da."id" = daq."attempt_id"
    LEFT JOIN "drill_package_questions" dpq
      ON dpq."package_id" = da."package_id"
     AND dpq."sort_order" = daq."sort_order"
     AND dpq."question_version_id" = daq."question_version_id"
    WHERE dpq."id" is null
  ) THEN
    RAISE EXCEPTION 'Drill migration: attempt question differs from its package item';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM "drill_attempt_questions" daq
    JOIN "question_versions" qv ON qv."id" = daq."question_version_id"
    WHERE daq."stem" IS DISTINCT FROM qv."stem"->>'text'
       OR daq."explanation" IS DISTINCT FROM qv."explanation"->>'text'
       OR daq."correct_option_id" IS DISTINCT FROM qv."answer_key"->>'optionId'
       OR daq."options" IS DISTINCT FROM (
         SELECT jsonb_agg(
           jsonb_build_object('id', option->>'id', 'text', option->'content'->>'text')
           ORDER BY ord
         )
         FROM jsonb_array_elements(qv."options_or_statements")
           WITH ORDINALITY AS options(option, ord)
       )
  ) THEN
    RAISE EXCEPTION 'Drill migration: historical question snapshot differs from pinned version';
  END IF;
END $$;--> statement-breakpoint

-- Keep legacy IDs so historical URLs and external references continue to work.
INSERT INTO "assessment_packages" (
  "id", "family_code", "package_version", "name", "assessment_type",
  "chapter_id", "level_id", "variant_index", "duration_seconds", "is_demo",
  "scoring_policy_version_id", "release_at", "status"
)
SELECT
  dp."id", 'legacy-drill-' || dp."id"::text, 1,
  'Drill ' || coalesce(l."description", 'Level ' || l."level_number"::text) || ' - Varian ' || dp."variant_set"::text,
  'DRILL'::assessment_type, sc."chapter_id", dp."level_id", dp."variant_set", null,
  dp."is_demo", spv."id", dp."published_at",
  CASE WHEN dp."published_at" is null THEN 'DRAFT'::package_status ELSE 'PUBLISHED'::package_status END
FROM "drill_packages" dp
JOIN "levels" l ON l."id" = dp."level_id"
JOIN "subchapters" sc ON sc."id" = l."subchapter_id"
JOIN "scoring_policy_versions" spv ON spv."policy_code" = 'DRILL_PG_DEMO' AND spv."version" = 1
;--> statement-breakpoint

INSERT INTO "package_items" (
  "id", "package_id", "question_version_id", "display_order", "max_points"
)
SELECT dpq."id", dpq."package_id", dpq."question_version_id", dpq."sort_order", 1
FROM "drill_package_questions" dpq
JOIN "assessment_packages" ap ON ap."id" = dpq."package_id" AND ap."assessment_type" = 'DRILL'
;--> statement-breakpoint

UPDATE "assessment_attempts" aa
SET "level_id_at_start" = ap."level_id"
FROM "assessment_packages" ap
WHERE aa."package_id" = ap."id"
  AND aa."assessment_type" = 'DRILL'
  AND aa."level_id_at_start" is null;--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "drill_attempts" da
    JOIN "assessment_attempts" aa
      ON aa."student_id" = da."student_id"
     AND aa."level_id_at_start" = da."level_id"
     AND aa."assessment_type" = 'DRILL'
     AND aa."status" = 'IN_PROGRESS'
    WHERE da."status" = 'IN_PROGRESS' AND aa."id" <> da."id"
  ) THEN
    RAISE EXCEPTION 'Drill migration: conflicting active attempt';
  END IF;
END $$;--> statement-breakpoint

INSERT INTO "assessment_attempts" (
  "id", "student_id", "package_id", "assessment_type", "chapter_id_at_start",
  "level_id_at_start", "scoring_policy_version_id", "started_at", "finished_at",
  "status", "raw_points", "score_0_100", "stars"
)
SELECT
  da."id", da."student_id", da."package_id", 'DRILL'::assessment_type,
  sc."chapter_id", da."level_id", spv."id", da."started_at", da."completed_at",
  CASE WHEN da."status" = 'COMPLETED' THEN 'GRADED'::attempt_status ELSE 'IN_PROGRESS'::attempt_status END,
  da."raw_points", da."score", da."stars"
FROM "drill_attempts" da
JOIN "levels" l ON l."id" = da."level_id"
JOIN "subchapters" sc ON sc."id" = l."subchapter_id"
JOIN "assessment_packages" ap ON ap."id" = da."package_id" AND ap."level_id" = da."level_id"
JOIN "scoring_policy_versions" spv ON spv."policy_code" = 'DRILL_PG_DEMO' AND spv."version" = 1
;--> statement-breakpoint

INSERT INTO "attempt_items" (
  "id", "attempt_id", "package_id", "package_item_id", "question_version_id",
  "display_order", "max_points"
)
SELECT
  daq."id", daq."attempt_id", da."package_id", pi."id",
  daq."question_version_id", daq."sort_order", 1
FROM "drill_attempt_questions" daq
JOIN "drill_attempts" da ON da."id" = daq."attempt_id"
JOIN "assessment_attempts" aa ON aa."id" = daq."attempt_id"
JOIN "package_items" pi
  ON pi."package_id" = da."package_id"
 AND pi."question_version_id" = daq."question_version_id"
 AND pi."display_order" = daq."sort_order"
;--> statement-breakpoint

INSERT INTO "attempt_answers" (
  "id", "attempt_item_id", "answer", "saved_at", "awarded_points", "graded_at"
)
SELECT
  daq."id", daq."id", jsonb_build_object('optionId', daq."selected_option_id"),
  coalesce(da."completed_at", da."started_at"),
  CASE
    WHEN da."status" = 'COMPLETED' AND daq."selected_option_id" = daq."correct_option_id" THEN 1
    WHEN da."status" = 'COMPLETED' THEN 0
    ELSE null
  END,
  CASE WHEN da."status" = 'COMPLETED' THEN da."completed_at" ELSE null END
FROM "drill_attempt_questions" daq
JOIN "drill_attempts" da ON da."id" = daq."attempt_id"
JOIN "attempt_items" ai ON ai."id" = daq."id"
WHERE da."status" = 'COMPLETED' OR daq."selected_option_id" is not null
;--> statement-breakpoint

DO $$
BEGIN
  IF (SELECT count(*) FROM "drill_packages") <>
     (SELECT count(*) FROM "assessment_packages" WHERE "assessment_type" = 'DRILL')
     OR (SELECT count(*) FROM "drill_package_questions") <>
        (SELECT count(*) FROM "package_items" pi
         JOIN "assessment_packages" ap ON ap."id" = pi."package_id"
         WHERE ap."assessment_type" = 'DRILL')
     OR (SELECT count(*) FROM "drill_attempts") <>
        (SELECT count(*) FROM "assessment_attempts" WHERE "assessment_type" = 'DRILL')
     OR (SELECT count(*) FROM "drill_attempt_questions") <>
        (SELECT count(*) FROM "attempt_items" ai
         JOIN "assessment_attempts" aa ON aa."id" = ai."attempt_id"
         WHERE aa."assessment_type" = 'DRILL')
     OR (SELECT count(*) FROM "drill_attempt_questions" daq
         JOIN "drill_attempts" da ON da."id" = daq."attempt_id"
         WHERE da."status" = 'COMPLETED' OR daq."selected_option_id" is not null) <>
        (SELECT count(*) FROM "attempt_answers" ans
         JOIN "attempt_items" ai ON ai."id" = ans."attempt_item_id"
         JOIN "assessment_attempts" aa ON aa."id" = ai."attempt_id"
         WHERE aa."assessment_type" = 'DRILL')
  THEN
    RAISE EXCEPTION 'Drill migration: legacy/common row counts differ';
  END IF;
END $$;--> statement-breakpoint

UPDATE "level_progress" lp
SET "completion_attempt_id" = (
  SELECT aa."id"
  FROM "assessment_attempts" aa
  WHERE aa."student_id" = lp."student_id"
    AND aa."level_id_at_start" = lp."level_id"
    AND aa."assessment_type" = 'DRILL'
    AND aa."status" = 'GRADED'
    AND aa."score_0_100" >= 80
  ORDER BY aa."finished_at" ASC, aa."id" ASC
  LIMIT 1
)
WHERE lp."completed_at" is not null
  AND lp."completion_attempt_id" is null
  AND EXISTS (
    SELECT 1 FROM "assessment_attempts" aa
    WHERE aa."student_id" = lp."student_id"
      AND aa."level_id_at_start" = lp."level_id"
      AND aa."assessment_type" = 'DRILL'
      AND aa."status" = 'GRADED'
      AND aa."score_0_100" >= 80
  );--> statement-breakpoint

UPDATE "level_progress" lp
SET "unlocking_attempt_id" = (
  SELECT da."id"
  FROM "drill_attempts" da
  JOIN "assessment_attempts" aa ON aa."id" = da."id"
  WHERE da."student_id" = lp."student_id"
    AND da."unlocked_level_id" = lp."level_id"
  ORDER BY da."completed_at" ASC, da."id" ASC
  LIMIT 1
)
WHERE lp."unlock_source" = 'DRILL'
  AND lp."unlocking_attempt_id" is null
  AND EXISTS (
    SELECT 1 FROM "drill_attempts" da
    JOIN "assessment_attempts" aa ON aa."id" = da."id"
    WHERE da."student_id" = lp."student_id"
      AND da."unlocked_level_id" = lp."level_id"
  );--> statement-breakpoint

ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_level_id_at_start_levels_id_fk" FOREIGN KEY ("level_id_at_start") REFERENCES "public"."levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_package_level_fk" FOREIGN KEY ("package_id","level_id_at_start") REFERENCES "public"."assessment_packages"("id","level_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_attempts_drill_active_uq" ON "assessment_attempts" USING btree ("student_id","level_id_at_start") WHERE "assessment_attempts"."assessment_type" = 'DRILL' and "assessment_attempts"."status" = 'IN_PROGRESS';--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_drill_level_ck" CHECK ("assessment_attempts"."assessment_type" <> 'DRILL' or "assessment_attempts"."level_id_at_start" is not null);
