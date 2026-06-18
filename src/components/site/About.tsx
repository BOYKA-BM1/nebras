import { Sparkles, Target, Eye, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "رؤيتنا",
    text: "أن نكون المنصة التعليمية الأولى في مصر، نقدّم تعليمًا عالي الجودة يساعد كل طالب على تحقيق أحلامه.",
  },
  {
    icon: Target,
    title: "رسالتنا",
    text: "بناء نظام تعليمي متكامل يجمع بين أحدث التقنيات وأفضل الممارسات لضمان حصول كل طالب على التعليم الذي يستحقه.",
  },
  {
    icon: Sparkles,
    title: "تعليم متطوّر",
    text: "نستخدم أحدث تقنيات التعليم الإلكتروني لتقديم تجربة تعليمية فريدة، تفاعلية، وممتعة في آنٍ واحد.",
  },
  {
    icon: ShieldCheck,
    title: "جودة موثوقة",
    text: "محتوى مُراجَع من نخبة المدرسين، ومتابعة مستمرة لأداء الطالب لضمان أفضل النتائج.",
  },
];

export function About() {
  return (
    <section id="about" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">عن المنصة</span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            عن منصة <span className="text-gradient-gold">نبراس</span> التعليمية
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            نحن منصة تعليمية رائدة تهدف إلى تقديم أفضل تجربة تعليمية للطلاب في جميع المراحل الدراسية.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gradient-gold group-hover:text-primary-foreground">
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
