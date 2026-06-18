import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, CheckCircle2, Circle, Lock, FileText, ChevronRight,
  PlayCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/site/Logo";
import { useCourse, useCourseContent, useEnrollment, useProgress, useUpdateProgress } from "@/hooks/use-content";
import { useLiveSessions } from "@/hooks/use-live";
import { toEmbedUrl, type Lesson } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/learn/$courseId")({
  component: LearnPage,
});

function LearnPage() {
  const { courseId } = Route.useParams();
  const router = useRouter();
  const { data: course, isLoading } = useCourse(courseId);
  const { sections, lessons, isLoading: contentLoading } = useCourseContent(courseId);
  const { isEnrolled, isLoading: enrollLoading } = useEnrollment(courseId);
  const { data: progress = [] } = useProgress(courseId);
  const { data: liveSessions = [] } = useLiveSessions(courseId);
  const updateProgress = useUpdateProgress(courseId);
  const [activeId, setActiveId] = useState<string | null>(null);

  const completedIds = useMemo(() => new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id)), [progress]);
  const pct = lessons.length ? Math.round((completedIds.size / lessons.length) * 100) : 0;

  const active: Lesson | null = useMemo(() => {
    if (activeId) return lessons.find((l) => l.id === activeId) ?? null;
    return lessons[0] ?? null;
  }, [activeId, lessons]);

  const canWatch = (l: Lesson) => isEnrolled || l.is_free;

  useEffect(() => {
    if (!activeId && lessons.length) setActiveId(lessons[0].id);
  }, [lessons, activeId]);

  if (isLoading || contentLoading || enrollLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="text-muted-foreground">الدورة مش موجودة.</p>
        <Link to="/" className="text-primary underline">الرجوع</Link>
      </div>
    );
  }

  if (!isEnrolled && !lessons.some((l) => l.is_free)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-extrabold">محتاج تشترك الأول</h1>
        <p className="max-w-md text-muted-foreground">لازم تشترك في «{course.title}» عشان تشوف الدروس.</p>
        <Link to="/courses/$courseId" params={{ courseId }} className="rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-gold">
          صفحة الدورة
        </Link>
      </div>
    );
  }

  const embed = active ? toEmbedUrl(active.video_url) : { kind: "none" as const, src: "" };
  const locked = active ? !canWatch(active) : false;
  const liveNow = isEnrolled ? liveSessions.find((l) => l.status === "live") : undefined;
  const liveEmbed = liveNow ? toEmbedUrl(liveNow.embed_url) : { kind: "none" as const, src: "" };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Link to="/dashboard" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent">
            <ChevronRight className="h-4 w-4" /> لوحتي
          </Link>
        </div>
      </header>

      {liveNow && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-destructive/40 bg-card shadow-card">
            <div className="flex items-center gap-2 border-b border-border/60 bg-destructive/10 px-5 py-3">
              <span className="flex items-center gap-1.5 rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-bold text-destructive">🔴 مباشر الآن</span>
              <span className="font-bold">{liveNow.title}</span>
            </div>
            <div className="aspect-video w-full bg-black">
              {liveEmbed.kind === "iframe" ? (
                <iframe src={liveEmbed.src} title={liveNow.title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              ) : liveEmbed.kind === "video" ? (
                <video src={liveEmbed.src} controls autoPlay className="h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">البث المباشر هيبدأ قريبًا.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3">
        {/* المشغّل */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-video w-full bg-black">
              {locked ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                  <Lock className="h-10 w-10" />
                  <p>الدرس ده متاح للمشتركين فقط.</p>
                </div>
              ) : embed.kind === "iframe" ? (
                <iframe src={embed.src} title={active?.title} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
              ) : embed.kind === "video" ? (
                <video
                  src={embed.src}
                  controls
                  className="h-full w-full"
                  onTimeUpdate={(e) => {
                    const t = (e.target as HTMLVideoElement).currentTime;
                    if (active && Math.round(t) % 15 === 0 && t > 0) updateProgress.mutate({ lessonId: active.id, position: t });
                  }}
                  onEnded={() => active && updateProgress.mutate({ lessonId: active.id, completed: true })}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <PlayCircle className="h-12 w-12" />
                  <span className="mr-2">لا يوجد فيديو لهذا الدرس بعد.</span>
                </div>
              )}
            </div>

            {active && (
              <div className="p-5">
                <h1 className="text-xl font-extrabold">{active.title}</h1>
                {active.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{active.description}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {!locked && (
                    <button
                      onClick={() => updateProgress.mutate({ lessonId: active.id, completed: !completedIds.has(active.id) })}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                        completedIds.has(active.id) ? "bg-primary/15 text-primary" : "bg-gradient-gold text-primary-foreground shadow-gold"
                      }`}
                    >
                      {completedIds.has(active.id) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      {completedIds.has(active.id) ? "تم الإكمال" : "تحديد كمكتمل"}
                    </button>
                  )}
                  {active.pdf_url && (
                    <a href={active.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-accent">
                      <FileText className="h-4 w-4 text-primary" /> تحميل الملف
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* قائمة الدروس */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-extrabold">{course.title}</h2>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={pct} className="flex-1" />
              <span className="text-sm font-bold text-primary">{pct}%</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{completedIds.size} من {lessons.length} درس</p>

            <div className="mt-5 space-y-4">
              {sections.map((s) => (
                <div key={s.id}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.title}</p>
                  <ul className="space-y-1">
                    {s.lessons.map((l) => {
                      const isActive = active?.id === l.id;
                      const done = completedIds.has(l.id);
                      const open = canWatch(l);
                      return (
                        <li key={l.id}>
                          <button
                            onClick={() => setActiveId(l.id)}
                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm transition-colors ${
                              isActive ? "bg-primary/15 font-bold text-primary" : "hover:bg-accent"
                            }`}
                          >
                            {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : open ? <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" /> : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            <span className="flex-1 line-clamp-2">{l.title}</span>
                            {l.duration_minutes > 0 && <span className="shrink-0 text-xs text-muted-foreground">{l.duration_minutes}د</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
