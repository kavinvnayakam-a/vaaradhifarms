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
      {/* EXTREME TOP RIGHT LOGO - SMALLER */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/95 px-4 py-1.5 rounded-xl shadow-lg border border-white/20">
          <Image src={LOGO_URL} alt="Vaaradhi Farms" width={70} height={30} className="object-contain" priority />
        </div>
      </div>

      {/* Dynamic Animated Header - Character Visualizer */}
      <div className="relative h-[50vh] w-full overflow-hidden bg-primary/5 flex flex-col items-center justify-center">
        <StatusVisualizer status={order?.status || 'Pending'} />
      </div>

      <div className="relative -mt-24 px-6 z-20 max-w-lg mx-auto">
        {/* Play Game Button */}
        {['Received', 'Preparing', 'Served'].includes(order?.status || '') && (
          <div className="mb-6 flex justify-center">
            <button 
              onClick={() => setShowGame(true)}
              className="group relative flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl hover:bg-white transition-all duration-500 hover:scale-105 shadow-xl"
            >
              <div className="bg-background text-white p-1.5 rounded-lg group-hover:bg-background group-hover:animate-bounce">
                <Gamepad2 size={16} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 group-hover:text-background/40 leading-none">While you wait</span>
                <span className="font-black italic uppercase text-white group-hover:text-background tracking-tighter text-sm">Harvest Dash</span>
              </div>
              <Sparkles size={12} className="text-amber-300 animate-pulse ml-1" />
            </button>
          </div>
        )}

        {/* Status Card - Placed Closer to Character */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 animate-in slide-in-from-bottom-10 duration-1000">
          
          <div className="mb-8 pb-6 border-b border-white/10 flex flex-col items-center gap-1">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.6em]">Order Token</p>
            <h2 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-md">#{order?.orderNumber || '----'}</h2>
            
            {isTimerActive && (
              <div className="mt-4 inline-flex items-center gap-3 bg-white text-background px-5 py-2.5 rounded-xl font-black tabular-nums shadow-lg animate-pulse">
                <Clock size={14} />
                <span className="text-base">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-6 group">
                {idx !== steps.length - 1 && (
                  <div className={cn(
                    "absolute left-[19px] top-12 w-[2px] h-8 transition-all duration-1000 ease-in-out",
                    step.completed ? "bg-white opacity-40 shadow-[0_0_8px_white]" : "bg-white/5"
                  )} />
                )}
                <div className={cn(
                  "relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-1000",
                  step.completed || step.active 
                    ? "bg-white border-white text-background scale-110 shadow-lg" 
                    : "bg-transparent border-white/5 text-white/10"
                )}>
                  <step.icon size={18} className={cn(step.active && "animate-pulse")} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className={cn(
                    "font-black text-lg uppercase tracking-tight italic leading-none transition-colors duration-700",
                    step.completed || step.active ? "text-white" : "text-white/10"
                  )}>
                    {step.label}
                  </h3>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em] mt-1 text-white/20">
                    Vaaradhi Authentic
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-10">
          <GetPikLogo variant="opacity" className="scale-75" />
        </div>
      </div>

      {/* Mini Game Modal */}
      {showGame && <HarvestGame onClose={() => setShowGame(false)} />}
    </div>
  );
}
