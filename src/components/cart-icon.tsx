"use client"

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CartIcon({ onOpen }: { onOpen?: () => void }) {
  const { totalItems } = useCart();
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    if (totalItems === 0) return;
    setIsAnimate(true);
    const timer = setTimeout(() => setIsAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [totalItems]);

  return (
    <button 
      onClick={onOpen}
      aria-label="Open cart"
      className={cn(
        "fixed right-4 bottom-8 sm:right-0 sm:top-[60%] sm:-translate-y-1/2 z-[70]",
        "flex flex-col items-center justify-center gap-2",
        "bg-white text-background", 
        "w-16 h-16 sm:w-auto sm:h-auto sm:py-10 sm:px-4",
        "rounded-full sm:rounded-none sm:rounded-l-[3.5rem]", 
        "border-2 border-white/30 sm:border-r-0", 
        "shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:shadow-[-30px_0_80px_rgba(0,0,0,0.3)]",
        "transition-all duration-700 ease-in-out",
        isAnimate ? "scale-110" : "hover:scale-105 sm:hover:translate-x-[-8px] hover:bg-white/90",
        "active:scale-95 group"
      )}
    >
      {/* Item Counter */}
      <div className={cn(
        "absolute -top-1 -right-1 sm:static flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-full sm:rounded-2xl text-[10px] sm:text-[12px] font-black transition-all duration-500",
        totalItems > 0 
          ? "bg-background text-white shadow-xl" 
          : "bg-background/10 text-background/20"
      )}>
        {totalItems}
        {totalItems > 0 && (
          <span className="absolute inset-0 rounded-full sm:rounded-2xl bg-background animate-ping opacity-20" />
        )}
      </div>

      <ShoppingBag className={cn(
        "h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-500 group-hover:scale-110",
        totalItems > 0 ? "text-background" : "text-background/20"
      )} />

      {/* Label - Hidden on Mobile */}
      <div className="hidden sm:flex flex-col items-center gap-4">
        <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-black uppercase tracking-[0.5em] text-background group-hover:tracking-[0.6em] transition-all">
          My Tray
        </span>
        
        {/* Decorative Divider */}
        <div className="flex flex-col gap-2 items-center">
            <div className="h-2 w-2 rounded-full bg-background/20 group-hover:bg-background transition-colors" />
            <div className="h-10 w-[2px] bg-gradient-to-b from-background/20 to-transparent" />
        </div>
      </div>
    </button>
  );
}
