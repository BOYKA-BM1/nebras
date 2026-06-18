import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Courses } from "@/components/site/Courses";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "الدورات والكورسات التعليمية | احجز دورتك على نبراس" },
      {
        name: "description",
        content:
          "تصفّح كل دورات منصة نبراس التعليمية لكل المراحل: ابتدائي وإعدادي وثانوي بكل الشُّعب. حصص مباشرة ومحاضرات مسجّلة واحجز دورتك دلوقتي.",
      },
      { property: "og:title", content: "الدورات التعليمية | نبراس" },
      {
        property: "og:description",
        content: "كل دورات نبراس لكل المراحل الدراسية مع حصص مباشرة ومحاضرات مسجّلة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nebras-bright-future.lovable.app/courses" },
    ],
    links: [{ rel: "canonical", href: "https://nebras-bright-future.lovable.app/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <header className="bg-hero pt-32 pb-6 text-center sm:pt-36">
        <span className="text-sm font-bold uppercase tracking-widest text-primary">
          الدورات
        </span>
        <h1 className="mx-auto mt-3 max-w-3xl px-4 text-3xl font-extrabold sm:text-5xl">
          دورات <span className="text-gradient-gold">سنتك الدراسية</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl px-4 text-lg text-muted-foreground">
          كل الدورات المتاحة لسنتك مع نخبة المدرّسين، حصص مباشرة عبر ZOOM و GOOGLE MEET ومحاضرات مسجّلة بالكامل.
        </p>
      </header>
      <main>
        <Courses hideHeader />
      </main>
      <Footer />
    </div>
  );
}
