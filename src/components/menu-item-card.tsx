"use client"

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Star, Leaf } from "lucide-react";

type MenuItemCardProps = {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  globalShowImages?: boolean; 
};

export function MenuItemCard({ item, onAddToCart, globalShowImages = true }: MenuItemCardProps) {
  const isSoldOut = !item.available;
  const shouldShowImage = globalShowImages && item.image && item.showImage !== false;

  return (
    <div className={cn(
      "group relative bg-white transition-all duration-500",
      "sm:rounded-[3rem] sm:border sm:border-white/50 sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]",
      "sm:hover:-translate-y-2 sm:hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.25)]",
      isSoldOut ? "opacity-60" : "",
      "flex flex-row items-start gap-4 p-4 sm:flex-col sm:p-0 sm:gap-0 sm:overflow-hidden"
    )}>
      
      {/* Information Section */}
      <div className="flex-1 order-1 sm:order-2 sm:p-10 space-y-2 sm:space-y-6">
        <div className="space-y-1 sm:space-y-3">
          <div className="flex items-center gap-2 text-background/40 sm:mb-2">
             <Leaf size={10} className="sm:w-3 sm:h-3" />
             <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{item.category}</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-background tracking-tight leading-tight uppercase italic">
            {item.name}
          </h3>
          <p className="text-zinc-400 text-[11px] sm:text-[13px] font-medium leading-relaxed line-clamp-2 sm:line-clamp-3 italic opacity-80">
            {item.description || "Crafted with the finest farm-fresh ingredients."}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-stretch sm:gap-6 pt-2 sm:pt-0">
           <span className="text-background font-black text-xl sm:text-3xl tabular-nums leading-none tracking-tighter">
              {formatCurrency(item.price)}
           </span>
           
           {/* Desktop Only Button (Hidden on Mobile inside this block) */}
           <button
            onClick={() => onAddToCart(item)}
            disabled={isSoldOut}
            className={cn(
              "hidden sm:flex w-full h-14 sm:h-16 rounded-2xl sm:rounded-[1.5rem] items-center justify-center gap-3 transition-all duration-500 font-black uppercase tracking-[0.2em] text-[11px] italic shadow-lg relative overflow-hidden",
              isSoldOut 
                ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
                : "bg-background text-white hover:bg-black group/btn"
            )}
          >
            {isSoldOut ? 'Sold Out' : (
              <>
                <span className="relative z-10">Add</span>
                <Plus size={16} strokeWidth={4} className="relative z-10 group-hover/btn:rotate-90 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Image & Mobile Button Section */}
      <div className="relative w-28 h-28 sm:w-full sm:h-72 shrink-0 order-2 sm:order-1">
        {shouldShowImage ? (
          <div className="relative w-full h-full rounded-2xl sm:rounded-none overflow-hidden shadow-md sm:shadow-none">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className={cn(
                "object-cover transition-transform duration-[1.5s] ease-out",
                !isSoldOut && "group-hover:scale-110"
              )}
              sizes="(max-width: 768px) 150px, 400px"
            />
            {isSoldOut && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <span className="text-white text-[8px] font-black uppercase tracking-widest">Out</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-orange-50 rounded-2xl sm:rounded-none flex items-center justify-center">
             <Leaf className="text-background/10 w-8 h-8" />
          </div>
        )}

        {/* Mobile Add Button - Overlapping Image */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 sm:hidden">
          <button
            onClick={() => onAddToCart(item)}
            disabled={isSoldOut}
            className={cn(
              "h-10 px-6 rounded-xl flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] italic shadow-xl border-2 border-white",
              isSoldOut 
                ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
                : "bg-white text-background active:scale-90"
            )}
          >
            {isSoldOut ? 'Sold' : (
              <>
                <span>Add</span>
                <Plus size={14} strokeWidth={4} />
              </>
            )}
          </button>
        </div>

        {/* Premium Badge Desktop Only */}
        {!isSoldOut && shouldShowImage && (
          <div className="absolute top-4 right-4 z-10 hidden sm:block">
            <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
              <Star size={10} className="text-background fill-background" />
              <span className="text-background font-black text-[9px] uppercase tracking-widest">Premium</span>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Border for Mobile List */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-background/10 sm:hidden" />
    </div>
  );
}
