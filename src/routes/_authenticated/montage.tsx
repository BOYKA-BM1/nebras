import { createFileRoute } from "@tanstack/react-router";
import { Video, Upload, Scissors, FileVideo2 } from "lucide-react";
import { StaffShell } from "@/components/site/StaffShell";

export const Route = createFileRoute("/_authenticated/montage")({
  component: MontageDashboard,
});

const cards = [
  { icon: Upload, title: "رفع الفيديوهات", desc: "ارفع دروس جديدة وحدّث الموجود." },
  { icon: Scissors, title: "تعديل ومونتاج", desc: "قص، تركيب، ومراجعة جودة الفيديوهات." },
  { icon: FileVideo2, title: "مكتبة الفيديوهات", desc: "أرشيف منظّم لكل فيديوهات الدروس." },
  { icon: Video, title: "البث المباشر", desc: "تجهيز ومتابعة الحصص المباشرة." },
];

function MontageDashboard() {
  return (
    <StaffShell
      badge="لوحة المونتاج"
      title="قسم المونتاج"
      description="من هنا تقدر ترفع وتجهّز فيديوهات الدروس قبل نشرها."
      allowedRoles={["montage"]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <c.icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </StaffShell>
  );
}
