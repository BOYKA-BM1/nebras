import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Users, GraduationCap, CheckCircle2, Loader2, Wallet, UserCheck, Eye } from "lucide-react";
import { useCourses, useTeachers, useStages } from "@/hooks/use-catalog";
import { useAdminMetrics } from "@/hooks/use-admin";
import { usePlatformStats } from "@/hooks/use-stats";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: courses = [], isLoading: lc } = useCourses();
  const { data: teachers = [], isLoading: lt } = useTeachers();
  const { data: stages = [], isLoading: ls } = useStages();
  const { data: metrics, isLoading: lm } = useAdminMetrics();
  const { data: platform } = usePlatformStats();

  const isLoading = lc || lt || ls || lm;
  const published = courses.filter((c) => c.is_published).length;

  const stats = [
    { label: "الإيرادات", value: `${metrics?.revenue ?? 0} ج.م`, icon: Wallet, to: "/admin/courses" },
    { label: "الاشتراكات", value: metrics?.enrollments ?? 0, icon: UserCheck, to: "/admin/courses" },
    { label: "زيارات المنصة", value: platform?.visits ?? 0, icon: Eye, to: "/admin/accounts" },
    { label: "إجمالي الطلاب", value: platform?.students ?? 0, icon: Users, to: "/admin/accounts" },
    { label: "إجمالي الدورات", value: courses.length, icon: BookOpen, to: "/admin/courses" },
    { label: "الدورات المنشورة", value: published, icon: CheckCircle2, to: "/admin/courses" },
    { label: "المدرّسون", value: teachers.length, icon: Users, to: "/admin/teachers" },
    { label: "المراحل الدراسية", value: stages.length, icon: GraduationCap, to: "/admin/stages" },
  ] as const;


  return (
    <div>
      <h1 className="text-2xl font-extrabold sm:text-3xl">
        نظرة <span className="text-gradient-gold">عامة</span>
      </h1>
      <p className="mt-2 text-muted-foreground">إدارة محتوى منصة نبراس من مكان واحد.</p>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-primary/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div className="mt-4 text-3xl font-extrabold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <QuickAction to="/admin/courses" icon={BookOpen} title="إضافة دورة" text="أضف دورة جديدة بسعرها ومرحلتها ومدرّسها." />
        <QuickAction to="/admin/teachers" icon={Users} title="إضافة مدرّس" text="أضف مدرّسًا جديدًا بمادته ونبذته وخبرته." />
        <QuickAction to="/admin/stages" icon={GraduationCap} title="إدارة المراحل" text="نظّم المراحل الدراسية وترتيبها." />
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  text,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-2 rounded-2xl border border-dashed border-border bg-card/50 p-5 transition-colors hover:border-primary/60 hover:bg-card"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-2 font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </Link>
  );
}
