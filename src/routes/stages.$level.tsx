import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Clock, Video, Star, Users, Loader2, ArrowLeft, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useStages, useCourses } from "@/hooks/use-catalog";
import { resolveImage, levelLabel } from "@/lib/catalog";

const LEVELS = ["primary", "prep", "secondary"] as const;
type Level = (typeof LEVELS)[number];

const SEO: Record<Level, { title: string; desc: string; intro: string }> = {
  primary: {
    title: "دورات المرحلة الابتدائية | نبراس التعليمية",
    desc: "دورات وكورسات المرحلة الابتدائية على نبراس لكل الصفوف من الأول حتى السادس الابتدائي مع أفضل المدرّسين وحصص مباشرة ومحاضرات مسجّلة.",
    intro: "تأسيس قوي لطلاب المرحلة الابتدائية بكل صفوفها، بأسلوب مبسّط وممتع ومدرّسين متخصّصين.",
  },
  prep: {
    title: "دورات المرحلة الإعدادية | نبراس التعليمية",
    desc: "دورات وكورسات المرحلة الإعدادية على نبراس لكل صفوف الأول والثاني والثالث الإعدادي بكل المواد مع أفضل المدرّسين في مصر.",
    intro: "شرح متكامل لكل مواد المرحلة الإعدادية مع متابعة مستمرة وامتحانات دورية تجهّزك للثانوية.",
  },
  secondary: {
    title: "دورات المرحلة الثانوية | نبراس التعليمية",
    desc: "دورات المرحلة الثانوية على نبراس لكل الصفوف والشُّعب: علمي علوم، علمي رياضة، وأدبي، مع حصص مباشرة ومراجعات نهائية ومدرّسين خبراء.",
    intro: "كل مواد المرحلة الثانوية بجميع الشُّعب — علمي علوم، علمي رياضة، وأدبي — مع بث مباشر ومراجعات نهائية.",
  },
};

export const Route = createFileRoute("/stages/$level")({
  beforeLoad: ({ params }) => {
    if (!LEVELS.includes(params.level as Level)) throw notFound();
  },
  head: ({ params }) => {
    const seo = SEO[params.level as Level] ?? SEO.primary;
    const url = `https://nebras-bright-future.lovable.app/stages/${params.level}`;
    return {
      meta: [
        { title: seo.title },
        { name: "description", content: seo.desc },
        { property: "og:title", content: seo.title },
        { property: "og:description", content: seo.desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: StagePage,
});

function StagePage() {
  const { level } = Route.useParams();
  const seo = SEO[level as Level] ?? SEO.primary;
  const { data: stages = [], isLoading: ls } = useStages();
  const { data: courses = [], isLoading: lc } = useCourses();

  const stage = useMemo(() => stages.find((s) => s.level === level) ?? null, [stages, level]);
  const stageCourses = useMemo(() => courses.filter((c) => c.stage?.level === level), [courses, level]);

  const teachers = useMemo(() => {
    const map = new Map<string, { teacher: NonNullable<(typeof stageCourses)[number]["teacher"]>; count: number }>();
    for (const c of stageCourses) {
      if (!c.teacher) continue;
      const e = map.get(c.teacher.id);
      if (e) e.count += 1;
      else map.set(c.teacher.id, { teacher: c.teacher, count: 1 });
    }
    return [...map.values()];
  }, [stageCourses]);

  const isLoading = ls || lc;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="bg-hero pt-32 pb-10 sm:pt-36">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            <GraduationCap className="h-4 w-4" /> المرحلة {levelLabel(level)}ة
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold sm:text-5xl">
            {stage?.name ?? `دورات المرحلة ${levelLabel(level)}ة`}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {stage?.description || seo.intro}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* المدرّسون */}
            <section>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                مدرّسو <span className="text-gradient-gold">{stage?.short ?? levelLabel(level)}</span>
              </h2>
              <p className="mt-2 text-muted-foreground">المدرّسون المتخصّصون لهذه المرحلة.</p>

              {teachers.length === 0 ? (
                <p className="mt-6 text-muted-foreground">لا يوجد مدرّسون مرتبطون بهذه المرحلة بعد.</p>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {teachers.map(({ teacher: t, count }) => {
                    const img = resolveImage(t.image_url);
                    return (
                      <article key={t.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50">
                        <div className="flex gap-4">
                          {img ? (
                            <img src={img} alt={t.name} loading="lazy" width={128} height={128} className="h-20 w-20 shrink-0 rounded-full border-2 border-primary/40 object-cover" />
                          ) : (
                            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/15 text-2xl font-extrabold text-primary">{t.name.trim().charAt(0)}</span>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold">{t.name}</h3>
                            <p className="text-sm font-semibold text-primary">{t.subject}</p>
                            <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                              {stage?.name ?? levelLabel(level)}
                            </span>
                            {t.bio && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t.bio}</p>}
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{t.rating}</span>
                              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-primary" />{count} دورة</span>
                              {t.students_label && <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" />{t.students_label}</span>}
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/teachers/$teacherId"
                          params={{ teacherId: t.id }}
                          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
                        >
                          تفاصيل المدرّس <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* الدورات */}
            <section className="mt-16">
              <h2 className="text-2xl font-extrabold sm:text-3xl">دورات {stage?.short ?? levelLabel(level)}</h2>
              <p className="mt-2 text-muted-foreground">{stageCourses.length} دورة متاحة لهذه المرحلة.</p>

              {stageCourses.length === 0 ? (
                <p className="mt-6 text-muted-foreground">لا توجد دورات لهذه المرحلة حاليًا.</p>
              ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stageCourses.map((course) => {
                    const teacherImg = resolveImage(course.teacher?.image_url);
                    return (
                      <article key={course.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-primary/50">
                        <div className="relative flex items-center gap-3 border-b border-border/60 bg-gradient-to-l from-primary/10 to-transparent p-5">
                          {teacherImg ? (
                            <img src={teacherImg} alt={course.teacher?.name ?? ""} loading="lazy" width={112} height={112} className="h-14 w-14 rounded-full border-2 border-primary/50 object-cover" />
                          ) : (
                            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/15 text-lg font-extrabold text-primary">{(course.teacher?.name ?? "؟").trim().charAt(0)}</span>
                          )}
                          <div>
                            <p className="text-sm font-bold">{course.teacher?.name ?? "مدرّس"}</p>
                            <p className="text-xs text-muted-foreground">{course.subject}</p>
                          </div>
                          {course.badge && <span className="absolute left-4 top-4 rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold text-primary-foreground">{course.badge}</span>}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-lg font-bold leading-snug">{course.title}</h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
                          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" />{course.lessons_count} درس</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />{course.hours} ساعة</span>
                            {course.live_sessions > 0 && <span className="flex items-center gap-1.5"><Video className="h-4 w-4 text-primary" />{course.live_sessions} مباشر</span>}
                          </div>
                          <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                            <div className="flex flex-col">
                              {course.old_price && <span className="text-xs text-muted-foreground line-through">{course.old_price} ج.م</span>}
                              <span className="text-xl font-extrabold text-gradient-gold">{course.price} ج.م</span>
                            </div>
                            <Link to="/courses/$courseId" params={{ courseId: course.id }} className="flex items-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.04]">
                              <ArrowLeft className="h-4 w-4" /> التفاصيل
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="mt-14 flex flex-wrap justify-center gap-3">
              <Link to="/courses" className="rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-gold">كل الدورات</Link>
              <Link to="/" hash="stages" className="rounded-xl border border-border px-6 py-3 text-sm font-bold hover:bg-accent">كل المراحل</Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
