"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MenuManager from "@/components/admin/menu-manager"; 
import OrderManager from "@/components/admin/order-manager"; 
import KotView from "@/components/admin/kot-view";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import TodayOrders from "@/components/admin/today-orders";
import SettingsManager from "@/components/admin/settings-manager";
import { useFirestore, useUser, useAuth } from "@/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { 
  LogOut, 
  TrendingUp,
  Settings,
  ChefHat,
  Store,
  PanelLeft,
  LayoutList,
  Loader2,
  UtensilsCrossed,
  MoreHorizontal
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
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { GetPikLogo } from "@/components/getpik-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

type TabType = 'counter' | 'packing' | 'today_orders' | 'menu' | 'analytics' | 'settings';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('counter');
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const authInstance = useAuth();
  const firestore = useFirestore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/admin/login");
  }, [user, isUserLoading, router]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-coin-collect-1915.mp3');
  }, []);

  useEffect(() => {
    if (!firestore || !user) return;
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
  }, [firestore, user]);

  const handleSignOut = async () => { 
    if (authInstance) {
      await signOut(authInstance);
      router.push("/admin/login");
    }
  };

  const navItems: { id: TabType; label: string; icon: any; showBadge?: boolean }[] = [
    { id: 'counter', label: 'Counter Feed', icon: Store, showBadge: newOrderCount > 0 },
    { id: 'packing', label: 'Kitchen Packing', icon: ChefHat },
    { id: 'today_orders', label: "Today's Orders", icon: LayoutList },
    { id: 'menu', label: 'Menu Config', icon: UtensilsCrossed },
    { id: 'analytics', label: 'Business', icon: TrendingUp },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  // Logic for the mobile/tablet bottom bar (Limit to 4 primary items)
  const primaryNav = navItems.slice(0, 4);
  const secondaryNav = navItems.slice(4);

  if (isUserLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-background" /></div>;
  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-white text-zinc-900 font-sans relative overflow-hidden">
        {/* Optimized Desktop Sidebar */}
        <Sidebar collapsible="icon" className="bg-background text-white border-r border-white/10 hidden lg:flex">
          <SidebarHeader className="py-12 px-4 flex flex-col items-center overflow-visible">
            <div className="relative group transition-all duration-500">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white p-3 rounded-2xl shadow-2xl min-w-[60px] min-h-[60px] flex items-center justify-center group-data-[collapsible=icon]:scale-125 group-data-[collapsible=icon]:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-transform duration-500">
                <Image 
                  src={LOGO_URL} 
                  alt="Vaaradhi Farms" 
                  width={80} 
                  height={34} 
                  className="object-contain" 
                />
              </div>
            </div>
            <div className="mt-6 text-center group-data-[collapsible=icon]:hidden">
              <h1 className="text-sm font-black uppercase tracking-[0.3em] italic text-white/90">Vaaradhi</h1>
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Management</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 py-8">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id} className="mb-3">
                  <SidebarMenuButton 
                    onClick={() => { setActiveTab(item.id); if (item.id === 'counter') setNewOrderCount(0); }} 
                    isActive={activeTab === item.id} 
                    className={cn(
                      "flex items-center gap-4 px-4 py-8 rounded-2xl transition-all duration-500 group relative overflow-hidden", 
                      activeTab === item.id 
                        ? "bg-white text-background shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-[1.02]" 
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", activeTab === item.id && "stroke-[2.5px]")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] group-data-[collapsible=icon]:hidden">
                      {item.label}
                    </span>
                    {item.showBadge && (
                      <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white] group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:right-2" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6 border-t border-white/5 flex flex-col gap-10">
            <button 
              onClick={handleSignOut} 
              className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all group w-full px-4"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </button>
            
            <div className="flex justify-center group-data-[collapsible=icon]:hidden">
              <GetPikLogo variant="opacity" className="scale-[0.8]" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50/30">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-zinc-100 px-4 md:px-10 py-4 md:py-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 md:gap-8">
              <SidebarTrigger className="hidden lg:flex text-zinc-400 hover:text-background hover:bg-background/5 p-2 rounded-xl transition-all shrink-0">
                <PanelLeft className="w-5 h-5 md:w-6 md:h-6" />
              </SidebarTrigger>
              <div className="h-8 w-px bg-zinc-100 hidden lg:block" />
              <h2 className="text-xl md:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 truncate flex items-center gap-4">
                <span className="opacity-10 text-background">/</span>
                {activeTab.replace('_', ' ')}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
              <div className="px-4 md:px-6 py-2 md:py-3.5 bg-background/5 rounded-2xl flex items-center gap-3 border border-background/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-background whitespace-nowrap">Cloud Connected</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] select-none scale-150">
               <Image src={LOGO_URL} alt="" width={400} height={172} />
            </div>

            <div className="max-w-7xl mx-auto pb-32 md:pb-10 relative z-10">
              {activeTab === 'counter' && <OrderManager />}
              {activeTab === 'packing' && <KotView />}
              {activeTab === 'today_orders' && <TodayOrders />}
              {activeTab === 'menu' && <MenuManager />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'settings' && <SettingsManager />}
            </div>
          </main>

          {/* Mobile & Tablet Bottom Navigation (Up to Large Screens) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white/90 backdrop-blur-2xl border-t border-zinc-100 flex items-center justify-around h-24 px-4 shadow-[0_-15px_50px_rgba(0,0,0,0.08)]">
            <div className="flex w-full max-w-2xl mx-auto items-center justify-between px-2 gap-1">
              {primaryNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if (item.id === 'counter') setNewOrderCount(0); }}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-2 transition-all duration-500 rounded-2xl py-3 px-1",
                    activeTab === item.id ? "bg-background text-white shadow-xl scale-105" : "text-zinc-300"
                  )}
                >
                  <div className="relative">
                    <item.icon className={cn("w-5 h-5", activeTab === item.id ? "stroke-[2.5px]" : "stroke-[2px]")} />
                    {item.showBadge && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse border-2 border-background" />
                    )}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-center truncate w-full">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              ))}

              {/* More Trigger */}
              <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                <SheetTrigger asChild>
                  <button className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-2 transition-all duration-500 rounded-2xl py-3 px-1",
                    secondaryNav.some(i => i.id === activeTab) ? "bg-zinc-900 text-white" : "text-zinc-300"
                  )}>
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">More</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[3rem] border-none bg-zinc-50 p-8 pb-12">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">Boutique Tools</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-4">
                    {secondaryNav.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-[2rem] transition-all",
                          activeTab === item.id ? "bg-background text-white shadow-2xl" : "bg-white text-zinc-400 border border-zinc-100"
                        )}
                      >
                        <item.icon className="w-8 h-8" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                    <button 
                      onClick={handleSignOut}
                      className="col-span-2 flex items-center justify-center gap-3 p-6 mt-4 rounded-2xl bg-rose-50 text-rose-500 font-black uppercase text-[10px] tracking-widest"
                    >
                      <LogOut size={16} /> End Management Session
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
