import { GraduationCap, Library, BookA, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useStages } from "@/hooks/use-catalog";
import { useAuth } from "@/hooks/use-auth";

const iconMap = { GraduationCap, Library, BookA } as const;

const gradesByLevel: Record<string, string[]> = {
  primary: [
    "الصف الأول الابتدائي",
    "الصف الثاني الابتدائي",
    "الصف الثالث الابتدائي",
    "الصف الرابع الابتدائي",
    "الصف الخامس الابتدائي",
    "الصف السادس الابتدائي",
  ],
  prep: [
    "الصف الأول الإعدادي",
    "الصف الثاني الإعدادي",
    "الصف الثالث الإعدادي",
  ],
  secondary: [
    "الصف الأول الثانوي",
    "الصف الثاني الثانوي",
    "الصف الثالث الثانوي",
  ],
};

export function Stages() {
  const { data: stages = [], isLoading } = useStages();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goStage = (level: string) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    navigate({ to: "/stages/$level", params: { level } });
  };



  return (
    <section id="stages" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            المراحل الدراسية
          </span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            نغطّي <span className="text-gradient-gold">كل المراحل</span> وكل السنين
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            من الابتدائي للإعدادي للثانوي بكل الشُّعب — علمي علوم، علمي رياضة، وأدبي.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {stages.map((stage) => {
              const Icon = iconMap[stage.icon as keyof typeof iconMap] ?? GraduationCap;
              const grades = gradesByLevel[stage.level] ?? [];
              return (
                <article
                  key={stage.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1.5 hover:border-primary/50"
                >
                  <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-gold text-primary-foreground shadow-gold">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-2xl font-extrabold">{stage.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {stage.description}
                  </p>

                  {grades.length > 0 && (
                    <ul className="mt-5 grid gap-2">
                      {grades.map((grade) => (
                        <li
                          key={grade}
                          className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-semibold"
                        >
                          <ChevronLeft className="h-4 w-4 text-primary" />
                          {grade}
                        </li>
                      ))}
                    </ul>
                  )}

                  {stage.level === "secondary" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["علمي علوم", "علمي رياضة", "أدبي"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => goStage(stage.level)}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent"
                  >
                    تفاصيل {stage.short ?? stage.name} ومدرّسينها
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
