import {
  Video,
  PlayCircle,
  MessageSquare,
  FileCheck2,
  Bell,
  Smartphone,
} from "lucide-react";
import { lectureFeatures } from "@/data/site";

const iconMap = {
  Video,
  PlayCircle,
  MessageSquare,
  FileCheck2,
  Bell,
  Smartphone,
} as const;

export function Lectures() {
  return (
    <section id="lectures" className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-80 max-w-4xl rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            المحاضرات التفاعلية
          </span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            حصص <span className="text-gradient-gold">مباشرة عبر ZOOM و GOOGLE MEET</span> + تسجيل كامل
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            احضر مباشرة وتفاعل مع المدرّس، ولو فاتتك الحصة شوفها مسجّلة بالكامل في أي وقت.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lectureFeatures.map((f) => {
            const Icon = iconMap[f.icon as keyof typeof iconMap] ?? Video;
            return (
              <article
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-gold group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
