"use client"

import { useState, useMemo, useEffect, useRef } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useFirestore } from '@/firebase'; 
import { collection, onSnapshot, query, doc } from 'firebase/firestore'; 
import { Header } from '@/components/header';
import { MenuItemCard } from '@/components/menu-item-card';
import { CartSheet } from '@/components/cart-sheet';
import { CartIcon } from '@/components/cart-icon';
import type { MenuItem } from '@/lib/types';
import { ArrowUp, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CustomerView({ tableId }: { tableId: string | null, mode: 'dine-in' | 'takeaway' }) {
  const { addToCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const firestore = useFirestore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [globalShowImages, setGlobalShowImages] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  useEffect(() => {
    if (!firestore) return;
    
    // Fetch menu items
    const q = query(collection(firestore, "menu_items")); 
    const unsubItems = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
      setMenuItems(items);
      setLoading(false);
    }, () => setLoading(false));

    // Fetch global menu configuration
    const unsubSettings = onSnapshot(doc(firestore, "settings", "menu_config"), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalShowImages(snapshot.data().globalShowImages);
      }
    });

    return () => {
      unsubItems();
      unsubSettings();
    };
  }, [firestore]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      
      const categories = Object.keys(categoryRefs.current);
      let currentActive = categories[0];
      for (const cat of categories) {
        const element = categoryRefs.current[cat];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            currentActive = cat;
          }
        }
      }
      setActiveCategory(currentActive);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categorizedMenu = useMemo(() => {
    const categoryOrder = ['Starters', 'Main Course', 'Biryani & Rice', 'Desserts', 'Beverages'];
    const grouped = menuItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    const result = Object.keys(grouped).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    }).map(cat => ({ category: cat, items: grouped[cat] }));

    if (result.length > 0 && !activeCategory) {
      setActiveCategory(result[0].category);
    }

    return result;
  }, [menuItems, activeCategory]);

  const scrollToCategory = (category: string) => {
    const element = categoryRefs.current[category];
    if (element) {
      const offset = 180;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <Header tableId={tableId} onCartClick={() => setCartOpen(true)} timeLeft={0} />
      
      <nav className="sticky top-[113px] z-40 w-full bg-background/90 backdrop-blur-xl border-b border-white/10 py-4 sm:py-6 overflow-x-auto custom-scrollbar shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6 min-w-max">
          {categorizedMenu.map(({ category }) => (
            <button
              key={category}
              onClick={() => scrollToCategory(category)}
              className={cn(
                "group relative px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 sm:gap-3",
                activeCategory === category 
                  ? "bg-white text-background shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-105" 
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
              )}
            >
              {activeCategory === category && <Sparkles size={10} className="text-background animate-pulse" />}
              {category}
              {activeCategory === category && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full translate-y-3" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-0 sm:px-6 py-10 sm:py-24 relative z-20">
        <div className="mb-16 sm:mb-24 text-center space-y-4 sm:space-y-6 px-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Live Harvest Menu</p>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9] drop-shadow-2xl">
            Vaaradhi <br /> <span className="text-white/20">Farms.</span>
          </h2>
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.6em] text-white/40 max-w-xs mx-auto">
              Boutique Farm Experience
            </p>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </div>

        <div className="space-y-24 sm:space-y-48">
          {categorizedMenu.map(({ category, items }) => (
            <section 
              key={category} 
              id={category} 
              ref={el => { categoryRefs.current[category] = el; }}
              className="scroll-mt-48"
            >
              <div className="flex flex-col gap-4 sm:gap-8 mb-10 sm:mb-20 relative px-6 sm:px-0">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-6 h-32 bg-white/10 blur-2xl rounded-full" />
                <div className="flex items-end gap-6 sm:gap-10">
                    <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
                      {category}
                    </h3>
                    <div className="h-[1px] sm:h-[2px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-1 sm:mb-2" />
                    <div className="hidden sm:flex items-center gap-3 text-white/30 group cursor-default mb-1">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">{items.length} Options</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-14 bg-white/5 sm:bg-transparent">
                {items.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart} 
                    globalShowImages={globalShowImages}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="bg-background py-32 sm:py-48 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-16 sm:gap-20">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-3xl group-hover:blur-[4rem] transition-all duration-700" />
            <div className="relative bg-white px-10 py-5 sm:px-12 sm:py-6 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border-4 border-white/30 transform transition-transform hover:scale-105 duration-700">
              <img src="https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa" alt="Vaaradhi Farms Logo" className="h-[80px] sm:h-[100px] object-contain" />
            </div>
          </div>
          
          <div className="text-center space-y-10 text-white">
             <div className="space-y-4">
                <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.8em] sm:tracking-[1em] text-white/60">The Boutique Farm Experience</p>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
             </div>
             <div className="flex flex-col items-center gap-4 opacity-30">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white">Digital Architecture By GetPik</p>
             </div>
          </div>
        </div>
      </footer>

      <CartSheet isOpen={isCartOpen} onOpenChange={setCartOpen} tableId={tableId} />
      {!isCartOpen && <CartIcon onOpen={() => setCartOpen(true)} />}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          "fixed bottom-28 right-6 sm:bottom-32 sm:right-10 z-50 p-5 sm:p-7 bg-white text-background rounded-full shadow-2xl transition-all duration-700 hover:scale-110 active:scale-95 border-2 border-white/20",
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        <ArrowUp size={24} className="sm:w-8 sm:h-8" strokeWidth={4} />
      </button>
    </div>
  );
}
