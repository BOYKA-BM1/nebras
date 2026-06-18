import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Users, CalendarClock, Phone } from "lucide-react";
import { StaffShell } from "@/components/site/StaffShell";

export const Route = createFileRoute("/_authenticated/secretary")({
  component: SecretaryDashboard,
});

const cards = [
  { icon: Users, title: "الطلاب", desc: "متابعة بيانات الطلاب والاتصال بهم." },
  { icon: ClipboardList, title: "طلبات الاشتراك", desc: "مراجعة الطلبات الواردة وتأكيدها." },
  { icon: CalendarClock, title: "المواعيد", desc: "تنظيم مواعيد الحصص ومتابعة الجدول." },
  { icon: Phone, title: "التواصل", desc: "متابعة المكالمات والرسائل مع الطلاب." },
];

function SecretaryDashboard() {
  return (
    <StaffShell
      badge="لوحة السكرتارية"
      title="لوحة السكرتارية"
      description="من هنا تقدر تتابع الطلاب، الاشتراكات، والمواعيد."
      allowedRoles={["secretary"]}
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
