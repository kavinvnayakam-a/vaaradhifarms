"use client";

import { useRouter } from "next/navigation";
import Image from 'next/image';
import { ShoppingBag, Utensils, ArrowRight, Sparkles } from "lucide-react";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

export default function TableSelection() {
  const router = useRouter();

  const handleSelect = (mode: string) => {
    router.push(`/?table=${mode}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-black/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas.png')] opacity-20" />
      </div>

      <div className="w-full max-w-4xl space-y-16 text-center relative z-20">
        
        {/* Branding Section */}
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="relative group transition-all duration-700 hover:scale-105">
            <div className="absolute inset-0 bg-white/20 rounded-[3rem] blur-3xl group-hover:blur-[4rem] transition-all" />
            <div className="relative bg-white px-14 py-8 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border-4 border-white/30">
              <Image 
                src={LOGO_URL} 
                alt="Vaaradhi Farms" 
                width={220} 
                height={95}
                className="object-contain" 
                priority
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-white/60 mb-2">
              <div className="h-px w-8 bg-white/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em]">Premium Dining</p>
              <div className="h-px w-8 bg-white/20" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic text-white leading-none uppercase tracking-tighter drop-shadow-2xl">
              Harvested <br /> <span className="text-white/90">For You.</span>
            </h1>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          
          {/* Dine-In Card */}
          <button 
            onClick={() => handleSelect('DineIn')}
            className="group relative bg-white/10 backdrop-blur-3xl p-12 rounded-[4rem] border-2 border-white/20 hover:bg-white hover:border-white transition-all duration-700 hover:scale-[1.05] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] text-left"
          >
            <div className="flex flex-col h-full justify-between gap-12">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:bg-background transition-colors duration-500">
                <Utensils size={36} className="text-background group-hover:text-white transition-colors" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-background/40">Available Now</p>
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white group-hover:text-background transition-colors">Dine-In</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 group-hover:text-background/60 mt-2 leading-relaxed">
                  Enjoy authentic farm flavors at our boutique location.
                </p>
              </div>
            </div>
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              <ArrowRight size={24} className="text-background" />
            </div>
          </button>

          {/* Takeaway Card */}
          <button 
            onClick={() => handleSelect('Takeaway')}
            className="group relative bg-white/10 backdrop-blur-3xl p-12 rounded-[4rem] border-2 border-white/20 hover:bg-white hover:border-white transition-all duration-700 hover:scale-[1.05] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] text-left"
          >
            <div className="flex flex-col h-full justify-between gap-12">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:bg-background transition-colors duration-500">
                <ShoppingBag size={36} className="text-background group-hover:text-white transition-colors" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-amber-300" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-background/40">Fast Pickup</p>
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white group-hover:text-background transition-colors">Takeaway</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 group-hover:text-background/60 mt-2 leading-relaxed">
                  Order ahead and pick up your favorite farm-fresh treats.
                </p>
              </div>
            </div>
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
              <ArrowRight size={24} className="text-background" />
            </div>
          </button>

        </div>

        {/* Footer info */}
        <div className="pt-12 opacity-30 flex flex-col items-center gap-4">
          <div className="h-px w-32 bg-white/20" />
          <p className="text-[9px] font-black uppercase tracking-[0.8em]">Vaaradhi Farms Boutique Experience</p>
        </div>
      </div>
    </div>
  );
}