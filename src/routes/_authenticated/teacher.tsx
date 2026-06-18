import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, BookOpen, Settings2, LogOut, Home, ShieldAlert, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-roles";
import { useCourses } from "@/hooks/use-catalog";
import { Logo } from "@/components/site/Logo";
import { resolveImage } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/teacher")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isTeacher, isAdmin, isLoading } = useRoles();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();

  const myCourses = useMemo(() => {
    if (isAdmin) return courses;
    return courses.filter((c) => c.teacher?.user_id === user?.id);
  }, [courses, isAdmin, user?.id]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isTeacher && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive"><ShieldAlert className="h-8 w-8" /></span>
        <h1 className="text-2xl font-extrabold">غير مصرّح لك</h1>
        <p className="max-w-md text-muted-foreground">الصفحة دي مخصّصة للمدرّسين. لو إنت مدرّس وعايز حساب، تواصل مع الإدارة.</p>
        <Link to="/" className="rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-gold">الرجوع للرئيسية</Link>
      </div>
    );
  }

  const handleSignOut = async () => { await signOut(); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary sm:inline">لوحة المدرّس</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent"><Home className="h-4 w-4" /><span className="hidden sm:inline">الموقع</span></Link>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-accent"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">خروج</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">دوراتي</h1>
        <p className="mt-1 text-muted-foreground">{isAdmin ? "بصفتك أدمن تقدر تدير محتوى كل الدورات." : "أدِر محتوى دوراتك ودروسك من هنا."}</p>

        {coursesLoading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : myCourses.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">لا توجد دورات مرتبطة بحسابك بعد. تواصل مع الإدارة لربط دوراتك.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => {
              const img = resolveImage(c.image_url) ?? resolveImage(c.teacher?.image_url);
              return (
                <div key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  {img ? <img src={img} alt={c.title} className="h-32 w-full object-cover" /> : <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/15 to-transparent"><BookOpen className="h-8 w-8 text-primary/50" /></div>}
                  <div className="p-4">
                    <h3 className="font-bold leading-snug line-clamp-2">{c.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.subject}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5 text-primary" />{c.lessons_count} درس</span>
                      <span className={`rounded-full px-2 py-0.5 ${c.is_published ? "bg-primary/10 text-primary" : "bg-secondary"}`}>{c.is_published ? "منشورة" : "مسودّة"}</span>
                    </div>
                    <Link to="/manage/$courseId" params={{ courseId: c.id }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2 text-sm font-bold text-primary-foreground shadow-gold">
                      <Settings2 className="h-4 w-4" /> إدارة المحتوى
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
