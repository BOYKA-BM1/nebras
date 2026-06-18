ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS idx_teachers_user ON public.teachers(user_id);

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_course(_user_id uuid, _course_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS 'SELECT EXISTS (SELECT 1 FROM public.courses c JOIN public.teachers t ON t.id = c.teacher_id WHERE c.id = _course_id AND t.user_id = _user_id)';
CREATE OR REPLACE FUNCTION public.is_enrolled(_user_id uuid, _course_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS 'SELECT EXISTS (SELECT 1 FROM public.enrollments e WHERE e.user_id = _user_id AND e.course_id = _course_id AND e.status = ''active'')';

CREATE INDEX IF NOT EXISTS idx_sections_course ON public.sections(course_id);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE TRIGGER trg_sections_updated BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_enrollments_updated BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "sections public read published" ON public.sections FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published) OR public.has_role(auth.uid(),'admin') OR public.owns_course(auth.uid(), course_id));
CREATE POLICY "sections manage admin owner" ON public.sections FOR ALL USING (public.has_role(auth.uid(),'admin') OR public.owns_course(auth.uid(), course_id)) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.owns_course(auth.uid(), course_id));

CREATE POLICY "enrollments read own owner admin" ON public.enrollments FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin') OR public.owns_course(auth.uid(), course_id));
CREATE POLICY "enrollments insert own" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enrollments update admin" ON public.enrollments FOR UPDATE USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "enrollments delete admin" ON public.enrollments FOR DELETE USING (public.has_role(auth.uid(),'admin'));