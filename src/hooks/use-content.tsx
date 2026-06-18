import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import type {
  Section,
  Lesson,
  Enrollment,
  LessonProgress,
  SectionWithLessons,
  CourseWithRelations,
} from "@/lib/catalog";

type SectionInput = Database["public"]["Tables"]["sections"]["Insert"];
type LessonInput = Database["public"]["Tables"]["lessons"]["Insert"];

/* ===================== دورة واحدة ===================== */

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ["course", courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<CourseWithRelations | null> => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, teacher:teachers(*), stage:stages(*)")
        .eq("id", courseId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as CourseWithRelations) ?? null;
    },
  });
}

/* ===================== المحتوى (وحدات + دروس) ===================== */

export function useSections(courseId: string | undefined) {
  return useQuery({
    queryKey: ["sections", courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<Section[]> => {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", courseId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLessons(courseId: string | undefined) {
  return useQuery({
    queryKey: ["lessons", courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<Lesson[]> => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** يجمّع الوحدات مع دروسها (والدروس غير المرتبطة بوحدة تحت "بدون وحدة") */
export function useCourseContent(courseId: string | undefined) {
  const sectionsQ = useSections(courseId);
  const lessonsQ = useLessons(courseId);

  const grouped = useMemo<SectionWithLessons[]>(() => {
    const sections = sectionsQ.data ?? [];
    const lessons = lessonsQ.data ?? [];
    const result: SectionWithLessons[] = sections.map((s) => ({
      ...s,
      lessons: lessons.filter((l) => l.section_id === s.id),
    }));
    const orphan = lessons.filter((l) => !l.section_id);
    if (orphan.length) {
      result.push({
        id: "__orphan__",
        course_id: courseId ?? "",
        title: "دروس عامة",
        sort_order: 9999,
        created_at: "",
        updated_at: "",
        lessons: orphan,
      } as SectionWithLessons);
    }
    return result;
  }, [sectionsQ.data, lessonsQ.data, courseId]);

  return {
    sections: grouped,
    lessons: lessonsQ.data ?? [],
    isLoading: sectionsQ.isLoading || lessonsQ.isLoading,
  };
}

/* ===================== الاشتراك ===================== */

export function useMyEnrollments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Enrollment[]> => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useEnrollment(courseId: string | undefined) {
  const { data: enrollments = [], isLoading } = useMyEnrollments();
  const enrollment = enrollments.find((e) => e.course_id === courseId) ?? null;
  return { enrollment, isEnrolled: !!enrollment && enrollment.status === "active", isLoading };
}

export function useEnroll() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, price, couponId }: { courseId: string; price: number; couponId?: string | null }) => {
      if (!user) throw new Error("not_authenticated");
      // سجّل عملية الدفع (لو فيه سعر) — مؤكّدة مباشرة في الوضع الحالي
      if (price > 0) {
        await supabase.from("payments").insert({
          user_id: user.id,
          course_id: courseId,
          amount: price,
          status: "paid",
          provider: "manual",
          coupon_id: couponId ?? null,
        });
      }
      const { error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: courseId, status: "active" });
      if (error && !/duplicate|unique/i.test(error.message)) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

/* ===================== التقدّم ===================== */

export function useProgress(courseId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["progress", courseId, user?.id],
    enabled: !!user && !!courseId,
    queryFn: async (): Promise<LessonProgress[]> => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("course_id", courseId!)
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      completed,
      position,
    }: {
      lessonId: string;
      completed?: boolean;
      position?: number;
    }) => {
      if (!user || !courseId) throw new Error("missing");
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          ...(completed !== undefined ? { completed } : {}),
          ...(position !== undefined ? { last_position_seconds: Math.round(position) } : {}),
        },
        { onConflict: "user_id,lesson_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress", courseId] }),
  });
}

/* ===================== المفضّلة ===================== */

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.from("favorites").select("course_id").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((f) => f.course_id);
    },
  });

  const ids = new Set(query.data ?? []);

  const toggle = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("not_authenticated");
      if (ids.has(courseId)) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("course_id", courseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: user.id, course_id: courseId });
        if (error && !/duplicate|unique/i.test(error.message)) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return { favoriteIds: ids, toggle, isLoading: query.isLoading };
}

/* ===================== إدارة المحتوى (admin + teacher) ===================== */

export function useSectionAdmin(courseId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["sections", courseId] });

  const create = useMutation({
    mutationFn: async (input: SectionInput) => {
      const { error } = await supabase.from("sections").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<SectionInput> & { id: string }) => {
      const { error } = await supabase.from("sections").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useLessonAdmin(courseId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["lessons", courseId] });

  const create = useMutation({
    mutationFn: async (input: LessonInput) => {
      const { error } = await supabase.from("lessons").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<LessonInput> & { id: string }) => {
      const { error } = await supabase.from("lessons").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
