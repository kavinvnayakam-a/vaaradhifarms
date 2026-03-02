"use client"

import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useFirestore } from '@/firebase'; 
import { collection, onSnapshot, query } from 'firebase/firestore'; 
import { Header } from '@/components/header';
import { MenuItemCard } from '@/components/menu-item-card';
import { CartSheet } from '@/components/cart-sheet';
import { CartIcon } from '@/components/cart-icon';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';
import { cn } from "@/lib/utils";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

export default function CustomerView({ tableId }: { tableId: string | null, mode: 'dine-in' | 'takeaway' }) {
  const { addToCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const firestore = useFirestore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

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
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
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

    return Object.keys(grouped).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    }).map(cat => ({ category: cat, items: grouped[cat] }));
  }, [menuItems]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      <Header tableId={tableId} onCartClick={() => setCartOpen(true)} timeLeft={0} />
      
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-24 relative z-20">
        <header className="mb-24 text-center">
          <div className="inline-block relative p-8 mb-12 animate-in zoom-in duration-700">
             <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl opacity-50" />
             <Image 
                src={LOGO_URL} 
                alt="Vaaradhi Farms" 
                width={240} 
                height={104} 
                className="relative z-10 drop-shadow-2xl"
                priority
             />
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Vaaradhi <span className="text-primary">Farms</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mt-6">Purely Authentic Flavors</p>
        </header>

        <div className="space-y-40">
          {categorizedMenu.map(({ category, items }) => (
            <section key={category} id={category} className="scroll-mt-52">
              <div className="flex flex-col gap-4 mb-16">
                <span className="text-white font-black text-[10px] uppercase tracking-[0.4em]">Experience</span>
                <div className="flex items-center gap-8">
                    <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                    {category}
                    </h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/40 via-white/10 to-transparent" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="bg-primary py-32 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
          <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-background/20">
            <Image src={LOGO_URL} alt="Vaaradhi Farms Logo" width={160} height={69} className="object-contain" />
          </div>
          
          <div className="text-center space-y-8 text-white">
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">Vaaradhi Farms • Authentic Dining</p>
             </div>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Digital Architecture By GetPik</p>
          </div>
        </div>
      </footer>

      <CartSheet isOpen={isCartOpen} onOpenChange={setCartOpen} tableId={tableId} />
      {!isCartOpen && <CartIcon onOpen={() => setCartOpen(true)} />}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          "fixed bottom-28 right-8 z-50 p-5 bg-white text-background rounded-full shadow-2xl transition-all duration-500 hover:scale-110",
          showBackToTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        <ArrowUp size={24} strokeWidth={4} />
      </button>
    </div>
  );
}
