import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Course } from "@/lib/catalog";

export type Booking = {
  id: string;
  course_id: string | null;
  course_title: string;
  teacher_name: string | null;
  price: number;
  status: string;
  created_at: string;
};

export function useBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bookings", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, course_id, course_title, teacher_name, price, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const book = useMutation({
    mutationFn: async (course: { id: string; title: string; teacher_name?: string | null; price: number }) => {
      if (!user) throw new Error("not-authenticated");
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        course_id: course.id,
        course_title: course.title,
        teacher_name: course.teacher_name ?? null,
        price: course.price,
        status: "confirmed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
    },
  });

  const cancel = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", user?.id] });
    },
  });

  const bookedIds = new Set((query.data ?? []).map((b) => b.course_id).filter(Boolean) as string[]);

  return { ...query, bookings: query.data ?? [], bookedIds, book, cancel };
}

export type { Course };
