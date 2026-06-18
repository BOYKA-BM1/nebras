import { useState } from "react";
import { ChevronDown, LifeBuoy } from "lucide-react";
import { faqs } from "@/data/site";

export function HelpCenter() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section id="help" className="relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <LifeBuoy className="h-4 w-4" />
            مركز المساعدة
          </span>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            الأسئلة <span className="text-gradient-gold">الشائعة</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            دليل شامل لمساعدتك في استخدام منصة نبراس بسهولة وفعّالية.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, i) => {
            const open = active === i;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
              >
                <button
                  onClick={() => setActive(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="text-base font-bold sm:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
