import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Ban, ShieldCheck, Trash2, Search, UserCog, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { listAccounts, banAccount, unbanAccount, deleteAccount, assignUserRole } from "@/lib/admin-accounts.functions";

export const Route = createFileRoute("/_authenticated/admin/accounts")({
  component: AccountsPage,
});

type RoleKey = "admin" | "teacher" | "student" | "secretary" | "customer_service" | "montage";

const ROLE_OPTIONS: { value: RoleKey; label: string; route: string; cls: string }[] = [
  { value: "admin", label: "أدمن", route: "/admin", cls: "bg-primary/15 text-primary" },
  { value: "teacher", label: "مدرّس", route: "/teacher", cls: "bg-blue-500/15 text-blue-400" },
  { value: "student", label: "طالب", route: "/dashboard", cls: "bg-secondary text-muted-foreground" },
  { value: "secretary", label: "سكرتير", route: "/secretary", cls: "bg-pink-500/15 text-pink-400" },
  { value: "customer_service", label: "خدمة عملاء", route: "/support", cls: "bg-emerald-500/15 text-emerald-400" },
  { value: "montage", label: "مونتاج", route: "/montage", cls: "bg-orange-500/15 text-orange-400" },
];

function currentRole(roles: string[]): RoleKey {
  for (const o of ROLE_OPTIONS) if (roles.includes(o.value)) return o.value;
  return "student";
}

function AccountsPage() {
  const fetchAccounts = useServerFn(listAccounts);
  const ban = useServerFn(banAccount);
  const unban = useServerFn(unbanAccount);
  const del = useServerFn(deleteAccount);
  const setRole = useServerFn(assignUserRole);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => fetchAccounts(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-accounts"] });

  const banM = useMutation({
    mutationFn: (a: { userId: string; email: string }) => ban({ data: a }),
    onSuccess: () => { toast.success("تم حظر الحساب."); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الحظر."),
  });
  const unbanM = useMutation({
    mutationFn: (a: { userId: string; email: string }) => unban({ data: a }),
    onSuccess: () => { toast.success("تم رفع الحظر."); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر رفع الحظر."),
  });
  const delM = useMutation({
    mutationFn: (a: { userId: string; email: string }) => del({ data: { ...a, alsoBan: false } }),
    onSuccess: () => { toast.success("تم حذف الحساب."); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الحذف."),
  });
  const roleM = useMutation({
    mutationFn: (a: { userId: string; role: RoleKey }) => setRole({ data: a }),
    onSuccess: (_d, v) => {
      const opt = ROLE_OPTIONS.find((o) => o.value === v.role)!;
      toast.success(`تم التعيين كـ${opt.label}.`);
      invalidate();
      setOpenId(null);
      navigate({ to: opt.route });
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر التعيين."),
  });

  const filtered = accounts.filter(
    (a) =>
      a.email.toLowerCase().includes(q.toLowerCase()) ||
      (a.full_name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div ref={wrapRef}>
      <h1 className="text-2xl font-extrabold sm:text-3xl">
        كل <span className="text-gradient-gold">الحسابات</span>
      </h1>
      <p className="mt-2 text-muted-foreground">
        جميع الحسابات والإيميلات المسجّلة في المنصة ({accounts.length}).
      </p>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالبريد أو الاسم..."
          className="w-full rounded-xl border border-input bg-background/60 px-10 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="bg-card/60 text-muted-foreground">
              <tr>
                <th className="p-3 font-bold">الاسم</th>
                <th className="p-3 font-bold">البريد الإلكتروني</th>
                <th className="p-3 font-bold">النوع</th>
                <th className="p-3 font-bold">الحالة</th>
                <th className="p-3 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const cur = currentRole(a.roles);
                const curOpt = ROLE_OPTIONS.find((o) => o.value === cur)!;
                return (
                  <tr key={a.id} className="border-t border-border/60">
                    <td className="p-3 font-semibold">{a.full_name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{a.email}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${curOpt.cls}`}>{curOpt.label}</span>
                    </td>
                    <td className="p-3">
                      {a.banned ? (
                        <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">محظور</span>
                      ) : (
                        <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-500">نشط</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.banned ? (
                          <button
                            onClick={() => unbanM.mutate({ userId: a.id, email: a.email })}
                            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:bg-accent"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> رفع الحظر
                          </button>
                        ) : (
                          <button
                            onClick={() => banM.mutate({ userId: a.id, email: a.email })}
                            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                          >
                            <Ban className="h-3.5 w-3.5" /> حظر
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setOpenId(openId === a.id ? null : a.id)}
                            className="flex items-center gap-1 rounded-lg border border-primary/40 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/10"
                          >
                            <UserCog className="h-3.5 w-3.5" /> تعيين
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {openId === a.id && (
                            <div className="absolute left-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-popover text-right shadow-lg">
                              {ROLE_OPTIONS.map((o) => {
                                const active = o.value === cur;
                                return (
                                  <button
                                    key={o.value}
                                    disabled={active || roleM.isPending}
                                    onClick={() => {
                                      if (!confirm(`تعيين ${a.email} كـ"${o.label}" وفتح صفحته؟`)) return;
                                      roleM.mutate({ userId: a.id, role: o.value });
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-bold transition-colors ${active ? "bg-secondary text-muted-foreground" : "hover:bg-accent"}`}
                                  >
                                    <span>{o.label}</span>
                                    {active && <span className="text-[10px] text-muted-foreground">الحالي</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`حذف حساب ${a.email} نهائيًا؟`))
                              delM.mutate({ userId: a.id, email: a.email });
                          }}
                          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
