"use client"

import React from 'react';
import { Sparkles, Utensils, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'Pending' | 'Received' | 'Preparing' | 'Served' | 'Ready' | 'Handover' | 'Completed';

export function StatusVisualizer({ status }: { status: Status }) {
  // Character stays sleeping only in 'Pending'
  const isPending = status === 'Pending';
  // Character wakes up and cooks when order is Received, Preparing, or Served
  const isPreparing = ['Received', 'Preparing', 'Served'].includes(status);
  // Character is ready when status is Ready, Handover, or Completed
  const isReady = ['Ready', 'Handover', 'Completed'].includes(status);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 w-full max-w-4xl h-80 flex flex-col items-center justify-center">
        
        {/* CHARACTER ILLUSTRATION */}
        <div className={cn("relative transition-all duration-1000", isPreparing && "animate-bounce")}>
          {/* Subtle Glow (Reduced from previous) */}
          <div className="absolute -inset-10 bg-white/5 blur-[60px] rounded-full" />
          
          <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            {/* Chef Hat */}
            <path d="M80 45 Q 100 15 120 45" fill="white" stroke="white" strokeWidth="2" />
            
            {/* Character Face */}
            <circle cx="100" cy="70" r="30" fill="white" />
            
            {/* Dynamic Eyes/Expression */}
            {isPending && (
              <g className="opacity-40">
                <path d="M85 70 L 95 70" stroke="#f38221" strokeWidth="2" strokeLinecap="round" />
                <path d="M105 70 L 115 70" stroke="#f38221" strokeWidth="2" strokeLinecap="round" />
                <path d="M95 85 Q 100 88 105 85" stroke="#f38221" strokeWidth="2" fill="none" />
              </g>
            )}
            
            {isPreparing && (
              <g>
                {/* Waking Up / Joyful Eyes */}
                <circle cx="88" cy="70" r="3" fill="#f38221" />
                <circle cx="112" cy="70" r="3" fill="#f38221" />
                <path d="M90 85 Q 100 95 110 85" stroke="#f38221" strokeWidth="2" fill="none" strokeLinecap="round" />
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
              <g className="text-white/30 font-black italic">
                <text x="130" y="40" fontSize="20" className="animate-zzz" style={{ animationDelay: '0s' }}>Z</text>
                <text x="145" y="25" fontSize="14" className="animate-zzz" style={{ animationDelay: '1s' }}>z</text>
                <text x="120" y="15" fontSize="10" className="animate-zzz" style={{ animationDelay: '2s' }}>z</text>
              </g>
            )}

            {/* Step 2: Joyful Preparation Action */}
            {isPreparing && (
              <>
                <g className="animate-chop origin-center">
                  <rect x="40" y="110" width="30" height="10" rx="5" fill="white" />
                  <rect x="130" y="110" width="30" height="10" rx="5" fill="white" />
                </g>
                {/* Floating Joyful Hearts */}
                <g className="text-white/40">
                   <path d="M150 50 Q 155 40 160 50 T 170 50" fill="white" className="animate-steam" style={{ animationDelay: '0.2s' }} />
                   <path d="M40 60 Q 45 50 50 60 T 60 60" fill="white" className="animate-steam" style={{ animationDelay: '0.8s' }} />
                </g>
              </>
            )}

            {/* Step 3: Ready and Smiling with Bag */}
            {isReady && (
              <g>
                <circle cx="150" cy="140" r="40" fill="white" opacity="0.05" className="animate-pulse" />
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
          <div className="flex items-center gap-3 bg-white/5 px-8 py-4 rounded-[2rem] border border-white/10 backdrop-blur-md">
            {isPending && (
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                Waiting for the farm to wake up...
              </span>
            )}
            {isPreparing && (
              <div className="flex items-center gap-3">
                <Utensils size={16} className="text-white animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                  Preparing with Love
                </span>
              </div>
            )}
            {isReady && (
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                  The Harvest is Ready!
                </span>
              </div>
            )}
          </div>
          <p className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/10 italic">
            Vaaradhi Boutique Kitchen
          </p>
        </div>

      </div>
    </div>
  );
}
