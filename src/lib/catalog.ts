import type { Database } from "@/integrations/supabase/types";
import teacher1 from "@/assets/teacher-1.jpg";
import teacher2 from "@/assets/teacher-2.jpg";
import teacher3 from "@/assets/teacher-3.jpg";
import teacher4 from "@/assets/teacher-4.jpg";
import teacher5 from "@/assets/teacher-5.jpg";
import teacher6 from "@/assets/teacher-6.jpg";

export type Stage = Database["public"]["Tables"]["stages"]["Row"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export type CourseWithRelations = Course & {
  teacher: Teacher | null;
  stage: Stage | null;
};

export type SectionWithLessons = Section & { lessons: Lesson[] };

/** يحوّل رابط فيديو (Bunny / YouTube / mp4) لرابط مشغّل قابل للتضمين */
export function toEmbedUrl(url?: string | null): { kind: "iframe" | "video" | "none"; src: string } {
  if (!url) return { kind: "none", src: "" };
  const u = url.trim();
  // Bunny Stream: iframe.mediadelivery.net/embed/{libraryId}/{videoId} أو play link
  if (/mediadelivery\.net|iframe\.mediadelivery/.test(u)) {
    return { kind: "iframe", src: u.includes("/embed/") ? u : u };
  }
  // YouTube
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  // Vimeo
  const vm = u.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  // ملف فيديو مباشر
  if (/\.(mp4|webm|m3u8|mov)(\?|$)/i.test(u)) return { kind: "video", src: u };
  // افتراضي: iframe
  return { kind: "iframe", src: u };
}

export function priceAfterCoupon(price: number, coupon?: { discount_percent: number | null; discount_amount: number | null } | null): number {
  if (!coupon) return price;
  let p = price;
  if (coupon.discount_percent) p = p - (p * coupon.discount_percent) / 100;
  if (coupon.discount_amount) p = p - coupon.discount_amount;
  return Math.max(0, Math.round(p));
}

/* خريطة الصور المدمجة (للبيانات الأولية) — أي قيمة تبدأ بـ http أو / تُستخدم كما هي */
const BUNDLED_IMAGES: Record<string, string> = {
  "teacher-1": teacher1,
  "teacher-2": teacher2,
  "teacher-3": teacher3,
  "teacher-4": teacher4,
  "teacher-5": teacher5,
  "teacher-6": teacher6,
};

export function resolveImage(url?: string | null): string | null {
  if (!url) return null;
  if (/^(https?:|\/|data:|blob:)/.test(url)) return url;
  return BUNDLED_IMAGES[url] ?? null;
}

export type TrackId = "all" | "science_sci" | "science_math" | "literary";

export const tracks: { id: TrackId; label: string }[] = [
  { id: "all", label: "كل الشُّعب" },
  { id: "science_sci", label: "علمي علوم" },
  { id: "science_math", label: "علمي رياضة" },
  { id: "literary", label: "أدبي" },
];

export const levels: { id: string; label: string }[] = [
  { id: "primary", label: "ابتدائي" },
  { id: "prep", label: "إعدادي" },
  { id: "secondary", label: "ثانوي" },
];

export const courseTypes: { id: string; label: string }[] = [
  { id: "live", label: "مباشر + مسجّل" },
  { id: "recorded", label: "مسجّل بالكامل" },
];

export function trackLabel(id: string): string {
  return tracks.find((t) => t.id === id)?.label ?? id;
}

export function levelLabel(id: string): string {
  return levels.find((l) => l.id === id)?.label ?? id;
}
