"use client"

import React from 'react';
import { ShoppingBag, Sparkles, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'Pending' | 'Received' | 'Preparing' | 'Served' | 'Ready' | 'Handover' | 'Completed';

export function StatusVisualizer({ status }: { status: Status }) {
  const isPending = status === 'Pending' || status === 'Received';
  const isPreparing = ['Preparing', 'Served'].includes(status);
  const isReady = ['Ready', 'Handover', 'Completed'].includes(status);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl h-80 flex flex-col items-center justify-center">
        
        {/* CHARACTER ILLUSTRATION */}
        <div className="relative">
          <div className="absolute -inset-16 bg-white/5 blur-[100px] rounded-full animate-pulse" />
          
          <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            {/* Chef Hat */}
            <path d="M80 45 Q 100 15 120 45" fill="white" stroke="white" strokeWidth="2" />
            
            {/* Character Face */}
            <circle cx="100" cy="70" r="30" fill="white" />
            
            {/* Dynamic Eyes/Expression */}
            {isPending && (
              <g className="opacity-60">
                <path d="M85 70 L 95 70" stroke="#f38221" strokeWidth="2" strokeLinecap="round" />
                <path d="M105 70 L 115 70" stroke="#f38221" strokeWidth="2" strokeLinecap="round" />
                <path d="M95 85 Q 100 88 105 85" stroke="#f38221" strokeWidth="2" fill="none" />
              </g>
            )}
            
            {isPreparing && (
              <g>
                <circle cx="88" cy="70" r="3" fill="#f38221" />
                <circle cx="112" cy="70" r="3" fill="#f38221" />
                <path d="M92 85 Q 100 85 108 85" stroke="#f38221" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
            
            {isReady && (
              <g>
                <path d="M85 68 Q 88 65 91 68" stroke="#f38221" strokeWidth="2" fill="none" />
                <path d="M109 68 Q 112 65 115 68" stroke="#f38221" strokeWidth="2" fill="none" />
                <path d="M85 82 Q 100 100 115 82" fill="#f38221" />
              </g>
            )}

            {/* Character Body */}
            <path d="M65 170 Q 65 100 100 100 Q 135 100 135 170" fill="white" />

            {/* Step 1: Sleeping Zzz Animation */}
            {isPending && (
              <g className="text-white/40 font-black italic">
                <text x="130" y="40" fontSize="20" className="animate-zzz" style={{ animationDelay: '0s' }}>Z</text>
                <text x="145" y="25" fontSize="14" className="animate-zzz" style={{ animationDelay: '1s' }}>z</text>
                <text x="120" y="15" fontSize="10" className="animate-zzz" style={{ animationDelay: '2s' }}>z</text>
              </g>
            )}

            {/* Step 2: Active Preparation Action */}
            {isPreparing && (
              <g className="animate-chop origin-center">
                <rect x="50" y="110" width="25" height="8" rx="4" fill="white" />
                <rect x="125" y="110" width="25" height="8" rx="4" fill="white" />
                <path d="M85 130 L 115 130" stroke="#f38221" strokeWidth="4" opacity="0.2" />
              </g>
            )}

            {/* Step 3: Packed and Smiling */}
            {isReady && (
              <g>
                <circle cx="150" cy="140" r="40" fill="white" opacity="0.1" className="animate-pulse" />
                <g className="animate-float" style={{ transform: 'translate(40px, 40px)' }}>
                   <rect x="130" y="110" width="40" height="50" rx="8" fill="white" />
                   <path d="M135 110 Q 150 80 165 110" stroke="white" strokeWidth="3" fill="none" />
                   <circle cx="150" cy="135" r="6" fill="#f38221" />
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* STATUS LABEL */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
            {isPending && <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Waiting for farmer to wake up...</span>}
            {isPreparing && (
              <div className="flex items-center gap-3">
                <Utensils size={16} className="text-white animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Harvesting Ingredients</span>
              </div>
            )}
            {isReady && (
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">The Harvest is Ready!</span>
              </div>
            )}
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/20 italic">
            Vaaradhi Boutique Kitchen
          </p>
        </div>

      </div>
    </div>
  );
}