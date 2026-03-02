"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';
import { ShoppingBag, Utensils, ArrowRight } from "lucide-react";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

export default function TableSelection() {
  const router = useRouter();

  const handleSelect = (mode: string) => {
    router.push(`/?table=${mode}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="w-full max-w-2xl space-y-12 text-center relative z-20">
        
        <div className="relative flex justify-center flex-col items-center gap-10">
          <div className="relative bg-white px-10 py-6 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border-4 border-white/30 animate-in zoom-in duration-1000">
            <Image 
              src={LOGO_URL} 
              alt="Vaaradhi Farms Logo" 
              width={240} 
              height={104}
              className="object-contain" 
              priority
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black italic text-white leading-[1.1] uppercase tracking-tighter drop-shadow-2xl">
              Welcome to <span className="text-primary">Vaaradhi Farms</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/60">
              Select your dining preference
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in slide-in-from-bottom-12 duration-1000">
          <button 
            onClick={() => handleSelect('DineIn')}
            className="group relative flex flex-col items-center justify-center gap-8 p-12 bg-white/10 hover:bg-white rounded-[3.5rem] border-2 border-white/20 hover:border-white transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)]"
          >
            <div className="p-8 bg-primary rounded-[2rem] group-hover:bg-background transition-colors duration-500 shadow-xl">
              <Utensils size={56} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-background transition-colors">Dine-In</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-background/40 mt-2">Enjoy at our farm</p>
            </div>
            <ArrowRight className="absolute bottom-10 right-10 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" />
          </button>

          <button 
            onClick={() => handleSelect('Takeaway')}
            className="group relative flex flex-col items-center justify-center gap-8 p-12 bg-white/10 hover:bg-white rounded-[3.5rem] border-2 border-white/20 hover:border-white transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)]"
          >
            <div className="p-8 bg-primary rounded-[2rem] group-hover:bg-background transition-colors duration-500 shadow-xl">
              <ShoppingBag size={56} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-background transition-colors">Takeaway</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-background/40 mt-2">Ready for pickup</p>
            </div>
            <ArrowRight className="absolute bottom-10 right-10 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" />
          </button>
        </div>

        <div className="pt-12">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            Purely Authentic • Vaaradhi Farms
          </p>
        </div>
      </div>
    </div>
  );
}
