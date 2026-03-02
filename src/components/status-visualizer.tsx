
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

type Status = 'Pending' | 'Received' | 'Preparing' | 'Served' | 'Ready' | 'Handover' | 'Completed';

export function StatusVisualizer({ status }: { status: Status }) {
  const isPending = status === 'Pending';
  const isPreparing = ['Received', 'Preparing', 'Served'].includes(status);
  const isDelivering = ['Ready', 'Handover', 'Completed'].includes(status);

  // Status-aware callout messages
  const getCalloutText = () => {
    if (isPending) return "Just a quick nap...";
    if (status === 'Received') return "Order's here!";
    if (status === 'Preparing') return "Cooking fresh!";
    if (status === 'Served') return "Almost ready!";
    if (isDelivering) return "The harvest is ready!";
    return "Farm is ready!";
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center pt-8">
      
      {/* 3D-STYLED CHARACTER WORKSPACE */}
      <div className="relative flex flex-col items-center">
        
        {/* iOS-STYLE MESSAGE BUBBLE - Positioned to the Right of the Head */}
        <div 
          key={status} // Key ensures re-animation on status change
          className={cn(
            "absolute top-4 left-[65%] z-30 min-w-max",
            "animate-in zoom-in-95 fade-in slide-in-from-left-4 duration-500 ease-out"
          )}
        >
          <div className="relative bg-white text-zinc-900 px-4 py-2 rounded-2xl shadow-xl border border-white/50 backdrop-blur-md">
            <p className="font-bold text-[10px] leading-tight text-center whitespace-nowrap tracking-tight">
              {getCalloutText()}
            </p>
            {/* iOS Message Tail - Adjusted for side placement */}
            <div className="absolute -bottom-1 left-4 w-3 h-3 bg-white rotate-45" 
                 style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }} />
          </div>
        </div>

        {/* The Character SVG with 3D Gradients and Shading */}
        <div className={cn(
          "relative transition-all duration-1000", 
          isPreparing && "animate-bounce",
          isDelivering && "animate-slide-in translate-x-[-10px]"
        )}>
          <svg viewBox="0 0 200 240" className="w-72 h-72 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <defs>
              <radialGradient id="gradHead" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5e7eb" />
              </radialGradient>
              <linearGradient id="gradBody" x1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
              <radialGradient id="gradChefHat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d1d5db" />
              </radialGradient>
              <filter id="shadow3d">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Chef Hat - 3D Volume */}
            <g filter="url(#shadow3d)">
              <ellipse cx="100" cy="30" rx="30" ry="15" fill="url(#gradChefHat)" />
              <rect x="80" y="30" width="40" height="20" fill="url(#gradChefHat)" />
            </g>
            
            {/* Realistic 3D Head */}
            <circle cx="100" cy="75" r="35" fill="url(#gradHead)" filter="url(#shadow3d)" />
            
            {/* Realistic Eyes and Shading */}
            {isPending ? (
              <g className="opacity-60">
                <path d="M85 75 Q 90 78 95 75" stroke="#f38221" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M105 75 Q 110 78 115 75" stroke="#f38221" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M95 90 Q 100 93 105 90" stroke="#f38221" strokeWidth="2" fill="none" />
              </g>
            ) : (
              <g>
                {/* 3D Weighted Eyes */}
                <circle cx="88" cy="75" r="4" fill="#374151" />
                <circle cx="112" cy="75" r="4" fill="#374151" />
                <circle cx="86" cy="73" r="1.5" fill="white" />
                <circle cx="110" cy="73" r="1.5" fill="white" />
                {/* Cheeks */}
                <circle cx="75" cy="85" r="5" fill="#fca5a5" opacity="0.3" />
                <circle cx="125" cy="85" r="5" fill="#fca5a5" opacity="0.3" />
                {/* Joyful Mouth */}
                <path d="M90 92 Q 100 102 110 92" stroke="#f38221" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Realistic 3D Torso */}
            <path 
              d="M60 180 Q 60 110 100 110 Q 140 110 140 180 Z" 
              fill="url(#gradBody)" 
              filter="url(#shadow3d)"
            />

            {/* 3D Arms & Hands */}
            <g className={cn(isPreparing && "animate-chop")}>
               {/* Left Arm */}
               <path d="M60 130 Q 40 140 40 160" stroke="white" strokeWidth="12" strokeLinecap="round" />
               {/* Right Arm */}
               <path d="M140 130 Q 160 140 160 160" stroke="white" strokeWidth="12" strokeLinecap="round" />
            </g>

            {/* State-Specific 3D Props */}
            {isPending && (
              <g className="text-white/20 font-black italic">
                <text x="140" y="50" fontSize="24" className="animate-zzz">Z</text>
                <text x="155" y="30" fontSize="16" className="animate-zzz" style={{ animationDelay: '1s' }}>z</text>
                <text x="130" y="20" fontSize="12" className="animate-zzz" style={{ animationDelay: '2s' }}>z</text>
              </g>
            )}

            {isPreparing && (
              <g filter="url(#shadow3d)">
                {/* 3D Volumetric Steam */}
                <path d="M160 80 Q 165 70 170 80" stroke="white" strokeWidth="2" opacity="0.4" className="animate-steam" />
                <path d="M175 70 Q 180 60 185 70" stroke="white" strokeWidth="2" opacity="0.4" className="animate-steam" style={{ animationDelay: '0.5s' }}/>
                {/* Pot/Utensil */}
                <rect x="140" y="150" width="40" height="20" rx="5" fill="#9ca3af" />
                <path d="M145 150 L 175 150" stroke="#4b5563" strokeWidth="2" />
              </g>
            )}

            {isDelivering && (
              <g>
                {/* Running Legs 3D */}
                <rect x="85" y="180" width="10" height="25" rx="5" fill="white" className="animate-sway" />
                <rect x="115" y="180" width="10" height="25" rx="5" fill="white" className="animate-sway" style={{ animationDelay: '0.5s' }} />
                
                {/* Realistic 3D Packed Bag */}
                <g className="animate-float" style={{ transform: 'translate(40px, 40px)' }}>
                   <rect x="135" y="120" width="45" height="55" rx="10" fill="#fef3c7" filter="url(#shadow3d)" />
                   <path d="M140 120 Q 157 90 175 120" stroke="#d97706" strokeWidth="4" fill="none" />
                   <circle cx="157" cy="147" r="8" fill="#f38221" />
                </g>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
