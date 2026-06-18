import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Settings2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCourses, useTeachers, useStages, useCourseAdmin } from "@/hooks/use-catalog";
import { tracks, courseTypes, trackLabel, resolveImage, type CourseWithRelations } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/courses")({
  component: AdminCourses,
});

type FormState = {
  title: string;
  description: string;
  price: string;
  old_price: string;
  image_url: string;
  stage_id: string;
  teacher_id: string;
  grade: string;
  track: string;
  subject: string;
  type: string;
  lessons_count: string;
  videos_count: string;
  hours: string;
  live_sessions: string;
  badge: string;
  is_published: boolean;
  sort_order: string;
};

const empty: FormState = {
  title: "", description: "", price: "0", old_price: "", image_url: "",
  stage_id: "", teacher_id: "", grade: "", track: "all", subject: "",
  type: "recorded", lessons_count: "0", videos_count: "0", hours: "0",
  live_sessions: "0", badge: "", is_published: true, sort_order: "0",
};

const NONE = "__none__";

function AdminCourses() {
  const { data: courses = [], isLoading } = useCourses();
  const { data: teachers = [] } = useTeachers();
  const { data: stages = [] } = useStages();
  const { create, update, remove } = useCourseAdmin();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseWithRelations | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [toDelete, setToDelete] = useState<CourseWithRelations | null>(null);

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: CourseWithRelations) => {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description ?? "",
      price: String(c.price),
      old_price: c.old_price != null ? String(c.old_price) : "",
      image_url: c.image_url ?? "",
      stage_id: c.stage_id ?? "",
      teacher_id: c.teacher_id ?? "",
      grade: c.grade ?? "",
      track: c.track,
      subject: c.subject ?? "",
      type: c.type,
      lessons_count: String(c.lessons_count),
      videos_count: String(c.videos_count),
      hours: String(c.hours),
      live_sessions: String(c.live_sessions),
      badge: c.badge ?? "",
      is_published: c.is_published,
      sort_order: String(c.sort_order),
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error("عنوان الدورة مطلوب."); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      old_price: form.old_price.trim() ? Number(form.old_price) : null,
      image_url: form.image_url.trim() || null,
      stage_id: form.stage_id || null,
      teacher_id: form.teacher_id || null,
      grade: form.grade.trim() || null,
      track: form.track,
      subject: form.subject.trim() || null,
      type: form.type,
      lessons_count: Number(form.lessons_count) || 0,
      videos_count: Number(form.videos_count) || 0,
      hours: Number(form.hours) || 0,
      live_sessions: Number(form.live_sessions) || 0,
      badge: form.badge.trim() || null,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    };
    const onErr = () => toast.error("حصل خطأ، حاول تاني.");
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { toast.success("تم تحديث الدورة."); setOpen(false); }, onError: onErr });
    } else {
      create.mutate(payload, { onSuccess: () => { toast.success("تمت إضافة الدورة."); setOpen(false); }, onError: onErr });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">الدورات</h1>
          <p className="mt-1 text-muted-foreground">{courses.length} دورة</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
          <Plus className="h-4 w-4" /> إضافة دورة
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {courses.map((c) => {
            const img = resolveImage(c.image_url) || resolveImage(c.teacher?.image_url);
            return (
              <div key={c.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
                {img ? (
                  <img src={img} alt={c.title} className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover" />
                ) : (
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-extrabold text-primary">
                    {c.title.trim().charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug">{c.title}</h3>
                    {c.is_published ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"><Eye className="h-3 w-3" /> منشورة</span>
                    ) : (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"><EyeOff className="h-3 w-3" /> مخفية</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.teacher?.name ?? "—"} · {c.stage?.short ?? "—"} · {trackLabel(c.track)}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-extrabold text-gradient-gold">{c.price} ج.م</span>
                    {c.old_price && <span className="text-xs text-muted-foreground line-through">{c.old_price}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/manage/$courseId" params={{ courseId: c.id }} className="flex items-center gap-1 rounded-lg bg-gradient-gold px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-gold">
                      <Settings2 className="h-3.5 w-3.5" /> المحتوى
                    </Link>
                    <button onClick={() => openEdit(c)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-accent">
                      <Pencil className="h-3.5 w-3.5" /> تعديل
                    </button>
                    <button onClick={() => setToDelete(c)} className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "تعديل الدورة" : "إضافة دورة"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <Field label="عنوان الدورة"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="الوصف"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="المرحلة">
                <Select value={form.stage_id || NONE} onValueChange={(v) => set("stage_id", v === NONE ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="اختر المرحلة" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>بدون</SelectItem>
                    {stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="المدرّس">
                <Select value={form.teacher_id || NONE} onValueChange={(v) => set("teacher_id", v === NONE ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="اختر المدرّس" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>بدون</SelectItem>
                    {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الصف الدراسي"><Input value={form.grade} onChange={(e) => set("grade", e.target.value)} placeholder="الصف الثالث الثانوي" /></Field>
              <Field label="المادة"><Input value={form.subject} onChange={(e) => set("subject", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الشُّعبة">
                <Select value={form.track} onValueChange={(v) => set("track", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="النوع">
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{courseTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="السعر (ج.م)"><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></Field>
              <Field label="السعر قبل الخصم (اختياري)"><Input type="number" value={form.old_price} onChange={(e) => set("old_price", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="عدد الدروس"><Input type="number" value={form.lessons_count} onChange={(e) => set("lessons_count", e.target.value)} /></Field>
              <Field label="عدد الفيديوهات"><Input type="number" value={form.videos_count} onChange={(e) => set("videos_count", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="عدد الساعات"><Input type="number" value={form.hours} onChange={(e) => set("hours", e.target.value)} /></Field>
              <Field label="الحصص المباشرة"><Input type="number" value={form.live_sessions} onChange={(e) => set("live_sessions", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="شارة (Badge)"><Input value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="الأكثر طلبًا" /></Field>
              <Field label="الترتيب"><Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></Field>
            </div>
            <Field label="رابط صورة الدورة (اختياري)"><Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." dir="ltr" /></Field>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <Label className="text-sm">منشورة (تظهر للطلاب)</Label>
              <Switch checked={form.is_published} onCheckedChange={(v) => set("is_published", v)} />
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
            <AlertDialogTitle>حذف الدورة؟</AlertDialogTitle>
            <AlertDialogDescription>هتحذف «{toDelete?.title}» نهائيًا.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!toDelete) return;
                remove.mutate(toDelete.id, { onSuccess: () => toast.success("تم حذف الدورة."), onError: () => toast.error("تعذّر الحذف.") });
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
