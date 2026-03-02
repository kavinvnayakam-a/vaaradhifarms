"use client"

import { cn } from "@/lib/utils";

interface GetPikLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'opacity';
}

export function GetPikLogo({ className, variant = 'light' }: GetPikLogoProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 group", className)}>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "font-black text-xl tracking-tighter uppercase italic transition-colors",
          variant === 'light' ? "text-white" : variant === 'dark' ? "text-zinc-900" : "text-white/40 group-hover:text-white"
        )}>
          Get<span className="text-[#f38221]">Pik</span>
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
      </div>
      <p className={cn(
        "text-[7px] font-black uppercase tracking-[0.4em] transition-opacity",
        variant === 'light' ? "text-white/40" : variant === 'dark' ? "text-zinc-400" : "text-white/20 group-hover:text-white/40"
      )}>
        Digital Architecture
      </p>
    </div>
  );
}
