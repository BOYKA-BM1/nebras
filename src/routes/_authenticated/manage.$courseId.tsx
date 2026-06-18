import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Loader2, Plus, Pencil, Trash2, ChevronRight, Video, FileText, Layers, GripVertical,
  Radio, Play, Square, Eye, EyeOff, Tv,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRoles } from "@/hooks/use-roles";
import { useCourse, useCourseContent, useSectionAdmin, useLessonAdmin } from "@/hooks/use-content";
import { useCourseAdmin } from "@/hooks/use-catalog";
import { useLiveSessions, useLiveAdmin, type LiveSession } from "@/hooks/use-live";
import { Logo } from "@/components/site/Logo";
import type { Section, Lesson } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/manage/$courseId")({
  component: ManageCourse,
});

function ManageCourse() {
  const { courseId } = Route.useParams();
  const { isAdmin, isTeacher, isLoading: rolesLoading } = useRoles();
  const { data: course } = useCourse(courseId);
  const { sections, isLoading } = useCourseContent(courseId);
  const sectionAdmin = useSectionAdmin(courseId);
  const lessonAdmin = useLessonAdmin(courseId);
  const courseAdmin = useCourseAdmin();
  const { data: liveSessions = [] } = useLiveSessions(courseId);
  const liveAdmin = useLiveAdmin(courseId);

  const [secOpen, setSecOpen] = useState(false);
  const [editSec, setEditSec] = useState<Section | null>(null);
  const [secTitle, setSecTitle] = useState("");

  const [lesOpen, setLesOpen] = useState(false);
  const [editLes, setEditLes] = useState<Lesson | null>(null);
  const [lesSectionId, setLesSectionId] = useState<string | null>(null);
  const [lesForm, setLesForm] = useState<LessonForm>(emptyLesson);

  const [liveOpen, setLiveOpen] = useState(false);
  const [editLive, setEditLive] = useState<LiveSession | null>(null);
  const [liveForm, setLiveForm] = useState<LiveForm>(emptyLive);

  const [delTarget, setDelTarget] = useState<{ type: "section" | "lesson" | "live"; id: string; name: string } | null>(null);

  if (rolesLoading) return <Center><Loader2 className="h-8 w-8 animate-spin text-primary" /></Center>;
  if (!isAdmin && !isTeacher) {
    return (
      <Center>
        <p className="text-muted-foreground">الصفحة دي للمدرّسين والإدارة فقط.</p>
        <Link to="/" className="text-primary underline">الرجوع</Link>
      </Center>
    );
  }

  const realSections = sections.filter((s) => s.id !== "__orphan__");

  const openCreateSec = () => { setEditSec(null); setSecTitle(""); setSecOpen(true); };
  const openEditSec = (s: Section) => { setEditSec(s); setSecTitle(s.title); setSecOpen(true); };
  const saveSec = () => {
    if (!secTitle.trim()) { toast.error("اسم الوحدة مطلوب."); return; }
    const onErr = () => toast.error("حصل خطأ.");
    if (editSec) {
      sectionAdmin.update.mutate({ id: editSec.id, title: secTitle.trim() }, { onSuccess: () => { toast.success("تم التحديث."); setSecOpen(false); }, onError: onErr });
    } else {
      sectionAdmin.create.mutate({ course_id: courseId, title: secTitle.trim(), sort_order: realSections.length }, { onSuccess: () => { toast.success("تمت الإضافة."); setSecOpen(false); }, onError: onErr });
    }
  };

  const openCreateLes = (sectionId: string | null) => { setEditLes(null); setLesSectionId(sectionId); setLesForm(emptyLesson); setLesOpen(true); };
  const openEditLes = (l: Lesson) => {
    setEditLes(l); setLesSectionId(l.section_id);
    setLesForm({
      title: l.title, description: l.description ?? "", video_url: l.video_url ?? "",
      pdf_url: l.pdf_url ?? "", duration_minutes: String(l.duration_minutes), is_free: l.is_free,
    });
    setLesOpen(true);
  };
  const saveLes = () => {
    if (!lesForm.title.trim()) { toast.error("عنوان الدرس مطلوب."); return; }
    const payload = {
      course_id: courseId,
      section_id: lesSectionId,
      title: lesForm.title.trim(),
      description: lesForm.description.trim() || null,
      video_url: lesForm.video_url.trim() || null,
      pdf_url: lesForm.pdf_url.trim() || null,
      duration_minutes: Number(lesForm.duration_minutes) || 0,
      is_free: lesForm.is_free,
    };
    const onErr = () => toast.error("حصل خطأ.");
    if (editLes) {
      lessonAdmin.update.mutate({ id: editLes.id, ...payload }, { onSuccess: () => { toast.success("تم التحديث."); setLesOpen(false); }, onError: onErr });
    } else {
      const count = sections.find((s) => s.id === (lesSectionId ?? "__orphan__"))?.lessons.length ?? 0;
      lessonAdmin.create.mutate({ ...payload, sort_order: count }, { onSuccess: () => { toast.success("تمت الإضافة."); setLesOpen(false); }, onError: onErr });
    }
  };

  const openCreateLive = () => { setEditLive(null); setLiveForm(emptyLive); setLiveOpen(true); };
  const openEditLive = (l: LiveSession) => {
    setEditLive(l);
    setLiveForm({ title: l.title, description: l.description ?? "", embed_url: l.embed_url ?? "" });
    setLiveOpen(true);
  };
  const saveLive = () => {
    if (!liveForm.title.trim()) { toast.error("عنوان البث مطلوب."); return; }
    const payload = {
      course_id: courseId,
      title: liveForm.title.trim(),
      description: liveForm.description.trim() || null,
      embed_url: liveForm.embed_url.trim() || null,
    };
    const onErr = () => toast.error("حصل خطأ.");
    if (editLive) {
      liveAdmin.update.mutate({ id: editLive.id, ...payload }, { onSuccess: () => { toast.success("تم التحديث."); setLiveOpen(false); }, onError: onErr });
    } else {
      liveAdmin.create.mutate({ ...payload, status: "scheduled" }, { onSuccess: () => { toast.success("تمت إضافة البث."); setLiveOpen(false); }, onError: onErr });
    }
  };
  const setLiveStatus = (l: LiveSession, status: string) => {
    liveAdmin.update.mutate(
      { id: l.id, status, ...(status === "live" && !l.starts_at ? { starts_at: new Date().toISOString() } : {}) },
      { onSuccess: () => toast.success(status === "live" ? "بدأ البث المباشر 🔴" : "تم إنهاء البث."), onError: () => toast.error("تعذّر التحديث.") },
    );
  };

  const togglePublish = () => {
    if (!course) return;
    courseAdmin.update.mutate(
      { id: course.id, is_published: !course.is_published },
      { onSuccess: () => toast.success(course.is_published ? "تم إخفاء الدورة." : "تم نشر الدورة ✅"), onError: () => toast.error("تعذّر التحديث.") },
    );
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    const onErr = () => toast.error("تعذّر الحذف.");
    if (delTarget.type === "section") sectionAdmin.remove.mutate(delTarget.id, { onSuccess: () => toast.success("تم الحذف."), onError: onErr });
    else if (delTarget.type === "live") liveAdmin.remove.mutate(delTarget.id, { onSuccess: () => toast.success("تم الحذف."), onError: onErr });
    else lessonAdmin.remove.mutate(delTarget.id, { onSuccess: () => toast.success("تم الحذف."), onError: onErr });
    setDelTarget(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <Link to={isAdmin ? "/admin/courses" : "/teacher"} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent">
            <ChevronRight className="h-4 w-4" /> رجوع
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">إدارة محتوى الدورة</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{course?.title ?? "..."}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={togglePublish} variant="outline" disabled={courseAdmin.update.isPending} className="gap-2">
              {course?.is_published ? <><EyeOff className="h-4 w-4" /> إخفاء</> : <><Eye className="h-4 w-4" /> نشر الدورة</>}
            </Button>
            <Button onClick={openCreateSec} className="gap-2 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90">
              <Plus className="h-4 w-4" /> وحدة
            </Button>
          </div>
        </div>

        <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${course?.is_published ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {course?.is_published ? "منشورة — ظاهرة للطلاب" : "مسودّة — غير ظاهرة"}
        </span>

        {/* البث المباشر */}
        <section className="mt-8 rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-secondary/40 px-5 py-3">
            <div className="flex items-center gap-2 font-bold">
              <Radio className="h-4 w-4 text-primary" /> البث المباشر
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{liveSessions.length}</span>
            </div>
            <Button size="sm" onClick={openCreateLive} className="gap-2 bg-gradient-gold text-primary-foreground">
              <Plus className="h-4 w-4" /> محاضرة بث
            </Button>
          </div>
          {liveSessions.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">
              لسه مفيش بثوث. اضغط «محاضرة بث» وضيف عنوان ورابط البث (Bunny Live / YouTube / Zoom)، وابدأ البث المباشر بضغطة.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {liveSessions.map((l) => {
                const isLive = l.status === "live";
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <Tv className={`h-4 w-4 shrink-0 ${isLive ? "text-destructive" : "text-primary"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        {l.title}
                        {isLive && <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">🔴 مباشر الآن</span>}
                        {l.status === "ended" && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">منتهٍ</span>}
                        {l.status === "scheduled" && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">مجدول</span>}
                      </p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{l.embed_url || "بدون رابط بث"}</p>
                    </div>
                    {isLive ? (
                      <Button size="sm" variant="outline" onClick={() => setLiveStatus(l, "ended")} className="gap-1.5 text-destructive">
                        <Square className="h-3.5 w-3.5" /> إنهاء
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setLiveStatus(l, "live")} className="gap-1.5 bg-gradient-gold text-primary-foreground">
                        <Play className="h-3.5 w-3.5" /> ابدأ البث
                      </Button>
                    )}
                    <IconBtn onClick={() => openEditLive(l)} title="تعديل"><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn onClick={() => setDelTarget({ type: "live", id: l.id, name: l.title })} title="حذف" danger><Trash2 className="h-4 w-4" /></IconBtn>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <h2 className="mt-10 text-lg font-extrabold">وحدات ودروس الدورة</h2>

        {isLoading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : realSections.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <Layers className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">ابدأ بإضافة وحدة (Section) ثم دروسها.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {realSections.map((s) => (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-secondary/40 px-5 py-3">
                  <div className="flex items-center gap-2 font-bold">
                    <GripVertical className="h-4 w-4 text-muted-foreground" /> {s.title}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{s.lessons.length} درس</span>
                  </div>
                  <div className="flex gap-1">
                    <IconBtn onClick={() => openCreateLes(s.id)} title="درس"><Plus className="h-4 w-4" /></IconBtn>
                    <IconBtn onClick={() => openEditSec(s)} title="تعديل"><Pencil className="h-4 w-4" /></IconBtn>
                    <IconBtn onClick={() => setDelTarget({ type: "section", id: s.id, name: s.title })} title="حذف" danger><Trash2 className="h-4 w-4" /></IconBtn>
                  </div>
                </div>
                <ul className="divide-y divide-border/60">
                  {s.lessons.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                      <Video className="h-4 w-4 shrink-0 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.duration_minutes}د {l.video_url ? "· فيديو" : "· بدون فيديو"} {l.pdf_url ? "· PDF" : ""} {l.is_free ? "· مجاني" : ""}
                        </p>
                      </div>
                      {l.pdf_url && <FileText className="h-4 w-4 text-muted-foreground" />}
                      <IconBtn onClick={() => openEditLes(l)} title="تعديل"><Pencil className="h-4 w-4" /></IconBtn>
                      <IconBtn onClick={() => setDelTarget({ type: "lesson", id: l.id, name: l.title })} title="حذف" danger><Trash2 className="h-4 w-4" /></IconBtn>
                    </li>
                  ))}
                  {s.lessons.length === 0 && (
                    <li className="px-5 py-3 text-sm text-muted-foreground">لا توجد دروس بعد — اضغط + لإضافة درس.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* وحدة */}
      <Dialog open={secOpen} onOpenChange={setSecOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSec ? "تعديل الوحدة" : "إضافة وحدة"}</DialogTitle></DialogHeader>
          <div className="grid gap-1.5 py-2">
            <Label>اسم الوحدة</Label>
            <Input value={secTitle} onChange={(e) => setSecTitle(e.target.value)} placeholder="الوحدة الأولى: المقدمة" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecOpen(false)}>إلغاء</Button>
            <Button onClick={saveSec} disabled={sectionAdmin.create.isPending || sectionAdmin.update.isPending} className="gap-2 bg-gradient-gold text-primary-foreground">
              {(sectionAdmin.create.isPending || sectionAdmin.update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* درس */}
      <Dialog open={lesOpen} onOpenChange={setLesOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editLes ? "تعديل الدرس" : "إضافة درس"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <F label="عنوان الدرس"><Input value={lesForm.title} onChange={(e) => setLesForm({ ...lesForm, title: e.target.value })} /></F>
            <F label="الوحدة">
              <Select value={lesSectionId ?? "none"} onValueChange={(v) => setLesSectionId(v === "none" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون وحدة</SelectItem>
                  {realSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
            <F label="رابط الفيديو (Bunny / YouTube / mp4)">
              <Input value={lesForm.video_url} onChange={(e) => setLesForm({ ...lesForm, video_url: e.target.value })} placeholder="https://iframe.mediadelivery.net/embed/..." dir="ltr" />
            </F>
            <F label="رابط ملف PDF (اختياري)">
              <Input value={lesForm.pdf_url} onChange={(e) => setLesForm({ ...lesForm, pdf_url: e.target.value })} dir="ltr" />
            </F>
            <div className="grid grid-cols-2 gap-4">
              <F label="المدة (دقائق)"><Input type="number" value={lesForm.duration_minutes} onChange={(e) => setLesForm({ ...lesForm, duration_minutes: e.target.value })} /></F>
              <div className="flex items-end gap-3 pb-2">
                <Switch checked={lesForm.is_free} onCheckedChange={(v) => setLesForm({ ...lesForm, is_free: v })} />
                <Label>درس مجاني (معاينة)</Label>
              </div>
            </div>
            <F label="الوصف"><Textarea rows={3} value={lesForm.description} onChange={(e) => setLesForm({ ...lesForm, description: e.target.value })} /></F>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLesOpen(false)}>إلغاء</Button>
            <Button onClick={saveLes} disabled={lessonAdmin.create.isPending || lessonAdmin.update.isPending} className="gap-2 bg-gradient-gold text-primary-foreground">
              {(lessonAdmin.create.isPending || lessonAdmin.update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* بث مباشر */}
      <Dialog open={liveOpen} onOpenChange={setLiveOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editLive ? "تعديل محاضرة البث" : "محاضرة بث جديدة"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <F label="عنوان المحاضرة"><Input value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} placeholder="مراجعة نهائية مباشرة" /></F>
            <F label="رابط البث (Bunny Live / YouTube / Zoom / mp4)">
              <Input value={liveForm.embed_url} onChange={(e) => setLiveForm({ ...liveForm, embed_url: e.target.value })} placeholder="https://..." dir="ltr" />
            </F>
            <F label="الوصف (اختياري)"><Textarea rows={3} value={liveForm.description} onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })} /></F>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiveOpen(false)}>إلغاء</Button>
            <Button onClick={saveLive} disabled={liveAdmin.create.isPending || liveAdmin.update.isPending} className="gap-2 bg-gradient-gold text-primary-foreground">
              {(liveAdmin.create.isPending || liveAdmin.update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <AlertDialog open={!!delTarget} onOpenChange={(o) => !o && setDelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هتحذف «{delTarget?.name}». {delTarget?.type === "section" ? "الدروس بداخلها هتفضل بدون وحدة." : ""}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type LessonForm = { title: string; description: string; video_url: string; pdf_url: string; duration_minutes: string; is_free: boolean };
const emptyLesson: LessonForm = { title: "", description: "", video_url: "", pdf_url: "", duration_minutes: "0", is_free: false };

type LiveForm = { title: string; description: string; embed_url: string };
const emptyLive: LiveForm = { title: "", description: "", embed_url: "" };

function Center({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}
function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title} className={`rounded-lg border border-border p-2 transition-colors hover:bg-accent ${danger ? "text-destructive hover:bg-destructive/10" : ""}`}>
      {children}
    </button>
  );
}
