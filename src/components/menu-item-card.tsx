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
      "group relative bg-white rounded-[2.5rem] overflow-hidden transition-all duration-700",
      "border border-white/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]",
      isSoldOut ? "opacity-60" : "hover:-translate-y-3 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]",
      !shouldShowImage && "pt-8"
    )}>
      
      {shouldShowImage && (
        <div className="relative h-72 w-full overflow-hidden">
          {isSoldOut && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[4px]">
              <div className="bg-white text-primary px-8 py-3 rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl">
                Out of Season
              </div>
            </div>
          )}
          
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn(
              "object-cover transition-transform duration-1000 ease-out",
              !isSoldOut && "group-hover:scale-110"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {!isSoldOut && (
            <div className="absolute top-6 right-6 z-10">
              <div className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-full border border-orange-100 flex items-center gap-2 shadow-xl transform transition-transform group-hover:scale-110">
                <Star size={12} className="text-background fill-background" />
                <span className="text-background font-black text-[10px] uppercase tracking-widest">Premium</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-10 space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary/40">
               <Leaf size={12} />
               <span className="text-[9px] font-black uppercase tracking-widest">{item.category}</span>
            </div>
            <h3 className="text-2xl font-black text-primary tracking-tight leading-tight uppercase italic group-hover:text-background transition-colors duration-500">
              {item.name}
            </h3>
          </div>
          
          <p className="text-zinc-400 text-[12px] font-medium leading-relaxed line-clamp-3 italic opacity-80">
            {item.description || "Indulge in the pure, authentic flavors of our farmhouse kitchen, crafted with fresh ingredients harvested daily."}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Price</span>
             <span className="text-background font-black text-3xl tabular-nums leading-none tracking-tighter">
                {formatCurrency(item.price)}
             </span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            disabled={isSoldOut}
            className={cn(
              "w-full h-16 rounded-3xl flex items-center justify-center gap-4 transition-all duration-500 font-black uppercase tracking-[0.2em] text-[12px] italic shadow-2xl overflow-hidden relative",
              isSoldOut 
                ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
                : "bg-background text-white hover:bg-primary hover:scale-[1.02] active:scale-95 group/btn"
            )}
          >
            {isSoldOut ? (
              'Sold Out'
            ) : (
              <>
                <span className="relative z-10">Add to Tray</span>
                <Plus size={18} strokeWidth={4} className="relative z-10 group-hover/btn:rotate-90 transition-transform duration-500" />
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}