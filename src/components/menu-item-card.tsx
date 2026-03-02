"use client"

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Star } from "lucide-react";

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
      "group relative bg-white rounded-[2rem] overflow-hidden transition-all duration-500",
      "border-2 border-white shadow-2xl",
      isSoldOut ? "opacity-60" : "hover:-translate-y-2 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]",
      !shouldShowImage && "pt-6"
    )}>
      
      {shouldShowImage && (
        <div className="relative h-64 w-full overflow-hidden">
          {isSoldOut && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="bg-white text-zinc-900 px-6 py-2 rounded-full font-black uppercase tracking-widest text-[10px]">
                Sold Out
              </div>
            </div>
          )}
          
          <Image
            src={item.image}
            alt={item.name}
            fill
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              !isSoldOut && "group-hover:scale-110"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {!isSoldOut && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-100 flex items-center gap-1.5 shadow-sm">
                <Star size={10} className="text-background fill-background" />
                <span className="text-background font-black text-[9px] uppercase tracking-widest">Farm Special</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-none uppercase italic">
              {item.name}
            </h3>
            <span className="text-background font-black text-xl tabular-nums shrink-0">
              {formatCurrency(item.price)}
            </span>
          </div>
          
          <p className="text-zinc-500 text-[11px] font-medium leading-relaxed line-clamp-2 italic">
            {item.description || "Freshly harvested and prepared with authentic spices from our farms for a pure dining experience."}
          </p>
        </div>

        <button
          onClick={() => onAddToCart(item)}
          disabled={isSoldOut}
          className={cn(
            "w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 font-black uppercase tracking-widest text-[11px] italic shadow-xl",
            isSoldOut 
              ? "bg-zinc-100 text-zinc-300 cursor-not-allowed" 
              : "bg-background text-white hover:bg-primary active:scale-95"
          )}
        >
          {isSoldOut ? (
            'Out of Stock'
          ) : (
            <>
              <span>Add to Tray</span>
              <Plus size={16} strokeWidth={4} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
