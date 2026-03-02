"use client"

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  CheckCircle2, 
  ChefHat, 
  ShieldAlert,
  BellRing,
  Clock,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Order } from '@/lib/types';
import { GetPikLogo } from '@/components/getpik-logo';
import { StatusVisualizer } from '@/components/status-visualizer';
import { HarvestGame } from '@/components/harvest-game';

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";
const BEEP_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const PICKUP_TIMER_DURATION = 3 * 60;

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const orderId = params?.id as string;
  
  const orderRef = useMemoFirebase(
    () => orderId && firestore ? doc(firestore, "orders", orderId) : null,
    [orderId, firestore]
  );
  
  const { data: order, isLoading } = useDoc<Order>(orderRef);
  const [timeLeft, setTimeLeft] = useState(PICKUP_TIMER_DURATION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const audioPlayed = useRef(false);

  // STRICT NAVIGATION PROTECTION
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      alert("Navigation is restricted while your order is in progress.");
    };
    window.addEventListener('popstate', handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your order tracking will be lost. Stay on the page?";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (order?.status === 'Ready' && !audioPlayed.current) {
      new Audio(BEEP_SOUND_URL).play().catch(() => {});
      audioPlayed.current = true;
    }
    if (order?.status === 'Handover') {
      const storageKey = `handover_timer_${orderId}`;
      let endTime = localStorage.getItem(storageKey);
      if (!endTime) {
        endTime = (Date.now() + (PICKUP_TIMER_DURATION * 1000)).toString();
        localStorage.setItem(storageKey, endTime);
      }
      setIsTimerActive(true);
    }
  }, [order?.status, orderId]);

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      const updateTimer = () => {
        const storedEndTime = localStorage.getItem(`handover_timer_${orderId}`);
        if (!storedEndTime) return;
        const remaining = Math.max(0, Math.floor((parseInt(storedEndTime) - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          router.push('/thanks');
        }
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, orderId, router]);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="relative bg-white px-10 py-5 rounded-[2.5rem] shadow-2xl animate-pulse">
        <Image src={LOGO_URL} alt="Vaaradhi Farms" width={120} height={52} className="object-contain" />
      </div>
    </div>
  );

  const steps = [
    { label: 'Waiting Approval', status: 'Pending', icon: ShieldAlert, active: order?.status === 'Pending', completed: ['Received', 'Preparing', 'Served', 'Ready', 'Handover', 'Completed'].includes(order?.status || '') },
    { label: 'Order Received', status: 'Received', icon: CheckCircle2, active: order?.status === 'Received', completed: ['Preparing', 'Served', 'Ready', 'Handover', 'Completed'].includes(order?.status || '') },
    { label: 'In Kitchen', status: 'Preparing', icon: ChefHat, active: ['Preparing', 'Served'].includes(order?.status || ''), completed: ['Ready', 'Handover', 'Completed'].includes(order?.status || '') },
    { label: 'Ready for Collection', status: 'Ready', icon: BellRing, active: ['Ready', 'Handover'].includes(order?.status || ''), completed: ['Handover', 'Completed'].includes(order?.status || '') },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 overflow-hidden relative text-white selection:bg-white/20">
      {/* Background Layer - Clean & Subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-white/5 opacity-20" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-white/5 blur-[80px] rounded-full translate-x-1/3 translate-y-1/3 opacity-30" />
      </div>

      {/* Dynamic Animated Header */}
      <div className="relative h-[45vh] w-full overflow-hidden bg-primary/5 flex flex-col items-center justify-center">
        <StatusVisualizer status={order?.status || 'Pending'} />
        
        {/* LOGO PLACEMENT: TOP RIGHT */}
        <div className="absolute top-8 right-8 z-30">
          <div className="bg-white px-6 py-2 rounded-2xl shadow-xl border-4 border-white/20 transform hover:scale-105 transition-all duration-700">
            <Image src={LOGO_URL} alt="Vaaradhi Farms" width={100} height={43} className="object-contain" />
          </div>
        </div>
      </div>

      <div className="relative -mt-16 px-6 z-20 max-w-lg mx-auto">
        {/* Play Game Button */}
        {['Received', 'Preparing', 'Served'].includes(order?.status || '') && (
          <div className="mb-8 flex justify-center animate-in slide-in-from-top-10 duration-1000">
            <button 
              onClick={() => setShowGame(true)}
              className="group relative flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2rem] hover:bg-white transition-all duration-500 hover:scale-105 shadow-xl"
            >
              <div className="bg-background text-white p-2 rounded-xl group-hover:bg-background group-hover:animate-bounce">
                <Gamepad2 size={20} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-background/40">While you wait</span>
                <span className="font-black italic uppercase text-white group-hover:text-background tracking-tighter">Harvest Dash Mini-Game</span>
              </div>
              <Sparkles size={16} className="text-amber-300 animate-pulse ml-2" />
            </button>
          </div>
        )}

        {/* Status Card - Toned down glass morphism */}
        <div className="bg-white/5 backdrop-blur-xl rounded-[3.5rem] p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/10 animate-in slide-in-from-bottom-10 duration-1000">
          
          <div className="mb-10 pb-8 border-b border-white/10 flex flex-col items-center gap-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em]">Order Token</p>
            <h2 className="text-7xl font-black text-white italic tracking-tighter drop-shadow-md">#{order?.orderNumber || '----'}</h2>
            
            {isTimerActive && (
              <div className="mt-6 inline-flex items-center gap-3 bg-white text-background px-6 py-3 rounded-2xl font-black tabular-nums border-2 border-white/10 shadow-lg animate-pulse">
                <Clock size={16} />
                <span className="text-lg">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </div>
            )}
          </div>

          <div className="space-y-10">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-8 group">
                {idx !== steps.length - 1 && (
                  <div className={cn(
                    "absolute left-[23px] top-14 w-[2px] h-10 transition-all duration-1000 ease-in-out",
                    step.completed ? "bg-white opacity-40 shadow-[0_0_8px_white]" : "bg-white/5"
                  )} />
                )}
                <div className={cn(
                  "relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-1000",
                  step.completed || step.active 
                    ? "bg-white border-white text-background scale-110 shadow-lg" 
                    : "bg-transparent border-white/5 text-white/10"
                )}>
                  <step.icon size={20} className={cn(step.active && "animate-pulse")} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className={cn(
                    "font-black text-xl uppercase tracking-tight italic leading-none transition-colors duration-700",
                    step.completed || step.active ? "text-white" : "text-white/10"
                  )}>
                    {step.label}
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-2 text-white/20 group-hover:text-white/40 transition-colors">
                    Vaaradhi Authentic
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-px w-12 bg-white/10" />
            <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white/30">Vaaradhi Farms Boutique Experience</p>
          </div>
          
          <GetPikLogo variant="opacity" className="scale-90" />
        </div>
      </div>

      {/* Mini Game Modal */}
      {showGame && <HarvestGame onClose={() => setShowGame(false)} />}
    </div>
  );
}
