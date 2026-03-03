"use client"

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, onSnapshot, query, where, Timestamp, getDocs, doc 
} from 'firebase/firestore';
import { Order } from '@/lib/types';
import { 
  Printer, ShoppingBag, User, LayoutList, Search, X, ReceiptText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReceiptRouter, KOTComponent, CollectionTokenComponent, type PrintSettings as AppPrintSettings } from './receipt-templates';

interface PrintSettings extends AppPrintSettings {}

const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  storeName: "Vaaradhi Farms",
  address: "Vaaradhi Farms, Hyderabad",
  phone: "+91 98765 43210",
  gstin: "36ABCDE1234F1Z5",
  fssai: "12345678901234",
  footerMessage: "Thank you for visiting Vaaradhi Farms!",
  paperWidth: '80mm',
  triggerCashDrawer: false,
  optimizedFor: "Restsol RTP-81",
  templateId: 'template-1',
};

export default function TodayOrders() {
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Shift starts at 1:00 AM
  const getShiftStart = () => {
    const d = new Date();
    d.setHours(1, 0, 0, 0);
    if (new Date().getHours() < 1) {
      d.setDate(d.getDate() - 1);
    }
    return d;
  };

  const getShiftEnd = () => {
    const d = getShiftStart();
    d.setDate(d.getDate() + 1);
    return d;
  };

  useEffect(() => {
    if (!firestore) return;

    const unsubSettings = onSnapshot(doc(firestore, "settings", "print_template"), (d) => {
      if (d.exists()) setPrintSettings({ ...DEFAULT_PRINT_SETTINGS, ...d.data() } as PrintSettings);
    });

    const shiftStart = getShiftStart();
    const shiftEnd = getShiftEnd();

    const qLive = query(
      collection(firestore, "orders"), 
      where("timestamp", ">=", Timestamp.fromDate(shiftStart)),
      where("timestamp", "<=", Timestamp.fromDate(shiftEnd))
    );

    const unsubLive = onSnapshot(qLive, (snapshot) => {
      setLiveOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
      if (loading) setLoading(false);
    });

    const fetchHistory = async () => {
      try {
        const qHist = query(
          collection(firestore, "order_history"),
          where("timestamp", ">=", Timestamp.fromDate(shiftStart)),
          where("timestamp", "<=", Timestamp.fromDate(shiftEnd))
        );
        const snapshot = await getDocs(qHist);
        setHistoryOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
      } catch (e) {
        toast({ variant: 'destructive', title: 'History Fetch Error' });
      } finally {
        if(loading) setLoading(false);
      }
    };
    
    fetchHistory();
    return () => { unsubLive(); unsubSettings(); };
  }, [firestore, toast, loading]);

  const allTodaysOrders = useMemo(() => {
    const combined = [...liveOrders, ...historyOrders];
    return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [liveOrders, historyOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return allTodaysOrders;
    return allTodaysOrders.filter(order => 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.includes(searchTerm)
    );
  }, [allTodaysOrders, searchTerm]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-background/5 rounded-2xl text-background">
              <LayoutList size={32} />
           </div>
           <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Today's Registry</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Active Shift: {getShiftStart().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} to {getShiftEnd().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        <div className="relative flex-1 md:flex-none w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
          <input 
            placeholder="Search by token or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-bold uppercase outline-none focus:border-background transition-all w-full md:w-80 text-zinc-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-32 text-center font-black uppercase italic text-zinc-300 animate-pulse">
            Syncing Daily Records...
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-lg flex flex-col gap-6 hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-3xl font-black italic text-zinc-900 tracking-tighter block leading-none">#{order.orderNumber}</span>
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-2 block">{order.tableId}</span>
                </div>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest",
                  order.status === 'Completed' || order.status === 'Handover' ? 'bg-zinc-50 text-zinc-400 border-zinc-100' : 'bg-background/5 text-background border-background/10'
                )}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-4 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-50">
                  <div className="bg-white p-2.5 rounded-xl shadow-sm">
                    <User size={16} className="text-background"/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase italic text-zinc-800">{order.customerName}</span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
              </div>

              <div className="space-y-3 flex-1 max-h-48 overflow-y-auto custom-scrollbar pr-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] uppercase italic font-bold text-zinc-500">
                    <span><span className="text-background font-black mr-2">{item.quantity}x</span>{item.name}</span>
                    <span className="text-zinc-300">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-zinc-50 pt-6 flex justify-between items-end">
                 <div>
                    <p className="text-[9px] font-black uppercase text-zinc-400 leading-none mb-1">Grand Total</p>
                    <p className="text-2xl font-black italic text-background leading-none tracking-tighter">{formatCurrency(order.totalPrice)}</p>
                 </div>
                 <button 
                  onClick={() => { setPrintingOrder(order); setShowPrintPreview(true); }} 
                  className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl hover:bg-background transition-all active:scale-95"
                 >
                    <Printer size={18}/>
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-zinc-50 border-4 border-dashed border-zinc-100 rounded-[4rem] text-zinc-200">
             <ShoppingBag size={48} className="mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">No activity recorded in this shift</p>
          </div>
        )}
      </div>

      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-[95vw] md:max-w-md rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-zinc-950">
          <DialogHeader className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
             <div>
                <DialogTitle className="text-xl font-black uppercase italic text-white flex items-center gap-3">
                   <ReceiptText className="text-background" /> Thermal Preview
                </DialogTitle>
                <DialogDescription className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Review Layout Sequence</DialogDescription>
             </div>
             <button onClick={() => setShowPrintPreview(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                <X size={20} />
             </button>
          </DialogHeader>
          
          <div className="p-6 md:p-8 flex flex-col gap-10 items-center overflow-y-auto max-h-[60vh] custom-scrollbar bg-zinc-900/50">
            <div className="space-y-2 w-full flex flex-col items-center">
               <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.3em]">1. Invoice</p>
               {printingOrder && <ReceiptRouter order={printingOrder} settings={printSettings} tableNumber={null} />}
            </div>
            <div className="space-y-2 w-full flex flex-col items-center">
               <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.3em]">2. Kitchen Ticket (KOT)</p>
               {printingOrder && <KOTComponent order={printingOrder} tableNumber={null} />}
            </div>
            <div className="space-y-2 w-full flex flex-col items-center">
              <p className="text-white/30 text-[8px] font-black uppercase tracking-[0.3em]">3. Collection Token</p>
              {printingOrder && <CollectionTokenComponent order={printingOrder} />}
            </div>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5">
             <button onClick={() => { window.print(); setShowPrintPreview(false); }} className="w-full py-5 bg-background text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-zinc-900 transition-all active:scale-95">
                Execute Thermal Print
             </button>
          </div>
        </DialogContent>
      </Dialog>

      <div id="printable-receipt" className="hidden">
        {printingOrder && (
          <>
            <div className="print-page-break"><ReceiptRouter order={printingOrder} settings={printSettings} tableNumber={null} /></div>
            <div className="print-page-break"><KOTComponent order={printingOrder} tableNumber={null} /></div>
            <div className="print-page-break"><CollectionTokenComponent order={printingOrder} /></div>
          </>
        )}
      </div>
    </div>
  );
}
