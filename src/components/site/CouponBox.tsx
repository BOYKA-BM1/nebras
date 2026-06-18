import { useEffect, useState } from "react";
import { Ticket, Check, Loader2, X } from "lucide-react";
import { useCoupon, type AppliedCoupon } from "@/hooks/use-coupon";

/**
 * صندوق إدخال كوبون اختياري. يفعّل الخصم على طول لما الطالب يكتب كوبون صحيح.
 */
export function CouponBox({
  teacherId,
  onChange,
}: {
  teacherId?: string | null;
  onChange?: (c: AppliedCoupon | null) => void;
}) {
  const { coupon, status, validate, clear } = useCoupon(teacherId);
  const [code, setCode] = useState("");

  useEffect(() => {
    onChange?.(coupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon]);

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <Ticket className="h-4 w-4 text-primary" /> كود خصم (اختياري)
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (status !== "idle") clear();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              validate(code);
            }
          }}
          placeholder="اكتب الكود هنا"
          className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => validate(code)}
          disabled={status === "loading" || !code.trim()}
          className="shrink-0 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent disabled:opacity-60"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "تفعيل"}
        </button>
      </div>
      {status === "valid" && coupon && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary">
          <Check className="h-4 w-4" /> تم تفعيل الخصم
          {coupon.discount_percent ? ` ${coupon.discount_percent}%` : ""}
          {coupon.discount_amount ? ` ${coupon.discount_amount} ج.م` : ""} 🎉
        </p>
      )}
      {status === "invalid" && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-destructive">
          <X className="h-4 w-4" /> الكود غير صالح أو منتهي.
        </p>
      )}
    </div>
  );
}
