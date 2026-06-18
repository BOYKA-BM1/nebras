import type { CourseWithRelations } from "@/lib/catalog";
import type { Profile } from "@/hooks/use-profile";

/**
 * يفلتر الدورات لتظهر فقط الدورات الخاصة بسنة/مرحلة الطالب.
 * - لو الطالب ليه سنة (grade) والدورة ليها سنة → لازم يتطابقوا.
 * - غير كده نرجع لمطابقة المرحلة (stage_id ثم level).
 * - لو مفيش بيانات للطالب (أدمن/مدرّس/زائر) → نعرض كل الدورات.
 */
export function filterCoursesForProfile(
  courses: CourseWithRelations[],
  profile: Profile | null | undefined,
): CourseWithRelations[] {
  if (!profile || (!profile.grade && !profile.level && !profile.stage_id)) {
    return courses;
  }
  return courses.filter((c) => {
    if (profile.grade && c.grade) return c.grade === profile.grade;
    if (profile.stage_id && c.stage_id) return c.stage_id === profile.stage_id;
    if (profile.level && c.stage?.level) return c.stage.level === profile.level;
    return false;
  });
}
