-- Add the Drill compatibility objects to the PR #10 Staging schema.
-- Apply only through the guarded staging bridge runner after a restored-copy rehearsal.
CREATE TYPE public.drill_attempt_status AS ENUM ('IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE UNIQUE INDEX question_versions_id_variant_uq ON public.question_versions (id, variant_id);--> statement-breakpoint
DROP INDEX public.assessment_attempts_pretest_once_uq;--> statement-breakpoint
CREATE UNIQUE INDEX assessment_attempts_pretest_once_uq
  ON public.assessment_attempts (student_id, chapter_id_at_start)
  WHERE assessment_type = 'PRETEST' AND status IN ('SUBMITTED', 'GRADED');--> statement-breakpoint

CREATE TABLE public.drill_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES public.levels(id) ON DELETE RESTRICT,
  variant_set integer NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  published_at timestamptz
);--> statement-breakpoint
CREATE UNIQUE INDEX drill_packages_level_set_uq ON public.drill_packages (level_id, variant_set);--> statement-breakpoint
ALTER TABLE public.drill_packages ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE TABLE public.drill_package_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.drill_packages(id) ON DELETE RESTRICT,
  question_variant_id uuid NOT NULL REFERENCES public.question_variants(id) ON DELETE RESTRICT,
  question_version_id uuid NOT NULL REFERENCES public.question_versions(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL,
  CONSTRAINT drill_package_questions_variant_version_fk
    FOREIGN KEY (question_version_id, question_variant_id)
    REFERENCES public.question_versions(id, variant_id) ON DELETE RESTRICT
);--> statement-breakpoint
CREATE UNIQUE INDEX drill_package_questions_order_uq
  ON public.drill_package_questions (package_id, sort_order);--> statement-breakpoint
ALTER TABLE public.drill_package_questions ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE TABLE public.drill_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  level_id uuid NOT NULL REFERENCES public.levels(id) ON DELETE RESTRICT,
  package_id uuid NOT NULL REFERENCES public.drill_packages(id) ON DELETE RESTRICT,
  status public.drill_attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  score integer,
  raw_points integer,
  correct_count integer,
  question_count integer,
  mastered boolean,
  stars integer,
  unlocked_level_id uuid REFERENCES public.levels(id) ON DELETE RESTRICT,
  is_demo boolean NOT NULL DEFAULT true,
  scoring_policy_version text NOT NULL DEFAULT 'DRILL_PG_DEMO_V1',
  CONSTRAINT drill_attempts_score_range CHECK (score IS NULL OR score BETWEEN 0 AND 100)
);--> statement-breakpoint
CREATE UNIQUE INDEX drill_attempts_one_active_uq ON public.drill_attempts (student_id, level_id)
  WHERE status = 'IN_PROGRESS';--> statement-breakpoint
CREATE INDEX drill_attempts_student_level_idx ON public.drill_attempts (student_id, level_id);--> statement-breakpoint
ALTER TABLE public.drill_attempts ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE TABLE public.drill_attempt_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.drill_attempts(id) ON DELETE RESTRICT,
  question_variant_id uuid NOT NULL REFERENCES public.question_variants(id) ON DELETE RESTRICT,
  question_version_id uuid NOT NULL REFERENCES public.question_versions(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL,
  stem text NOT NULL,
  options jsonb NOT NULL,
  correct_option_id text NOT NULL,
  explanation text NOT NULL,
  selected_option_id text,
  CONSTRAINT drill_attempt_questions_variant_version_fk
    FOREIGN KEY (question_version_id, question_variant_id)
    REFERENCES public.question_versions(id, variant_id) ON DELETE RESTRICT
);--> statement-breakpoint
CREATE UNIQUE INDEX drill_attempt_questions_order_uq
  ON public.drill_attempt_questions (attempt_id, sort_order);--> statement-breakpoint
ALTER TABLE public.drill_attempt_questions ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE TABLE public.legacy_question_levels (
  question_id uuid PRIMARY KEY REFERENCES public.questions(id) ON DELETE RESTRICT,
  level_id uuid NOT NULL REFERENCES public.levels(id) ON DELETE RESTRICT
);--> statement-breakpoint
ALTER TABLE public.legacy_question_levels ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE public.legacy_level_progress_attempts (
  level_progress_id uuid PRIMARY KEY REFERENCES public.level_progress(id) ON DELETE RESTRICT,
  drill_attempt_id uuid NOT NULL REFERENCES public.drill_attempts(id) ON DELETE RESTRICT
);--> statement-breakpoint
ALTER TABLE public.legacy_level_progress_attempts ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DO $lockdown$
DECLARE app_table text;
DECLARE app_role text;
BEGIN
  FOREACH app_table IN ARRAY ARRAY[
    'drill_packages', 'drill_package_questions', 'drill_attempts',
    'drill_attempt_questions', 'legacy_question_levels', 'legacy_level_progress_attempts'
  ] LOOP
    FOREACH app_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = app_role) THEN
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %I', app_table, app_role);
      END IF;
    END LOOP;
  END LOOP;
END
$lockdown$;
