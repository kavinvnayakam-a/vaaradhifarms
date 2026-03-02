"use client"

import React from 'react';
import { ChefHat, ShoppingBag, Package, Sparkles, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'Pending' | 'Received' | 'Preparing' | 'Served' | 'Ready' | 'Handover' | 'Completed';

export function StatusVisualizer({ status }: { status: Status }) {
  const isPending = status === 'Pending';
  const isReceived = status === 'Received';
  const isPreparing = ['Preparing', 'Served'].includes(status);
  const isReady = ['Ready', 'Handover', 'Completed'].includes(status);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-white/5 backdrop-blur-sm">
      {/* Narrative Container */}
      <div className="relative z-10 w-full max-w-4xl h-64 flex items-center justify-center">
        
        {/* STAGE 1: Farmer Preparing (Pending / Received) */}
        {(isPending || isReceived) && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute -inset-8 bg-white/10 blur-3xl rounded-full animate-pulse" />
              {/* Boutique Farmer/Chef Illustration */}
              <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-2xl">
                {/* Character Head */}
                <circle cx="100" cy="60" r="25" fill="white" />
                {/* Hat */}
                <path d="M80 45 Q 100 20 120 45" fill="white" stroke="white" strokeWidth="2" />
                {/* Body */}
                <path d="M70 160 Q 70 85 100 85 Q 130 85 130 160" fill="white" opacity="0.9" />
                {/* Moving Arms (Cooking Action) */}
                <g className="animate-sway origin-center">
                  <rect x="60" y="100" width="30" height="10" rx="5" fill="white" />
                  <rect x="110" y="100" width="30" height="10" rx="5" fill="white" />
                  <circle cx="100" cy="115" r="15" fill="#f38221" opacity="0.5" /> {/* Bowl */}
                </g>
              </svg>
            </div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-white/40 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
                  {isPending ? 'Waiting for Approval' : 'Chef is Preparing'}
                </span>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/20 italic">Vaaradhi Authentic</p>
            </div>
          </div>
        )}

        {/* STAGE 2: The Harvest Belt (Preparing / Served) */}
        {isPreparing && (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-right-20 duration-1000">
            {/* The Ingredients moving horizontally */}
            <div className="relative w-full h-24 overflow-hidden mb-4">
              <div className="absolute top-0 left-0 w-full flex items-center gap-48 animate-item-move">
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🥕</div>
                  <div className="h-1 w-8 bg-white/10 rounded-full" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🍅</div>
                  <div className="h-1 w-8 bg-white/10 rounded-full" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🥬</div>
                  <div className="h-1 w-8 bg-white/10 rounded-full" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl mb-2">🧀</div>
                  <div className="h-1 w-8 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
            
            {/* The Conveyor Belt */}
            <div className="relative w-80">
              <div className="h-8 bg-white/10 rounded-full border-2 border-white/20 relative animate-conveyor overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              {/* Belt Gears */}
              <div className="absolute -bottom-2 left-8 w-4 h-4 rounded-full border-2 border-white/20 animate-spin" />
              <div className="absolute -bottom-2 right-8 w-4 h-4 rounded-full border-2 border-white/20 animate-spin" />
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg animate-bounce">
                <ChefHat size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">In the Kitchen</span>
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">Crafting your order</span>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: The Handover Slide (Ready / Handover) */}
        {isReady && (
          <div className="flex flex-col items-center animate-in slide-in-from-left-20 duration-1000">
            <div className="relative">
              <div className="absolute -inset-16 bg-white/20 blur-[100px] rounded-full animate-pulse" />
              
              {/* Sliding Bag Animation */}
              <div className="relative animate-float">
                <div className="relative bg-white p-10 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-4 border-white/30 transform hover:scale-105 transition-transform duration-700">
                  <ShoppingBag size={80} className="text-background" />
                  <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-4 rounded-2xl shadow-2xl animate-bounce">
                    <Sparkles size={24} />
                  </div>
                  {/* Steam detail */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-1.5 h-6 bg-white/20 rounded-full animate-steam" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-8 bg-white/20 rounded-full animate-steam" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-6 bg-white/20 rounded-full animate-steam" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="px-6 py-2 bg-white text-background rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl">
                Ready for Collection
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/40 italic">Freshly Harvested & Packed</p>
            </div>
          </div>
        )}

      </div>

      {/* Ground Line / Perspective */}
      <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
