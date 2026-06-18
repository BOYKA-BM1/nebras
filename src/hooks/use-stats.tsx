import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformStats = {
  students: number;
  teachers: number;
  courses: number;
  lessons: number;
  visits: number;
};

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      const { data, error } = await supabase.rpc("platform_stats");
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as Record<string, number> | undefined;
      return {
        students: Number(row?.students ?? 0),
        teachers: Number(row?.teachers ?? 0),
        courses: Number(row?.courses ?? 0),
        lessons: Number(row?.lessons ?? 0),
        visits: Number(row?.visits ?? 0),
      };
    },
    staleTime: 30_000,
  });
}

/** Counts a single platform visit per browser session. */
export function useTrackVisit() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("nibras_visit_counted")) return;
    sessionStorage.setItem("nibras_visit_counted", "1");
    supabase.rpc("increment_visits").then(() => {});
  }, []);
}
