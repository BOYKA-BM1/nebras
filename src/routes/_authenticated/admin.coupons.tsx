import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Loader2, Ticket, Power } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoupons, useCouponAdmin } from "@/hooks/use-admin";
import { useTeachers } from "@/hooks/use-catalog";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: AdminCoupons,
});

function AdminCoupons() {
  const { data: coupons = [], isLoading } = useCoupons();
  const { data: teachers = [] } = useTeachers();
  const { create, update, remove } = useCouponAdmin();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: "", discount_amount: "", max_uses: "", teacher_id: "" });

  const teacherName = useMemo(() => {
    const m = new Map(teachers.map((t) => [t.id, t.name]));
    return (id: string | null) => (id ? m.get(id) ?? "—" : "كل المدرّسين");
  }, [teachers]);

  const save = () => {
    if (!form.code.trim()) { toast.error("كود الخصم مطلوب."); return; }
    if (!form.teacher_id) { toast.error("اختر المدرّس اللي هيشتغل عنده الكوبون."); return; }
    create.mutate(
      {
        code: form.code.trim().toUpperCase(),
        discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
        discount_amount: form.discount_amount ? Number(form.discount_amount) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        teacher_id: form.teacher_id,
      },
      {
        onSuccess: () => { toast.success("تم إنشاء الكوبون."); setOpen(false); setForm({ code: "", discount_percent: "", discount_amount: "", max_uses: "", teacher_id: "" }); },
        onError: (e) => toast.error(/duplicate|unique/i.test(String((e as Error).message)) ? "الكود موجود بالفعل." : "حصل خطأ."),
      },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">كوبونات الخصم</h1>
          <p className="mt-1 text-muted-foreground">{coupons.length} كوبون</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
          <Plus className="h-4 w-4" /> كوبون جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : coupons.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Ticket className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">لا توجد كوبونات بعد.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-primary/10 px-3 py-1 font-mono text-sm font-bold text-primary" dir="ltr">{c.code}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.is_active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{c.is_active ? "فعّال" : "موقوف"}</span>
              </div>
              <p className="mt-3 text-lg font-extrabold text-gradient-gold">
                {c.discount_percent ? `${c.discount_percent}%` : c.discount_amount ? `${c.discount_amount} ج.م` : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">المدرّس: {teacherName(c.teacher_id)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                استُخدم {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""} مرة
              </p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => update.mutate({ id: c.id, is_active: !c.is_active })} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-accent">
                  <Power className="h-3.5 w-3.5" /> {c.is_active ? "إيقاف" : "تفعيل"}
                </button>
                <button onClick={() => remove.mutate(c.id, { onSuccess: () => toast.success("تم الحذف.") })} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>كوبون جديد</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5"><Label>الكود</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SUMMER25" dir="ltr" /></div>
            <div className="grid gap-1.5">
              <Label>المدرّس</Label>
              <Select value={form.teacher_id} onValueChange={(v) => setForm({ ...form, teacher_id: v })}>
                <SelectTrigger><SelectValue placeholder="اختر المدرّس" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} — {t.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>نسبة الخصم %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} placeholder="25" /></div>
              <div className="grid gap-1.5"><Label>أو قيمة (ج.م)</Label><Input type="number" value={form.discount_amount} onChange={(e) => setForm({ ...form, discount_amount: e.target.value })} placeholder="50" /></div>
            </div>
            <div className="grid gap-1.5"><Label>حد الاستخدام (اختياري)</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="100" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={save} disabled={create.isPending} className="gap-2 bg-gradient-gold text-primary-foreground">
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
