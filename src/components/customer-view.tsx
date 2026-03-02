"use client"

import { useState, useMemo, useEffect, useRef } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useFirestore } from '@/firebase'; 
import { collection, onSnapshot, query } from 'firebase/firestore'; 
import { Header } from '@/components/header';
import { MenuItemCard } from '@/components/menu-item-card';
import { CartSheet } from '@/components/cart-sheet';
import { CartIcon } from '@/components/cart-icon';
import type { MenuItem } from '@/lib/types';
import { ArrowUp, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CustomerView({ tableId }: { tableId: string | null, mode: 'dine-in' | 'takeaway' }) {
  const { addToCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const firestore = useFirestore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
    const q = query(collection(firestore, "menu_items")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
      setMenuItems(items);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe(); 
  }, [firestore]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      
      // Determine active category based on scroll position
      const categories = Object.keys(categoryRefs.current);
      for (const cat of categories) {
        const element = categoryRefs.current[cat];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            setActiveCategory(cat);
            break;
          }
        }
      }
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
      const offset = 140; // Account for sticky header + nav
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
      
      {/* Category Navigation Bar */}
      <nav className="sticky top-[113px] z-40 w-full bg-background/80 backdrop-blur-md border-b border-white/5 py-4 overflow-x-auto custom-scrollbar">
        <div className="container mx-auto px-6 flex items-center gap-4 min-w-max">
          {categorizedMenu.map(({ category }) => (
            <button
              key={category}
              onClick={() => scrollToCategory(category)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                activeCategory === category 
                  ? "bg-primary text-white shadow-xl scale-105" 
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-24 relative z-20">
        <div className="mb-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Purely Authentic</p>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
            Vaaradhi <span className="text-primary-foreground">Menu</span>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-white/40 max-w-xs mx-auto">
            Harvested with love, served with tradition.
          </p>
        </div>

        <div className="space-y-40">
          {categorizedMenu.map(({ category, items }) => (
            <section 
              key={category} 
              id={category} 
              ref={el => { categoryRefs.current[category] = el; }}
              className="scroll-mt-48"
            >
              <div className="flex flex-col gap-6 mb-16 relative">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-24 bg-white/5 blur-xl" />
                <div className="flex items-center gap-8">
                    <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
                      {category}
                    </h3>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
                    <div className="flex items-center gap-2 text-white/20 group cursor-default">
                      <span className="text-[10px] font-black uppercase tracking-widest">{items.length} Items</span>
                      <ChevronRight size={16} />
                    </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="bg-primary py-40 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-2xl group-hover:blur-3xl transition-all" />
            <div className="relative bg-white px-10 py-5 rounded-[2.5rem] shadow-2xl border-4 border-background/20 transform transition-transform hover:scale-105 duration-500">
              <img src="https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa" alt="Vaaradhi Farms Logo" className="h-[80px] object-contain" />
            </div>
          </div>
          
          <div className="text-center space-y-10 text-white">
             <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.8em] text-white/60">Authentic Farm Dining</p>
                <div className="h-px w-24 bg-white/10 mx-auto" />
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white/40 transition-colors">Digital Architecture By GetPik</p>
          </div>
        </div>
      </footer>

      <CartSheet isOpen={isCartOpen} onOpenChange={setCartOpen} tableId={tableId} />
      {!isCartOpen && <CartIcon onOpen={() => setCartOpen(true)} />}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          "fixed bottom-32 right-10 z-50 p-6 bg-white text-primary rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-110 active:scale-95",
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        <ArrowUp size={28} strokeWidth={4} />
      </button>
    </div>
  );
}