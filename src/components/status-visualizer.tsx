"use client"

import React from 'react';
import { ChefHat, Leaf, Package, BellRing, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'Pending' | 'Received' | 'Preparing' | 'Served' | 'Ready' | 'Handover' | 'Completed';

export function StatusVisualizer({ status }: { status: Status }) {
  const isPreparing = ['Preparing', 'Served'].includes(status);
  const isPending = ['Pending', 'Received'].includes(status);
  const isReady = ['Ready', 'Handover', 'Completed'].includes(status);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Decorative Layer */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/canvas.png')]" />
      </div>

      {/* Main Animation Container */}
      <div className="relative z-10 w-full h-48 flex flex-col items-center justify-center">
        
        {/* Stage 1: The Field (Pending/Received) */}
        {isPending && (
          <div className="flex gap-8 items-end animate-in fade-in zoom-in duration-1000">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-dashed border-white/20 relative">
                  <Leaf className={cn("text-emerald-400 animate-sprout", i === 1 ? "delay-300" : i === 2 ? "delay-500" : "")} size={32} />
                  <div className="absolute -top-2 -right-2">
                    <Sparkles size={16} className="text-amber-300 animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-white/10 rounded-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Stage 2: The Conveyor (Preparing) */}
        {isPreparing && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-right-20 duration-1000">
            {/* The Items */}
            <div className="relative w-full h-20 overflow-hidden">
              <div className="absolute top-0 left-0 w-full flex items-center gap-32 animate-item-move">
                <div className="text-4xl">🍅</div>
                <div className="text-4xl">🥬</div>
                <div className="text-4xl">🥕</div>
                <div className="text-4xl">🧀</div>
              </div>
            </div>
            {/* The Belt */}
            <div className="w-64 h-6 bg-white/10 rounded-full border-2 border-white/20 relative animate-conveyor overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <ChefHat size={20} className="text-white/40 animate-sway" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Preparing Fresh</span>
            </div>
          </div>
        )}

        {/* Stage 3: The Gift (Ready/Handover) */}
        {isReady && (
          <div className="flex flex-col items-center animate-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute -inset-10 bg-white/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-white p-8 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border-4 border-white/30 animate-float">
                <Package size={64} className="text-background" />
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl animate-bounce">
                  <BellRing size={24} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-steam" style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-emerald-400 italic">Ready for You</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}