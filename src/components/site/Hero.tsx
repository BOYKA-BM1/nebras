import { Star, Users, BookOpen, PlayCircle, Eye } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import heroBanner from "@/assets/hero-banner.jpg";
import { usePlatformStats, useTrackVisit } from "@/hooks/use-stats";
import { useAuth } from "@/hooks/use-auth";

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return String(n);
}

export function Hero() {
  useTrackVisit();
  const { data: s } = usePlatformStats();
  const { user } = useAuth();
  const navigate = useNavigate();
  const startLearning = () => navigate({ to: user ? "/courses" : "/auth" });
  const stats = [
    { value: fmt(s?.students ?? 0), label: "طالب", icon: Users },
    { value: fmt(s?.courses ?? 0), label: "دورة", icon: BookOpen },
    { value: fmt(s?.lessons ?? 0), label: "فيديو", icon: PlayCircle },
    { value: fmt(s?.visits ?? 0), label: "زيارة", icon: Eye },
  ];

  return (
    <section id="home" className="relative overflow-hidden bg-hero pt-28 pb-20 sm:pt-36">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -left-24 top-64 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="text-center lg:text-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <Star className="h-4 w-4 fill-primary" />
            أقوى منصة تعليمية في مصر
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-6xl">
            مرحبًا بك في
            <br />
            <span className="text-gradient-gold">منصة نبراس التعليمية</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
            منصة تعليمية متطورة تجمع أحدث التقنيات مع أفضل المدرّسين في مصر،
            لتقديم تجربة تعليمية لا مثيل لها لكل المراحل الدراسية.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <button
              onClick={startLearning}
              className="w-full rounded-xl bg-gradient-gold px-7 py-3.5 text-center text-base font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.03] sm:w-auto"
            >
              ابدأ التعلم الآن
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-primary/20 blur-3xl" />
          <img
            src={heroBanner}
            alt="منصة نبراس التعليمية"
            width={1024}
            height={1024}
            className="animate-float-slow mx-auto w-full max-w-md rounded-[2rem] border border-border/60 shadow-card"
          />
        </div>
      </div>
    </section>
  );
}
