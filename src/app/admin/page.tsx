"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MenuManager from "@/components/admin/menu-manager"; 
import OrderManager from "@/components/admin/order-manager"; 
import KotView from "@/components/admin/kot-view";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import OrderHistory from "@/components/admin/order-history"; 
import TodayOrders from "@/components/admin/today-orders";
import SettingsManager from "@/components/admin/settings-manager";
import MenuAIImporter from "@/components/admin/menu-ai-importer";
import { useFirestore } from "@/firebase";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { collection, onSnapshot, query } from "firebase/firestore";
import { 
  LogOut, 
  Clock,
  TrendingUp,
  Settings,
  ChefHat,
  Store,
  PanelLeft,
  LayoutList,
  Loader2,
  UtensilsCrossed,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { GetPikLogo } from "@/components/getpik-logo";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

type TabType = 'counter' | 'packing' | 'today_orders' | 'history' | 'menu' | 'ai_importer' | 'analytics' | 'settings';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('counter');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [auth, setAuth, isAuthLoaded] = useLocalStorage('vaaradhi-admin-auth', false);
  const firestore = useFirestore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isAuthLoaded && !auth) router.push("/admin/login");
  }, [auth, isAuthLoaded, router]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-coin-collect-1915.mp3');
  }, []);

  useEffect(() => {
    if (!firestore || !auth) return;
    const q = query(collection(firestore, "orders"));
    let isInitialLoad = true;
    const unsubSound = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) { isInitialLoad = false; return; }
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          audioRef.current?.play().catch(() => {});
          setNewOrderCount(prev => prev + 1);
        }
      });
    });
    return () => unsubSound();
  }, [firestore, auth]);

  const handleSignOut = () => { setAuth(false); router.push("/admin/login"); };

  const navItems: { id: TabType; label: string; icon: any; showBadge?: boolean }[] = [
    { id: 'counter', label: 'Counter Feed', icon: Store, showBadge: newOrderCount > 0 },
    { id: 'packing', label: 'Kitchen Packing', icon: ChefHat },
    { id: 'today_orders', label: "Today's Orders", icon: LayoutList },
    { id: 'history', label: 'Order Archives', icon: Clock },
    { id: 'menu', label: 'Menu Config', icon: UtensilsCrossed },
    { id: 'ai_importer', label: 'AI Importer', icon: Sparkles },
    { id: 'analytics', label: 'Business', icon: TrendingUp },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  if (!isAuthLoaded) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-background" /></div>;
  if (!auth) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-white text-zinc-900 font-sans">
        {/* Sidebar - Vibrant Orange */}
        <Sidebar collapsible="icon" className="bg-background text-white border-r border-white/10">
          <SidebarHeader className="py-10 px-4 flex flex-col items-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-xl">
              <Image src={LOGO_URL} alt="Vaaradhi Farms" width={120} height={52} className="object-contain" />
            </div>
            <h1 className="text-lg font-black uppercase tracking-widest mt-6 italic">Vaaradhi</h1>
          </SidebarHeader>
          <SidebarContent className="px-3 py-6">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id} className="mb-2">
                  <SidebarMenuButton 
                    onClick={() => { setActiveTab(item.id); if (item.id === 'counter') setNewOrderCount(0); }} 
                    isActive={activeTab === item.id} 
                    className={cn(
                      "flex items-center gap-4 px-4 py-7 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300", 
                      activeTab === item.id 
                        ? "bg-white text-background shadow-lg" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                    {item.showBadge && (
                      <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-white/10 flex flex-col gap-8">
            <button onClick={handleSignOut} className="flex items-center gap-4 text-[10px] font-black uppercase text-white/40 hover:text-white transition-all w-full">
              <LogOut className="w-4 h-4" /> <span>Sign Out</span>
            </button>
            <div className="mt-2">
              <GetPikLogo variant="opacity" />
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content - Pure White */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-8 py-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-zinc-400 hover:text-background transition-colors"><PanelLeft size={24} /></SidebarTrigger>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
                {activeTab.replace('_', ' ')}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-5 py-3 bg-background/5 rounded-2xl flex items-center gap-3 border border-background/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-background">System Live</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto pb-20 text-zinc-900">
              {activeTab === 'counter' && <OrderManager />}
              {activeTab === 'packing' && <KotView />}
              {activeTab === 'today_orders' && <TodayOrders />}
              {activeTab === 'history' && <OrderHistory />}
              {activeTab === 'menu' && <MenuManager />}
              {activeTab === 'ai_importer' && <MenuAIImporter />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'settings' && <SettingsManager />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
