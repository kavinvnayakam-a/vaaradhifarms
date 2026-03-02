"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, CreditCard, Banknote, Smartphone, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, runTransaction } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type CartSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tableId: string | null;
};

export function CartSheet({ isOpen, onOpenChange, tableId }: CartSheetProps) {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const firestore = useFirestore();

  const subtotal = cartTotal;
  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const grandTotal = Math.round(subtotal + cgst + sgst);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'UPI'>('UPI');

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async () => {
    if (!customerName || !firestore) {
      toast({
        title: "Missing Details",
        description: "Please provide your name to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const today = new Date().toISOString().split('T')[0]; 
      const counterRef = doc(firestore, "daily_stats", today);

      const orderNumber = await runTransaction(firestore, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newCount = 1;
        if (counterDoc.exists()) {
          newCount = counterDoc.data().count + 1;
          if (newCount > 1000) newCount = 1;
        }
        transaction.set(counterRef, { count: newCount }, { merge: true });
        return newCount.toString().padStart(4, '0');
      });

      const orderData = {
        orderNumber,
        tableId: tableId || "Takeaway",
        customerName,
        customerPhone: customerPhone || "N/A",
        paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: subtotal,
        cgst: cgst,
        sgst: sgst,
        totalPrice: grandTotal,
        status: 'Pending',
        timestamp: serverTimestamp(),
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(firestore, "orders"), orderData);

      clearCart();
      setIsCheckoutOpen(false);
      onOpenChange(false);
      router.push(`/order-status/${docRef.id}`);

    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          className="flex flex-col bg-white border-l border-white/20 w-[95vw] sm:max-w-md p-0 overflow-hidden"
        >
          <SheetHeader className="p-10 border-b border-zinc-100 bg-zinc-50/50">
            <SheetTitle className="text-2xl font-bold text-background flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300 mb-2">My Selections</span>
                <span className="font-black italic uppercase text-background text-3xl tracking-tighter">{tableId === 'Takeaway' ? 'Takeaway' : 'Dine-In'}</span>
              </div>
              <div className="bg-background text-white p-5 rounded-3xl shadow-xl">
                <ShoppingBag className="h-7 w-7" />
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-8 py-10">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                <div className="w-32 h-32 bg-zinc-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-inner">
                  <ShoppingBag size={48} className="text-zinc-200" />
                </div>
                <p className="text-zinc-300 font-black uppercase tracking-[0.5em] text-[11px]">Your tray is empty</p>
              </div>
            ) : (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-right-10 duration-700">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-background text-base leading-tight truncate uppercase italic">
                        {item.name}
                      </p>
                      <p className="text-zinc-400 font-bold text-xs mt-1 tabular-nums">
                        {formatCurrency(item.price)} per unit
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-zinc-50 rounded-xl border border-zinc-100 p-1">
                        <button 
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-background rounded-lg transition-all text-zinc-300"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4"/>
                        </button>
                        <span className="w-10 text-center font-black text-base text-background tabular-nums italic">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:text-background rounded-lg transition-all text-zinc-300"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4"/>
                        </button>
                      </div>
                      <button 
                        className="p-2 text-zinc-200 hover:text-rose-500 transition-colors"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-5 w-5"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <SheetFooter className="p-10 bg-zinc-50 border-t border-zinc-100 mt-auto">
              <div className="w-full space-y-6">
                <div className="space-y-3 border-b border-zinc-200 pb-6">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Subtotal</span>
                    <span className="text-zinc-600">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>Taxes (GST 5%)</span>
                    <span className="text-zinc-600">{formatCurrency(cgst + sgst)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300">Grand Total</span>
                    <div className="text-5xl font-black text-background tracking-tighter tabular-nums mt-2 italic leading-none">
                      {formatCurrency(grandTotal)}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleOpenCheckout}
                  className="w-full h-20 text-[13px] font-black uppercase tracking-[0.4em] bg-background text-white hover:bg-black rounded-[2rem] transition-all duration-700 flex items-center justify-center gap-5 shadow-2xl active:scale-95 border-none mt-6"
                >
                  Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-background text-white border-white/20 sm:max-w-[450px] rounded-[3.5rem] p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none">Final Step</DialogTitle>
            <DialogDescription className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] mt-4">
              Enter your details to confirm the harvest.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">Customer Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="bg-white/10 border-white/10 text-white rounded-2xl h-16 px-6 font-bold placeholder:text-white/20 focus:ring-white/30 text-lg"
              />
            </div>
            
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-widest text-white/40 ml-2">Preferred Payment</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(v: any) => setPaymentMethod(v)}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { id: 'UPI', icon: Smartphone, label: 'UPI' },
                  { id: 'Card', icon: CreditCard, label: 'Card' },
                  { id: 'Cash', icon: Banknote, label: 'Cash' }
                ].map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id.toLowerCase()}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-500 cursor-pointer",
                      paymentMethod === method.id 
                        ? "bg-white text-background border-white scale-105 shadow-2xl" 
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                    )}
                  >
                    <RadioGroupItem value={method.id} id={method.id.toLowerCase()} className="sr-only" />
                    <method.icon className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="mt-10">
            <Button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !customerName}
              className="w-full h-20 bg-white text-background hover:bg-black hover:text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[13px] shadow-2xl transition-all duration-700 active:scale-95 border-none"
            >
              {isPlacingOrder ? <Loader2 className="animate-spin" /> : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
