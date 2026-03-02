"use client"

import Image from 'next/image';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

type HeaderProps = {
  tableId: string | null;
  onCartClick: () => void;
  timeLeft: number;
};

export function Header({ tableId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-2xl border-b border-white/10 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto flex items-center justify-center px-6">
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white px-8 py-3 rounded-[2rem] shadow-2xl border-4 border-white/20 transition-all hover:scale-105 duration-500">
              <Image 
                src={LOGO_URL} 
                alt="Vaaradhi Farms Logo" 
                width={160} 
                height={69} 
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-[11px] font-black text-white tracking-[0.6em] uppercase italic opacity-80">
              Farm Fresh Experience
            </h1>
          </div>
        </div>
        
      </div>
    </header>
  );
}