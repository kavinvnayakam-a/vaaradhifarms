"use client"

import { cn } from "@/lib/utils";

interface GetPikLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'opacity';
}

export function GetPikLogo({ className, variant = 'light' }: GetPikLogoProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 group transition-all duration-500",
      variant === 'opacity' && "bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl hover:bg-white/20",
      className
    )}>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          "font-black text-xl tracking-tighter uppercase italic transition-colors",
          "text-white"
        )}>
          Get<span className="text-white transition-colors">Pik</span>
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      </div>
      <p className={cn(
        "text-[7px] font-black uppercase tracking-[0.4em] transition-opacity text-white/40"
      )}>
        Digital Architecture
      </p>
    </div>
  );
}
