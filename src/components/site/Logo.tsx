import { GraduationCap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#home" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold text-primary-foreground shadow-gold">
        <GraduationCap className="h-6 w-6" />
      </span>
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-gradient-gold">نبراس</span>
      </span>
    </a>
  );
}
