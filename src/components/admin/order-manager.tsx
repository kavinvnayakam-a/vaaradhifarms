"use client"

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, 
  updateDoc, addDoc, serverTimestamp, runTransaction 
} from 'firebase/firestore';
import { Order, MenuItem, CartItem, Table as TableType } from '@/lib/types';
import { 
  Plus, Store, Hash, Clock, User, ArrowRight, ShoppingBag, Search, CreditCard, Smartphone, Banknote, X, Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReceiptRouter, KOTComponent, CollectionTokenComponent, type PrintSettings as AppPrintSettings } from './receipt-templates';

interface PrintSettings extends AppPrintSettings {}

const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  storeName: "Vaaradhi Farms",
  address: "Vaaradhi Farms, Authentic Authentic Dining Experience",
  phone: "+91 98765 43210",
  gstin: "36ABCDE1234F1Z5",
  fssai: "12345678901234",
  footerMessage: "Thank you for visiting Vaaradhi Farms!",
  paperWidth: '80mm',
  triggerCashDrawer: false,
  optimizedFor: "Restsol RTP-81",
  templateId: 'template-1',
};

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'UPI'>('UPI');
  const [manualOrderTableId, setManualOrderTableId] = useState('Takeaway');
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);

  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, "orders"), orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    });
    const unsubMenu = onSnapshot(collection(firestore, "menu_items"), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[]);
    });
    const unsubSettings = onSnapshot(doc(firestore, "settings", "print_template"), (d) => {
      if (d.exists()) setPrintSettings({ ...DEFAULT_PRINT_SETTINGS, ...d.data() });
    });
    return () => { unsubOrders(); unsubMenu(); unsubSettings(); };
  }, [firestore]);

  const totals = useMemo(() => {
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const packagingCharge = manualOrderTableId === 'Takeaway' ? 20 : 0;
    const total = Math.round(subtotal * 1.05 + packagingCharge);
    return { subtotal, total, packagingCharge };
  }, [selectedItems, manualOrderTableId]);

  const confirmOrder = async (order: Order) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, "orders", order.id), { status: "Received" });
      setPrintingOrder({ ...order, status: "Received" });
      setShowPrintPreview(true);
      toast({ title: "Order Confirmed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleCreateOrder = async () => {
    if (!firestore || selectedItems.length === 0 || !customerName) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const orderNumber = await runTransaction(firestore, async (transaction) => {
        const counterRef = doc(firestore, "daily_stats", today);
        const counterDoc = await transaction.get(counterRef);
        const newCount = (counterDoc.exists() ? counterDoc.data().count : 0) + 1;
        transaction.set(counterRef, { count: newCount }, { merge: true });
        return newCount.toString().padStart(4, '0');
      });

      const orderData = {
        orderNumber,
        tableId: manualOrderTableId,
        customerName,
        customerPhone: customerPhone || "N/A",
        paymentMethod,
        items: selectedItems,
        subtotal: totals.subtotal,
        cgst: totals.subtotal * 0.025,
        sgst: totals.subtotal * 0.025,
        packagingCharge: totals.packagingCharge,
        totalPrice: totals.total,
        status: 'Received',
        timestamp: serverTimestamp(),
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(firestore, "orders"), orderData);
      setPrintingOrder({ id: docRef.id, ...orderData, timestamp: { seconds: Math.floor(Date.now() / 1000) } } as Order);
      setShowPrintPreview(true);
      setShowNewOrder(false);
      setSelectedItems([]);
      setCustomerName("");
    } catch (error) {
      toast({ variant: "destructive", title: "Order Failed" });
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-background/5 rounded-2xl text-background">
              <Store size={32} />
           </div>
           <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Counter Feed</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage Incoming Orders</p>
          </div>
        </div>
        <button 
          onClick={() => setShowNewOrder(true)} 
          className="bg-background text-white px-10 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-background/20 hover:bg-zinc-900 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={18} /> New Order
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pendingOrders.map((order) => (
          <div key={order.id} className="bg-white border border-zinc-100 rounded-[3rem] p-8 flex flex-col shadow-xl hover:shadow-2xl transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-2xl font-black text-zinc-900 italic tracking-tighter block leading-none">
                  {order.tableId === 'Takeaway' ? 'Takeaway' : 'Dine-In'}
                </span>
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mt-2 block">#{order.orderNumber}</span>
              </div>
              <div className="bg-background/10 p-3 rounded-2xl text-background">
                 <ShoppingBag size={20} />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl mb-6">
               <User size={16} className="text-zinc-300"/>
               <p className="font-black text-zinc-700 uppercase italic text-xs truncate">{order.customerName}</p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] font-bold text-zinc-500 uppercase italic">
                  <span><span className="text-background font-black mr-2">{item.quantity}x</span>{item.name}</span>
                  <span className="text-zinc-300">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {order.packagingCharge ? (
                <div className="flex justify-between text-[11px] font-bold text-amber-600 uppercase italic">
                  <span>Packaging Charge</span>
                  <span>₹{order.packagingCharge}</span>
                </div>
              ) : null}
            </div>

            <div className="pt-6 border-t-2 border-dashed border-zinc-100 mb-8 flex justify-between items-end">
               <div>
                  <p className="text-[9px] font-black uppercase text-zinc-400 leading-none mb-1">Total Amount</p>
                  <p className="text-3xl font-black text-zinc-900 tracking-tighter italic leading-none">{formatCurrency(order.totalPrice)}</p>
               </div>
               <div className="flex items-center gap-2 text-zinc-300 text-[10px] font-black uppercase">
                  <Clock size={12}/> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </div>
            </div>

            <button 
              onClick={() => confirmOrder(order)} 
              className="w-full py-5 bg-background text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-zinc-900 transition-all shadow-lg shadow-background/20 flex items-center justify-center gap-3 active:scale-95"
            >
              <span>Accept Order</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}

        {pendingOrders.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-zinc-50/50 border-4 border-dashed border-zinc-100 rounded-[4rem] text-center">
             <div className="bg-white p-8 rounded-full shadow-lg mb-6">
                <Store size={48} className="text-zinc-200" />
             </div>
             <h3 className="text-2xl font-black uppercase italic text-zinc-300 tracking-tighter">Kitchen is quiet</h3>
             <p className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest mt-2">Awaiting incoming harvest requests</p>
          </div>
        )}
      </div>

      {/* Manual Order Dialog */}
      <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
        <DialogContent className="max-w-6xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>New Manual Order</DialogTitle>
            <DialogDescription>Create a new order by selecting items from the menu.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-12 h-[80vh]">
            {/* Menu Selection */}
            <div className="md:col-span-7 bg-zinc-50 p-10 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">Farm Menu</h3>
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                  <input 
                    placeholder="Search menu..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-background transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedItems(prev => {
                        const existing = prev.find(i => i.id === item.id);
                        if (existing) return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i);
                        return [...prev, {...item, quantity: 1}];
                      })}
                      className="group flex flex-col gap-2 p-5 bg-white border border-zinc-100 rounded-[2rem] text-left hover:border-background transition-all hover:shadow-xl active:scale-95"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{item.category}</span>
                        <div className="bg-background/5 p-2 rounded-xl group-hover:bg-background group-hover:text-white transition-colors">
                          <Plus size={14} />
                        </div>
                      </div>
                      <p className="font-black text-zinc-900 uppercase italic text-sm">{item.name}</p>
                      <p className="font-black text-background text-lg leading-none mt-2">₹{item.price}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Order Details */}
            <div className="md:col-span-5 bg-white p-10 flex flex-col gap-8 border-l border-zinc-100">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">Order Summary</h3>
              
              <div className="space-y-6 flex-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Customer Name</Label>
                    <Input placeholder="Enter name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Order Mode</Label>
                    <Select value={manualOrderTableId} onValueChange={setManualOrderTableId}>
                      <SelectTrigger className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Takeaway">Takeaway</SelectItem>
                        <SelectItem value="DineIn">Dine-In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Items In Bag</Label>
                  <ScrollArea className="h-[25vh] bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                    <div className="space-y-3">
                      {selectedItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-zinc-900 uppercase italic">{item.name}</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">₹{item.price} x {item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <button onClick={() => setSelectedItems(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i).filter(i => i.quantity > 0))} className="p-1 text-zinc-300 hover:text-rose-500">
                               <X size={14} />
                             </button>
                          </div>
                        </div>
                      ))}
                      {totals.packagingCharge > 0 && (
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl shadow-sm border border-amber-100">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-amber-900 uppercase italic">Packaging Charge</span>
                            <span className="text-[9px] font-bold text-amber-400 uppercase">Takeaway Default</span>
                          </div>
                          <span className="text-sm font-black text-amber-600">₹20</span>
                        </div>
                      )}
                      {selectedItems.length === 0 && <p className="text-[10px] text-zinc-300 text-center py-10 uppercase font-bold italic">No items selected</p>}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Grand Total</p>
                  <p className="text-4xl font-black text-background italic tracking-tighter leading-none">{formatCurrency(totals.total)}</p>
                </div>
                <button 
                  onClick={handleCreateOrder} 
                  disabled={selectedItems.length === 0 || !customerName}
                  className="w-full py-5 bg-background text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-background/20 hover:bg-zinc-900 transition-all disabled:opacity-50 active:scale-95"
                >
                  Confirm & Place Order
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Preview Dialog */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-[75vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-zinc-950">
          <DialogHeader className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40">
             <div>
                <DialogTitle className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
                   <Printer className="text-background" /> Thermal Preview
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Verify layout before physical output</DialogDescription>
             </div>
             <button onClick={() => setShowPrintPreview(false)} className="p-3 text-white/20 hover:text-white transition-colors">
                <X size={24} />
             </button>
          </DialogHeader>
          
          <div className="p-12 flex gap-10 overflow-x-auto justify-center items-start custom-scrollbar">
            <div className="flex-shrink-0 space-y-4">
               <p className="text-center text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Customer Receipt</p>
               {printingOrder && <ReceiptRouter order={printingOrder} settings={printSettings} tableNumber={null} />}
            </div>
            <div className="flex-shrink-0 space-y-4">
               <p className="text-center text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Kitchen Ticket (KOT)</p>
               {printingOrder && <KOTComponent order={printingOrder} tableNumber={null} />}
            </div>
            {printingOrder?.tableId === 'Takeaway' && (
              <div className="flex-shrink-0 space-y-4">
                <p className="text-center text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Collection Token</p>
                <CollectionTokenComponent order={printingOrder} />
              </div>
            )}
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5">
            <button 
              onClick={() => { window.print(); setShowPrintPreview(false); }} 
              className="w-full py-6 bg-background text-white rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-2xl hover:bg-zinc-900 transition-all active:scale-95"
            >
              Execute {printSettings.optimizedFor} Print
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden print area */}
      <div id="printable-receipt" className="hidden">
        {printingOrder && (
          <>
            <div style={{ breakAfter: 'page' }}><ReceiptRouter order={printingOrder} settings={printSettings} tableNumber={null} /></div>
            <div style={{ breakAfter: 'page' }}><KOTComponent order={printingOrder} tableNumber={null} /></div>
            {printingOrder.tableId === 'Takeaway' && <div><CollectionTokenComponent order={printingOrder} /></div>}
          </>
        )}
      </div>
    </div>
  );
}
