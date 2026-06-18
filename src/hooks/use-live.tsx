import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LiveSession = Database["public"]["Tables"]["live_sessions"]["Row"];
type LiveInput = Database["public"]["Tables"]["live_sessions"]["Insert"];

export function useLiveSessions(courseId: string | undefined) {
  return useQuery({
    queryKey: ["live_sessions", courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<LiveSession[]> => {
      const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLiveAdmin(courseId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["live_sessions", courseId] });

  const create = useMutation({
    mutationFn: async (input: LiveInput) => {
      const { error } = await supabase.from("live_sessions").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<LiveInput> & { id: string }) => {
      const { error } = await supabase.from("live_sessions").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("live_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
