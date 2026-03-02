"use client"

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, 
  updateDoc, addDoc, serverTimestamp, runTransaction 
} from 'firebase/firestore';
import { Order, MenuItem, CartItem, Table as TableType } from '@/lib/types';
import { 
  Printer, Check, Clock, User, Store, X, Plus, Minus, Search, ShoppingBag, CreditCard, Smartphone, ReceiptText, Wallet, Ticket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReceiptRouter, KOTComponent, CollectionTokenComponent, PrintSettings as AppPrintSettings } from './receipt-templates';

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

function formatTime(timestamp: any) {
    if (!timestamp) return 'N/A';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [feedCashReceived, setFeedCashReceived] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'UPI'>('Cash');
  const [cashReceived, setCashReceived] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
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
    const unsubTables = onSnapshot(query(collection(firestore, "tables"), orderBy("tableNumber")), (snapshot) => {
        setTables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TableType));
    });
    return () => { unsubOrders(); unsubMenu(); unsubSettings(); unsubTables(); };
  }, [firestore]);

  const totals = useMemo(() => {
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = Math.round(subtotal * 1.05);
    return { subtotal, total };
  }, [selectedItems]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-primary/5 rounded-2xl text-primary">
              <Store size={32} />
           </div>
           <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Counter Feed</h2>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-1">Vaaradhi Farms Console</p>
          </div>
        </div>
        <button onClick={() => setShowNewOrder(true)} className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-primary/20 hover:bg-accent transition-all flex items-center gap-3">
          <Plus size={18} /> Manual Order
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.filter(o => o.status === 'Pending').map((order) => (
          <div key={order.id} className="bg-white border-2 border-primary/5 rounded-[2.5rem] p-8 flex flex-col shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xl font-black text-primary italic leading-none">{order.tableId === 'Takeaway' ? 'Takeaway' : 'Dine-In'}</span>
              <span className="text-xs font-bold text-primary/40">#{order.orderNumber}</span>
            </div>
            <div className="space-y-4 mb-6 flex-1">
              <p className="font-bold text-primary uppercase text-sm">{order.customerName}</p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] font-bold text-primary/60">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <p className="pt-4 border-t border-primary/10 font-black text-primary">Total: ₹{order.totalPrice}</p>
            </div>
            <button onClick={() => confirmOrder(order)} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs hover:bg-accent transition-all">Confirm Order</button>
          </div>
        ))}
      </div>

      <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
        <DialogContent className="max-w-5xl rounded-[2.5rem]">
          <DialogHeader><DialogTitle>Manual Order</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-8">
            <ScrollArea className="h-[50vh] border rounded-2xl p-4">
              <div className="grid grid-cols-1 gap-2">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => setSelectedItems(prev => [...prev, {...item, quantity: 1}])} className="text-left p-4 bg-primary/5 rounded-xl font-bold text-primary hover:bg-accent hover:text-white transition-all">
                    {item.name} - ₹{item.price}
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-4">
              <Input placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <Select value={manualOrderTableId} onValueChange={setManualOrderTableId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Takeaway">Takeaway</SelectItem>
                  <SelectItem value="DineIn">Dine-In</SelectItem>
                </SelectContent>
              </Select>
              <div className="p-4 bg-primary/5 rounded-2xl">
                <p className="font-black text-2xl text-primary">Total: ₹{totals.total}</p>
              </div>
              <button onClick={handleCreateOrder} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase">Place Order</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-[75vw] rounded-[2.5rem]">
          <DialogHeader><DialogTitle>Print Preview</DialogTitle></DialogHeader>
          <div className="flex gap-10 overflow-x-auto p-4 justify-center bg-gray-50 rounded-2xl">
            {printingOrder && <ReceiptRouter order={printingOrder} settings={printSettings} tableNumber={null} />}
            {printingOrder && <KOTComponent order={printingOrder} tableNumber={null} />}
            {printingOrder && printingOrder.tableId === 'Takeaway' && <CollectionTokenComponent order={printingOrder} />}
          </div>
          <DialogFooter>
            <button onClick={() => { window.print(); setShowPrintPreview(false); }} className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase">Execute Print</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
