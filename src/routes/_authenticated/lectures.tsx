import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, PlayCircle, BookOpen, Video, ArrowLeft, Home } from "lucide-react";
import { useCourses } from "@/hooks/use-catalog";
import { useMyEnrollments } from "@/hooks/use-content";
import { resolveImage } from "@/lib/catalog";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/lectures")({
  component: LecturesPage,
});

function LecturesPage() {
  const { data: courses = [], isLoading: lc } = useCourses();
  const { data: enrollments = [], isLoading: le } = useMyEnrollments();

  const myCourses = useMemo(
    () => enrollments
      .map((e) => courses.find((c) => c.id === e.course_id))
      .filter(Boolean) as typeof courses,
    [enrollments, courses],
  );

  const isLoading = lc || le;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <Link to="/dashboard" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent">
            <Home className="h-4 w-4" /> <span className="hidden sm:inline">لوحتي</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold">المحاضرات</h1>
        <p className="mt-2 text-muted-foreground">محاضرات وحصص الدورات اللي مشترك فيها.</p>

        {isLoading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : myCourses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">لسه ما اشتركتش في أي دورة.</p>
            <Link to="/courses" className="mt-4 inline-block rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-gold">تصفّح الدورات</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => {
              const img = resolveImage(c.image_url) ?? resolveImage(c.teacher?.image_url);
              return (
                <article key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  {img ? <img src={img} alt={c.title} className="h-32 w-full object-cover" /> : <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/15 to-transparent"><BookOpen className="h-8 w-8 text-primary/50" /></div>}
                  <div className="p-4">
                    <h3 className="font-bold leading-snug line-clamp-2">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.teacher?.name}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5 text-primary" /> {c.lessons_count} درس</span>
                      {c.live_sessions > 0 && <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5 text-primary" /> {c.live_sessions} مباشر</span>}
                    </div>
                    <Link to="/learn/$courseId" params={{ courseId: c.id }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-primary-foreground shadow-gold">
                      <ArrowLeft className="h-4 w-4" /> ادخل المحاضرات
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
