import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Loader2, LayoutDashboard, BookOpen, Users, GraduationCap, LogOut, ShieldAlert, Home, Ticket, UsersRound } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRoles } from "@/hooks/use-roles";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { to: "/admin/courses", label: "الدورات", icon: BookOpen, exact: false },
  { to: "/admin/teachers", label: "المدرّسون", icon: Users, exact: false },
  { to: "/admin/accounts", label: "الحسابات", icon: UsersRound, exact: false },
  { to: "/admin/stages", label: "المراحل", icon: GraduationCap, exact: false },
  { to: "/admin/coupons", label: "الكوبونات", icon: Ticket, exact: false },
];


function AdminLayout() {
  const { signOut } = useAuth();
  const { isAdmin, isLoading } = useRoles();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-extrabold">غير مصرّح لك</h1>
        <p className="max-w-md text-muted-foreground">
          الصفحة دي مخصّصة لإدارة المنصة فقط. لو محتاج صلاحية أدمن تواصل مع المسؤول.
        </p>
        <Link to="/" className="rounded-xl bg-gradient-gold px-6 py-3 text-sm font-bold text-primary-foreground shadow-gold">
          الرجوع للرئيسية
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary sm:inline">
              لوحة الإدارة
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold transition-colors hover:bg-accent">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">الموقع</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm font-bold transition-colors hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  active ? "bg-gradient-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
