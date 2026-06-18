import { Link, useNavigate } from "@tanstack/react-router";
import { Home, LogOut, ShieldAlert, Loader as Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/hooks/use-auth";
import { useRoles, type AppRole } from "@/hooks/use-roles";

interface StaffShellProps {
  badge: string;
  title: string;
  description: string;
  allowedRoles: AppRole[];
  children: ReactNode;
}

export function StaffShell({ badge, title, description, allowedRoles, children }: StaffShellProps) {
  const { signOut } = useAuth();
  const { roles, isAdmin, isLoading } = useRoles();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allowed = isAdmin || roles.some((r) => allowedRoles.includes(r));
  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-extrabold">غير مصرّح لك</h1>
        <p className="max-w-md text-muted-foreground">الصفحة دي مخصّصة لفريق العمل فقط. تواصل مع الإدارة لو فيه مشكلة.</p>
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
            <span className="hidden rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary sm:inline">{badge}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent">
              <Home className="h-4 w-4" /><span className="hidden sm:inline">الموقع</span>
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-accent">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
