"use client"

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  CheckCircle2, 
  ChefHat, 
  Star,
  ShieldAlert,
  BellRing,
  Clock
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Order } from '@/lib/types';

const HERO_IMG = "https://picsum.photos/seed/farm_fresh/1200/800";
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
  const audioPlayed = useRef(false);

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

  if (isLoading) return null;

  const steps = [
    { label: 'Waiting for Approval', status: 'Pending', icon: ShieldAlert, active: order?.status === 'Pending', completed: ['Received', 'Preparing', 'Served', 'Ready', 'Handover'].includes(order?.status || '') },
    { label: 'Harvesting Flavors', status: 'Received', icon: CheckCircle2, active: order?.status === 'Received', completed: ['Preparing', 'Served', 'Ready', 'Handover'].includes(order?.status || '') },
    { label: 'In Kitchen', status: 'Preparing', icon: ChefHat, active: ['Preparing', 'Served'].includes(order?.status || ''), completed: ['Ready', 'Handover'].includes(order?.status || '') },
    { label: 'Ready for Collection', status: 'Ready', icon: BellRing, active: ['Ready', 'Handover'].includes(order?.status || ''), completed: order?.status === 'Handover' },
  ];

  return (
    <div className="min-h-screen bg-background pb-10 overflow-hidden relative text-white">
      <div className="relative h-[35vh] w-full overflow-hidden bg-primary">
        <Image src={HERO_IMG} alt="Farm Fresh" fill className="object-cover opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-8 right-6 z-30">
          <div className="relative p-4 bg-white rounded-2xl shadow-2xl border-4 border-white/20">
            <Image src={LOGO_URL} alt="Vaaradhi Farms" width={100} height={43} className="object-contain" />
          </div>
        </div>
      </div>

      <div className="relative -mt-20 px-4 md:px-6 z-20">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/20">
          <div className="mb-10 pb-6 border-b border-white/10 flex justify-between items-end">
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] mb-1">Order Token</p>
              <h2 className="text-6xl font-black text-white italic tracking-tighter">#{order?.orderNumber || '---'}</h2>
            </div>
            {isTimerActive && (
              <div className="bg-primary px-4 py-2 rounded-xl text-white font-black tabular-nums border border-white/20">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            )}
          </div>

          <div className="space-y-10">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-8">
                {idx !== steps.length - 1 && (
                  <div className={cn("absolute left-[21px] top-12 w-[2px] h-10 transition-colors duration-500", step.completed ? "bg-white" : "bg-white/10")} />
                )}
                <div className={cn("relative z-10 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-700", step.completed || step.active ? "bg-white border-white text-background" : "bg-transparent border-white/10 text-white/10")}>
                  <step.icon size={20} className={cn(step.active && "animate-pulse")} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className={cn("font-black text-lg uppercase tracking-tight italic leading-none", step.completed || step.active ? "text-white" : "text-white/20")}>{step.label}</h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest mt-1.5 text-white/40">Vaaradhi Farms Authentic</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-12 flex flex-col items-center gap-3 opacity-40">
        <p className="text-[8px] font-black uppercase tracking-[0.3em]">Vaaradhi Farms • Authentic Dining</p>
      </footer>
    </div>
  );
}
