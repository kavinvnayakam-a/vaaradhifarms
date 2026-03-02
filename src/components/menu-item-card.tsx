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
      "group relative bg-white rounded-[3rem] overflow-hidden transition-all duration-700",
      "border border-white/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]",
      isSoldOut ? "opacity-60" : "hover:-translate-y-4 hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.25)]",
      !shouldShowImage && "pt-10"
    )}>
      
      {shouldShowImage && (
        <div className="relative h-80 w-full overflow-hidden">
          {isSoldOut && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[6px]">
              <div className="bg-white text-background px-10 py-4 rounded-full font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl">
                Unavailable
              </div>
            </div>
          )}
          
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn(
              "object-cover transition-transform duration-[1.5s] ease-out",
              !isSoldOut && "group-hover:scale-110"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {!isSoldOut && (
            <div className="absolute top-8 right-8 z-10">
              <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-orange-50 flex items-center gap-2 shadow-2xl transform transition-transform group-hover:scale-110">
                <Star size={14} className="text-background fill-background" />
                <span className="text-background font-black text-[11px] uppercase tracking-widest">Premium</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-12 space-y-10">
        <div className="space-y-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-background/40">
               <Leaf size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">{item.category}</span>
            </div>
            <h3 className="text-3xl font-black text-background tracking-tighter leading-tight uppercase italic transition-all duration-500">
              {item.name}
            </h3>
          </div>
          
          <p className="text-zinc-400 text-[13px] font-medium leading-relaxed line-clamp-3 italic opacity-90">
            {item.description || "Crafted with the finest farm-fresh ingredients, delivering an authentic and unforgettable flavor experience."}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-end border-b-2 border-zinc-50 pb-6">
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-200">Value</span>
             <span className="text-background font-black text-4xl tabular-nums leading-none tracking-tighter">
                {formatCurrency(item.price)}
             </span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            disabled={isSoldOut}
            className={cn(
              "w-full h-20 rounded-[2rem] flex items-center justify-center gap-5 transition-all duration-700 font-black uppercase tracking-[0.3em] text-[13px] italic shadow-2xl overflow-hidden relative",
              isSoldOut 
                ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
                : "bg-background text-white hover:bg-black hover:scale-[1.02] active:scale-95 group/btn"
            )}
          >
            {isSoldOut ? (
              'Sold Out'
            ) : (
              <>
                <span className="relative z-10">Add to Tray</span>
                <Plus size={20} strokeWidth={4} className="relative z-10 group-hover/btn:rotate-90 transition-transform duration-700" />
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}