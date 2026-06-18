import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Camera, Save, ArrowLeft, Home, Phone, MessageCircle, User as UserIcon, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile, useUploadAvatar, profileCompletion } from "@/hooks/use-profile";
import { resolveImage } from "@/lib/catalog";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "", phone: "", whatsapp: "", parent_phone: "", birthdate: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        whatsapp: profile.whatsapp ?? "",
        parent_phone: profile.parent_phone ?? "",
        birthdate: profile.birthdate ?? "",
      });
    }
  }, [profile]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const { percent, complete } = profileCompletion({ ...(profile as any), ...form });
  const avatar = resolveImage(profile?.avatar_url);
  const initial = (form.full_name || user?.email || "ط").trim().charAt(0);

  const save = () => {
    if (!form.full_name.trim()) { toast.error("اكتب اسمك بالكامل."); return; }
    update.mutate(form, {
      onSuccess: () => toast.success("تم حفظ بياناتك ✅"),
      onError: () => toast.error("حصل خطأ، حاول تاني."),
    });
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("الصورة لازم تكون أقل من 5 ميجا."); return; }
    uploadAvatar.mutate(f, {
      onSuccess: () => toast.success("تم تحديث صورتك."),
      onError: () => toast.error("تعذّر رفع الصورة."),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-bold hover:bg-accent"><Home className="h-4 w-4" /><span className="hidden sm:inline">لوحتي</span></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">ملفي الشخصي</h1>

        {/* اكتمال الملف */}
        <div className="mt-6 flex items-center gap-5 rounded-3xl border border-border bg-card p-5 shadow-card">
          <CompletionRing percent={percent} />
          <div className="min-w-0">
            <p className="font-extrabold">{complete ? "ملفك مكتمل ✅" : "أكمل بياناتك"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {complete ? "تقدر تحجز دوراتك دلوقتي." : "لازم تكمّل بياناتك علشان تقدر تحجز الدورات وتشترك."}
            </p>
          </div>
        </div>

        {/* الصورة */}
        <div className="mt-6 flex items-center gap-5">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt={form.full_name} className="h-24 w-24 rounded-full border-4 border-card object-cover" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-3xl font-extrabold text-primary">{initial}</span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold"
              aria-label="تغيير الصورة"
            >
              {uploadAvatar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          </div>
          <div>
            <p className="font-bold">{form.full_name || "طالب نبراس"}</p>
            <p className="text-sm text-muted-foreground" dir="ltr">{user?.email}</p>
          </div>
        </div>

        {/* الحقول */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field icon={UserIcon} label="الاسم بالكامل" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} placeholder="مثال: أحمد محمد" />
          <Field icon={Calendar} label="تاريخ الميلاد" type="date" value={form.birthdate} onChange={(v) => setForm({ ...form, birthdate: v })} />
          <Field icon={Phone} label="رقم الهاتف" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="01xxxxxxxxx" dir="ltr" />
          <Field icon={MessageCircle} label="رقم واتساب" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="01xxxxxxxxx" dir="ltr" />
          <Field icon={Users} label="رقم ولي الأمر" value={form.parent_phone} onChange={(v) => setForm({ ...form, parent_phone: v })} placeholder="01xxxxxxxxx" dir="ltr" />
        </div>

        <button
          onClick={save}
          disabled={update.isPending}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-bold text-primary-foreground shadow-gold transition-transform hover:scale-[1.01] disabled:opacity-70 sm:w-auto sm:px-8"
        >
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ البيانات
        </button>

        {complete && (
          <Link to="/courses" className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            تصفّح الدورات <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
      </main>
    </div>
  );
}

function Field({
  icon: Icon, label, value, onChange, placeholder, type = "text", dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; dir?: "ltr" | "rtl";
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <span className="relative">
        <Icon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          dir={dir}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-input bg-background/60 px-10 py-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </span>
    </label>
  );
}

function CompletionRing({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--secondary)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-500" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold">{percent}%</span>
    </div>
  );
}
