import { Star, BookOpen, Users, Loader as Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTeachers } from "@/hooks/use-catalog";
import { useCourses } from "@/hooks/use-catalog";
import { resolveImage } from "@/lib/catalog";
import { useMemo } from "react";

export function Teachers() {
  const { data: teachers = [], isLoading } = useTeachers();
  const { data: courses = [] } = useCourses();

  const courseCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of courses) {
      if (c.teacher_id) map.set(c.teacher_id, (map.get(c.teacher_id) ?? 0) + 1);
    }
    return map;
  }, [courses]);

  return (
    <section id="teachers" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">المدرسون</span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            نخبة <span className="text-gradient-gold">المدرّسين</span> في مصر
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            فريق من أفضل المدرّسين المتخصّصين في كل مادة لكل المراحل الدراسية.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => {
              const img = resolveImage(t.image_url);
              return (
                <article
                  key={t.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card text-center shadow-card transition-all hover:-translate-y-1.5 hover:border-primary/50"
                >
                  <div className="relative mx-auto mt-8 h-32 w-32">
                    <div className="absolute inset-0 rounded-full bg-gradient-gold blur-md opacity-60 transition-opacity group-hover:opacity-90" />
                    {img ? (
                      <img
                        src={img}
                        alt={t.name}
                        loading="lazy"
                        width={512}
                        height={512}
                        className="relative h-32 w-32 rounded-full border-4 border-card object-cover"
                      />
                    ) : (
                      <span className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-card bg-primary/15 text-4xl font-extrabold text-primary">
                        {t.name.trim().charAt(0)}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-primary">{t.subject}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.bio}</p>

                    <div className="mt-5 flex items-center justify-center gap-5 border-t border-border/60 pt-4 text-sm text-muted-foreground">
                      {t.students_label && (
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          {t.students_label}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {courseCount.get(t.id) ?? 0} دورات
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        {t.rating}
                      </span>
                    </div>

                    <Link
                      to="/teachers/$teacherId"
                      params={{ teacherId: t.id }}
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
                    >
                      التفاصيل <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
