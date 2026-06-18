import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useStages, useStageAdmin } from "@/hooks/use-catalog";
import { levels, levelLabel, type Stage } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/stages")({
  component: AdminStages,
});

type FormState = {
  name: string;
  short: string;
  level: string;
  description: string;
  icon: string;
  sort_order: string;
};

const empty: FormState = {
  name: "",
  short: "",
  level: "secondary",
  description: "",
  icon: "GraduationCap",
  sort_order: "0",
};

const icons = ["GraduationCap", "Library", "BookA"];

function AdminStages() {
  const { data: stages = [], isLoading } = useStages();
  const { create, update, remove } = useStageAdmin();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Stage | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [toDelete, setToDelete] = useState<Stage | null>(null);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: Stage) => {
    setEditing(s);
    setForm({
      name: s.name,
      short: s.short ?? "",
      level: s.level,
      description: s.description ?? "",
      icon: s.icon ?? "GraduationCap",
      sort_order: String(s.sort_order),
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("اسم المرحلة مطلوب."); return; }
    const payload = {
      name: form.name.trim(),
      short: form.short.trim() || null,
      level: form.level,
      description: form.description.trim() || null,
      icon: form.icon,
      sort_order: Number(form.sort_order) || 0,
    };
    const onErr = () => toast.error("حصل خطأ، حاول تاني.");
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success("تم التحديث."); setOpen(false); }, onError: onErr });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success("تمت الإضافة."); setOpen(false); }, onError: onErr });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">المراحل الدراسية</h1>
          <p className="mt-1 text-muted-foreground">{stages.length} مرحلة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
          <Plus className="h-4 w-4" /> إضافة مرحلة
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{levelLabel(s.level)}</span>
              </div>
              <h3 className="mt-4 font-bold">{s.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(s)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-accent">
                  <Pencil className="h-3.5 w-3.5" /> تعديل
                </button>
                <button onClick={() => setToDelete(s)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "تعديل المرحلة" : "إضافة مرحلة"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <Field label="اسم المرحلة"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="المرحلة الثانوية" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الاسم المختصر"><Input value={form.short} onChange={(e) => set("short", e.target.value)} placeholder="ثانوي" /></Field>
              <Field label="المستوى">
                <Select value={form.level} onValueChange={(v) => set("level", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="الوصف"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الأيقونة">
                <Select value={form.icon} onValueChange={(v) => set("icon", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {icons.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="الترتيب"><Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending} className="gap-2 bg-gradient-gold text-primary-foreground">
              {(create.isPending || update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المرحلة؟</AlertDialogTitle>
            <AlertDialogDescription>هتحذف «{toDelete?.name}». الدورات المرتبطة هتفضل موجودة بدون مرحلة.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!toDelete) return;
                remove.mutate(toDelete.id, { onSuccess: () => toast.success("تم الحذف."), onError: () => toast.error("تعذّر الحذف.") });
                setToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
