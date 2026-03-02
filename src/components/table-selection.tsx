"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';
import { ShoppingBag, Utensils, ArrowRight } from "lucide-react";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_logo_final-02.webp?alt=media&token=648ab03a-a11d-4d9e-9614-b4408da79a4c";

export default function TableSelection() {
  const router = useRouter();

  const handleSelect = (mode: string) => {
    router.push(`/?table=${mode}`);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>

      <div className="w-full max-w-2xl space-y-12 text-center relative z-20">
        
        <div className="relative flex justify-center flex-col items-center gap-6">
          <div className="relative bg-white px-8 py-4 rounded-[2rem] shadow-2xl border-4 border-accent/20 animate-in zoom-in duration-700">
            <Image 
              src={LOGO_URL} 
              alt="Vaaradhi Farms Logo" 
              width={200} 
              height={86}
              className="object-contain" 
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic text-white leading-[1.1] uppercase tracking-tighter drop-shadow-xl">
              Welcome to <span className="text-accent">Vaaradhi Farms</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/60">
              Select your dining preference
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-1000">
          <button 
            onClick={() => handleSelect('DineIn')}
            className="group relative flex flex-col items-center justify-center gap-6 p-10 bg-white/10 hover:bg-white rounded-[3rem] border-2 border-white/20 hover:border-accent transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="p-6 bg-accent rounded-3xl group-hover:bg-primary transition-colors duration-500">
              <Utensils size={48} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors">Dine-In</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-primary/40 mt-1">Enjoy at our farm</p>
            </div>
            <ArrowRight className="absolute bottom-8 right-8 text-accent opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" />
          </button>

          <button 
            onClick={() => handleSelect('Takeaway')}
            className="group relative flex flex-col items-center justify-center gap-6 p-10 bg-white/10 hover:bg-white rounded-[3rem] border-2 border-white/20 hover:border-accent transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            <div className="p-6 bg-accent rounded-3xl group-hover:bg-primary transition-colors duration-500">
              <ShoppingBag size={48} className="text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors">Takeaway</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-primary/40 mt-1">Ready for pickup</p>
            </div>
            <ArrowRight className="absolute bottom-8 right-8 text-accent opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2" />
          </button>
        </div>

        <div className="pt-8">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            Freshness Guaranteed • Vaaradhi Farms
          </p>
        </div>
      </div>
    </div>
  );
}
