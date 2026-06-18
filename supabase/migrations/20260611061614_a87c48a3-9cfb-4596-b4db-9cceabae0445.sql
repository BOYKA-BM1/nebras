-- 1. profiles: profile editing + student onboarding fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS stage_id uuid REFERENCES public.stages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. teachers can manage their own row
DROP POLICY IF EXISTS "Teachers update own row" ON public.teachers;
CREATE POLICY "Teachers update own row" ON public.teachers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. coupons scoped to a teacher
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE;

-- 4. enrollment unique student access code
CREATE OR REPLACE FUNCTION public.gen_enrollment_code()
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'NB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS code text;
UPDATE public.enrollments SET code = public.gen_enrollment_code() WHERE code IS NULL;
ALTER TABLE public.enrollments ALTER COLUMN code SET DEFAULT public.gen_enrollment_code();
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_code_key ON public.enrollments(code);

-- 5. lesson progress: real watch tracking
ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS watched_seconds integer NOT NULL DEFAULT 0;

-- 6. site metrics (visit counter)
CREATE TABLE IF NOT EXISTS public.site_metrics (
  id boolean PRIMARY KEY DEFAULT true,
  visits bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_metrics_singleton CHECK (id)
);
INSERT INTO public.site_metrics (id, visits) VALUES (true, 0) ON CONFLICT (id) DO NOTHING;
GRANT SELECT ON public.site_metrics TO anon, authenticated;
GRANT ALL ON public.site_metrics TO service_role;
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "metrics readable" ON public.site_metrics;
CREATE POLICY "metrics readable" ON public.site_metrics
  FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS bigint LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.site_metrics SET visits = visits + 1, updated_at = now() WHERE id RETURNING visits;
$$;
GRANT EXECUTE ON FUNCTION public.increment_visits() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS TABLE(students bigint, teachers bigint, courses bigint, lessons bigint, visits bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.teachers),
    (SELECT count(*) FROM public.courses WHERE is_published),
    (SELECT count(*) FROM public.lessons),
    (SELECT visits FROM public.site_metrics WHERE id);
$$;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated;

-- 7. banned emails
CREATE TABLE IF NOT EXISTS public.banned_emails (
  email text PRIMARY KEY,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.banned_emails TO authenticated;
GRANT ALL ON public.banned_emails TO service_role;
ALTER TABLE public.banned_emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banned manage admin" ON public.banned_emails;
CREATE POLICY "banned manage admin" ON public.banned_emails
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.is_email_banned(_email text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.banned_emails WHERE lower(email) = lower(_email));
$$;
GRANT EXECUTE ON FUNCTION public.is_email_banned(text) TO anon, authenticated;