"use client"

import { useEffect } from 'react';
import { Heart, Star, ArrowRight } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_logo_final-02.webp?alt=media&token=648ab03a-a11d-4d9e-9614-b4408da79a4c";

export default function ThankYouPage() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      
      <div className="w-full max-w-md space-y-10 text-center relative z-20 pt-16">
        
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-[60px] opacity-40 animate-pulse" />
          <div className="relative bg-white px-8 py-4 rounded-[2rem] shadow-2xl border-4 border-white/20">
            <Image 
              src={LOGO_URL} 
              alt="Vaaradhi Farms Logo" 
              width={200} 
              height={86}
              className="object-contain" 
              priority
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-2">
             <Heart size={16} fill="currentColor" className="text-accent animate-pulse" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/60">Thank You</h2>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black italic text-white leading-[1.1] uppercase tracking-tighter drop-shadow-xl">
            Purely <br /> <span className="text-accent">Authentic.</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold italic tracking-widest uppercase">
            We hope you enjoyed the flavors of our farm.
          </p>
        </div>

        <Link 
          href="https://maps.app.goo.gl/xsrDeboZjQASi7eE8" 
          target="_blank"
          className="block w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-white/10 group transition-all duration-500 hover:scale-[1.02] text-primary"
        >
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-accent text-accent" />
            ))}
          </div>
          <p className="font-black italic uppercase text-xl mb-1 tracking-tighter">Loved the taste?</p>
          <p className="text-[10px] text-primary/40 mb-8 font-black uppercase tracking-widest">Rate your experience on Google</p>
          
          <div className="inline-flex items-center gap-3 bg-accent text-white font-black text-[12px] uppercase tracking-[0.4em] px-8 py-4 rounded-full group-hover:bg-primary transition-all shadow-xl shadow-accent/20">
            Open Maps <ArrowRight size={16} />
          </div>
        </Link>

        <Link href="https://www.getpik.in/pos" target="_blank" className="flex flex-col items-center gap-3 group mt-12 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white">Digital Connect By GetPik</span>
        </Link>
      </div>
    </div>
  );
}
