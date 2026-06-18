import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Lectures } from "@/components/site/Lectures";
import { HelpCenter } from "@/components/site/HelpCenter";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "نبراس | أقوى منصة تعليمية في مصر لكل المراحل" },
      {
        name: "description",
        content:
          "نبراس منصة تعليمية متطورة تجمع أفضل المدرسين في مصر، دروس وفيديوهات تفاعلية وبث مباشر لكل المراحل الدراسية: ابتدائي وإعدادي وثانوي.",
      },
      { property: "og:title", content: "نبراس | أقوى منصة تعليمية في مصر" },
      {
        property: "og:description",
        content: "أفضل المدرسين وأحدث التقنيات لتعليم الطلاب في كل مصر مع منصة نبراس.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://nebras-bright-future.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://nebras-bright-future.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "منصة نبراس التعليمية",
          url: "https://nebras-bright-future.lovable.app/",
          description:
            "منصة تعليمية مصرية تقدّم دروسًا وبثًا مباشرًا لكل المراحل: ابتدائي وإعدادي وثانوي.",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Lectures />
        <HelpCenter />
      </main>
      <Footer />
    </div>
  );
}
