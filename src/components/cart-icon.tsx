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
        "fixed right-0 top-[60%] -translate-y-1/2 z-[70]",
        "flex flex-col items-center gap-4",
        "bg-primary text-white", // Changed to primary Maroon for better contrast
        "py-10 px-4",
        "rounded-l-[3rem]", 
        "border-2 border-white/20 border-r-0", 
        "shadow-[-20px_0_60px_rgba(0,0,0,0.3)]",
        "transition-all duration-500 ease-in-out",
        isAnimate ? "scale-110 translate-x-[-10px]" : "hover:translate-x-[-5px] hover:bg-zinc-900",
        "active:scale-90 group"
      )}
    >
      {/* Item Counter with High Contrast Glow */}
      <div className={cn(
        "relative flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-black transition-all duration-500",
        totalItems > 0 
          ? "bg-white text-primary shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
          : "bg-white/10 text-white/20"
      )}>
        {totalItems}
        {totalItems > 0 && (
          <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-20" />
        )}
      </div>

      <ShoppingBag className={cn(
        "h-6 w-6 transition-transform duration-300 group-hover:scale-110",
        totalItems > 0 ? "text-white" : "text-white/20"
      )} />

      {/* Label with Vertical Text */}
      <div className="flex flex-col items-center gap-3">
        <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.4em] text-white/90 group-hover:text-white">
          My Tray
        </span>
        
        {/* Decorative Divider */}
        <div className="flex flex-col gap-1.5 items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
            <div className="h-6 w-[1.5px] bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </button>
  );
}