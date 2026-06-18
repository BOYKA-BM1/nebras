import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppliedCoupon = {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
};

export type CouponStatus = "idle" | "loading" | "valid" | "invalid";

/** يحسب السعر بعد الخصم */
export function applyDiscount(price: number, c: AppliedCoupon | null): number {
  if (!c || price <= 0) return price;
  let p = price;
  if (c.discount_percent) p -= (p * c.discount_percent) / 100;
  if (c.discount_amount) p -= c.discount_amount;
  return Math.max(0, Math.round(p));
}

/**
 * تحقّق من كوبون الخصم. لو مرّرت teacherId، الكوبون لازم يكون عام أو خاص بنفس المدرّس.
 */
export function useCoupon(teacherId?: string | null) {
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [status, setStatus] = useState<CouponStatus>("idle");

  const validate = async (code: string) => {
    const c = code.trim();
    if (!c) {
      setCoupon(null);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", c)
      .eq("is_active", true)
      .maybeSingle();

    const bad = () => {
      setCoupon(null);
      setStatus("invalid");
    };

    if (error || !data) return bad();
    if (data.expires_at && new Date(data.expires_at) < new Date()) return bad();
    if (data.max_uses != null && data.used_count >= data.max_uses) return bad();
    if (teacherId && data.teacher_id && data.teacher_id !== teacherId) return bad();

    setCoupon({
      id: data.id,
      code: data.code,
      discount_percent: data.discount_percent,
      discount_amount: data.discount_amount,
    });
    setStatus("valid");
  };

  const clear = () => {
    setCoupon(null);
    setStatus("idle");
  };

  return { coupon, status, validate, clear };
}
