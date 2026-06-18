import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Loader as Loader2, BookOpen, Star, Users, Award, ArrowLeft, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useTeachers, useCourses } from "@/hooks/use-catalog";
import { resolveImage } from "@/lib/catalog";

export const Route = createFileRoute("/teachers/$teacherId")({
  component: TeacherDetail,
  head: () => ({
    meta: [
      { title: "تفاصيل المدرّس | نبراس التعليمية" },
      { name: "description", content: "تعرّف على المدرّس وخبراته ودوراته على منصة نبراس التعليمية واشترك في دورته." },
    ],
  }),
  errorComponent: () => (
    <Centered><p className="text-muted-foreground">حصل خطأ في تحميل بيانات المدرّس.</p><Link to="/" className="text-primary underline">الرجوع</Link></Centered>
  ),
  notFoundComponent: () => (
    <Centered><p className="text-muted-foreground">المدرّس غير موجود.</p><Link to="/courses" className="text-primary underline">كل الدورات</Link></Centered>
  ),
});

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">{children}</div>;
}

function TeacherDetail() {
  const { teacherId } = Route.useParams();
  const { data: teachers = [], isLoading: lt } = useTeachers();
  const { data: courses = [], isLoading: lc } = useCourses();

  const teacher = useMemo(() => teachers.find((t) => t.id === teacherId) ?? null, [teachers, teacherId]);
  const teacherCourses = useMemo(() => courses.filter((c) => c.teacher_id === teacherId), [courses, teacherId]);
  const courseCount = teacherCourses.length;

  if (lt || lc) return <Centered><Loader2 className="h-8 w-8 animate-spin text-primary" /></Centered>;
  if (!teacher) throw notFound();

  const img = resolveImage(teacher.image_url);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="bg-hero pt-28 pb-10 sm:pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link to="/courses" className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> كل الدورات
          </Link>
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-right">
            {img ? (
              <img src={img} alt={teacher.name} className="h-32 w-32 shrink-0 rounded-full border-4 border-primary/40 object-cover" />
            ) : (
              <span className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/15 text-4xl font-extrabold text-primary">{teacher.name.trim().charAt(0)}</span>
            )}
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold sm:text-4xl">{teacher.name}</h1>
              <p className="mt-1 text-lg font-bold text-primary">{teacher.subject}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-primary text-primary" /> {teacher.rating} تقييم</span>
                {teacher.students_label && <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> {teacher.students_label} طالب</span>}
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> {courseCount} دورة</span>
                {teacher.experience_years ? <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> {teacher.experience_years} سنة خبرة</span> : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {teacher.bio && (
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-extrabold">نبذة عن المدرّس</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{teacher.bio}</p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-extrabold">دورات {teacher.name}</h2>
          {teacherCourses.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-card">
              مفيش دورات متاحة لهذا المدرّس حاليًا.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {teacherCourses.map((course) => (
                <article key={course.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50">
                  <h3 className="text-lg font-bold leading-snug">{course.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-primary">{course.subject}</p>
                  {course.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                    <div className="flex flex-col">
                      {course.old_price && (
                        <span className="text-xs text-muted-foreground line-through">{course.old_price} ج.م</span>
                      )}
                      <span className="text-xl font-extrabold text-gradient-gold">
                        {course.price === 0 ? "مجانًا" : `${course.price} ج.م`}
                      </span>
                    </div>
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: course.id }}
                      className="flex items-center gap-2 rounded-xl bg-gradient-gold px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.04]"
                    >
                      <ArrowLeft className="h-4 w-4" /> اشترك في الدورة
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
