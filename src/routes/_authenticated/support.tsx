import { createFileRoute } from "@tanstack/react-router";
import { Headphones, MessageCircle, LifeBuoy, Ticket } from "lucide-react";
import { StaffShell } from "@/components/site/StaffShell";

export const Route = createFileRoute("/_authenticated/support")({
  component: SupportDashboard,
});

const cards = [
  { icon: MessageCircle, title: "محادثات الطلاب", desc: "الرد على استفسارات الطلاب وأولياء الأمور." },
  { icon: Ticket, title: "التذاكر المفتوحة", desc: "متابعة الشكاوى والطلبات حتى يتم حلها." },
  { icon: LifeBuoy, title: "المساعدة الفنية", desc: "حل المشاكل البسيطة للطلاب على المنصة." },
  { icon: Headphones, title: "تقارير الدعم", desc: "ملخص يومي بحالات الدعم." },
];

function SupportDashboard() {
  return (
    <StaffShell
      badge="لوحة خدمة العملاء"
      title="خدمة العملاء"
      description="ساعد طلابنا في أي وقت — كل أدوات التواصل وحل المشاكل في مكان واحد."
      allowedRoles={["customer_service"]}
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
