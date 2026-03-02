"use client"

import Image from 'next/image';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_logo_final-02.webp?alt=media&token=648ab03a-a11d-4d9e-9614-b4408da79a4c";

type HeaderProps = {
  tableId: string | null;
  onCartClick: () => void;
  timeLeft: number;
};

export function Header({ tableId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-xl border-b border-white/5 py-6 shadow-xl">
      <div className="container mx-auto flex items-center justify-center px-6">
        
        <div className="flex flex-col items-center gap-2">
          {/* Rectangular Logo Integration */}
          <div className="relative bg-white px-6 py-2 rounded-2xl shadow-2xl border-2 border-accent/20">
            <Image 
              src={LOGO_URL} 
              alt="Vaaradhi Farms Logo" 
              width={160} 
              height={69} 
              className="object-contain"
              priority
            />
          </div>
          
          <div className="text-center mt-2">
            <h1 className="text-xs font-black text-white/60 uppercase tracking-[0.4em]">
              Vaaradhi Farms
            </h1>
          </div>
        </div>
        
      </div>
    </header>
  );
}
