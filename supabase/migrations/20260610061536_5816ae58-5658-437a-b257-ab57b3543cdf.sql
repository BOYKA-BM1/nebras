CREATE TABLE public.live_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  embed_url text,
  status text NOT NULL DEFAULT 'scheduled',
  starts_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_sessions TO authenticated;
GRANT SELECT ON public.live_sessions TO anon;
GRANT ALL ON public.live_sessions TO service_role;

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live sessions public read"
ON public.live_sessions FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR owns_course(auth.uid(), course_id)
);

CREATE POLICY "live sessions manage admin owner"
ON public.live_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR owns_course(auth.uid(), course_id))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR owns_course(auth.uid(), course_id));

CREATE INDEX idx_live_sessions_course ON public.live_sessions(course_id);

CREATE TRIGGER trg_live_sessions_updated
BEFORE UPDATE ON public.live_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Course owners update own courses"
ON public.courses FOR UPDATE
TO authenticated
USING (owns_course(auth.uid(), id))
WITH CHECK (owns_course(auth.uid(), id));