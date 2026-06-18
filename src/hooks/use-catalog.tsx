import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Stage,
  Teacher,
  Course,
  CourseWithRelations,
} from "@/lib/catalog";

/* ===================== قراءات عامة ===================== */

export function useStages() {
  return useQuery({
    queryKey: ["stages"],
    queryFn: async (): Promise<Stage[]> => {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async (): Promise<Teacher[]> => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async (): Promise<CourseWithRelations[]> => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, teacher:teachers(*), stage:stages(*)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as CourseWithRelations[];
    },
  });
}

/* ===================== طفرات الأدمن ===================== */

type StageInput = Database["public"]["Tables"]["stages"]["Insert"];
type TeacherInput = Database["public"]["Tables"]["teachers"]["Insert"];
type CourseInput = Database["public"]["Tables"]["courses"]["Insert"];

import type { Database } from "@/integrations/supabase/types";

export function useStageAdmin() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["stages"] });

  const create = useMutation({
    mutationFn: async (input: StageInput) => {
      const { error } = await supabase.from("stages").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: StageInput & { id: string }) => {
      const { error } = await supabase.from("stages").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useTeacherAdmin() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["teachers"] });
    qc.invalidateQueries({ queryKey: ["courses"] });
  };

  const create = useMutation({
    mutationFn: async (input: TeacherInput) => {
      const { error } = await supabase.from("teachers").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: TeacherInput & { id: string }) => {
      const { error } = await supabase.from("teachers").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export function useCourseAdmin() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["courses"] });

  const create = useMutation({
    mutationFn: async (input: CourseInput) => {
      const { error } = await supabase.from("courses").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CourseInput> & { id: string }) => {
      const { error } = await supabase.from("courses").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

export type { Stage, Teacher, Course, CourseWithRelations };
