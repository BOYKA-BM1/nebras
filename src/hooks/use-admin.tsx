import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Coupon, Payment } from "@/lib/catalog";

export function useAdminMetrics() {
  return useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const [enr, pay] = await Promise.all([
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount,status"),
      ]);
      const payments = (pay.data ?? []) as Pick<Payment, "amount" | "status">[];
      const revenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount || 0), 0);
      return {
        enrollments: enr.count ?? 0,
        revenue,
        transactions: payments.length,
      };
    },
  });
}

export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async (): Promise<Coupon[]> => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

type CouponInput = Database["public"]["Tables"]["coupons"]["Insert"];

export function useCouponAdmin() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["coupons"] });
  const create = useMutation({
    mutationFn: async (input: CouponInput) => {
      const { error } = await supabase.from("coupons").insert(input);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CouponInput> & { id: string }) => {
      const { error } = await supabase.from("coupons").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
