
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, 
  updateDoc, writeBatch, serverTimestamp, getDoc
} from 'firebase/firestore';
import { Order, Table as TableType } from '@/lib/types';
import { 
  CheckCircle2, Clock, ChefHat, Hash, Box, PackageCheck, Handshake, History, Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function KotView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, "orders"), orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    });

    return () => unsubOrders();
  }, [firestore]);

  useEffect(() => {
    if (!firestore || orders.length === 0 || isCleaning) return;

    const performAutoArchive = async () => {
      setIsCleaning(true);
      try {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setHours(23, 0, 0, 0); 
        if (now < cutoff) cutoff.setDate(cutoff.getDate() - 1);

        const expiredOrders = orders.filter(order => {
          const orderDate = order.timestamp?.seconds 
            ? new Date(order.timestamp.seconds * 1000) 
            : new Date(order.createdAt);
          return orderDate < cutoff;
        });

        if (expiredOrders.length > 0) {
          const batch = writeBatch(firestore);
          expiredOrders.forEach(order => {
            const historyRef = doc(collection(firestore, "order_history"));
            const orderRef = doc(firestore, "orders", order.id);
            batch.set(historyRef, { ...order, status: "Completed", archivedAt: serverTimestamp() });
            batch.delete(orderRef);
          });
          await batch.commit();
          toast({ title: "Daily Archive Complete" });
        }
      } catch (err) {
        console.error("Auto-archive failure:", err);
      } finally {
        setIsCleaning(false);
      }
    };
    performAutoArchive();
  }, [firestore, orders, isCleaning, toast]);

  const markItemPacked = async (orderId: string, itemIndex: number) => {
    if (!firestore) return;
    const orderRef = doc(firestore, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;
    
    const items = [...orderSnap.data().items];
    items[itemIndex].status = "Served";
    
    const allPacked = items.every(item => item.status === 'Served');
    const newStatus = allPacked ? "Served" : "Preparing";

    await updateDoc(orderRef, { items, status: newStatus });
    toast({ title: allPacked ? "Order Fully Packed" : "Item Packed" });
  };

  const markReadyForPickup = async (orderId: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, "orders", orderId), { status: "Ready" });
    toast({ title: "Ready for Pickup" });
  };

  const markHandover = async (orderId: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, "orders", orderId), { status: "Handover" });
    toast({ title: "Order Handovered" });
  };

  const formatOrderTime = (ts: any) => {
    if (!ts) return "";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const { preparationQueue, handoverQueue } = useMemo(() => {
    return {
      preparationQueue: orders.filter(o => ['Received', 'Preparing', 'Served', 'Ready'].includes(o.status)),
      handoverQueue: orders.filter(o => o.status === 'Handover')
    };
  }, [orders]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-background p-4 rounded-3xl shadow-lg shadow-background/20 text-white">
            <ChefHat size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black italic uppercase text-zinc-900 tracking-tighter">Kitchen Workspace</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              {preparationQueue.length + handoverQueue.length} Active Tickets
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white border border-zinc-100 rounded-3xl px-8 py-4 shadow-sm flex items-center gap-6">
              <span className="text-4xl font-black text-background italic leading-none">{preparationQueue.length}</span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Current<br/>Preparation</span>
          </div>
          <div className="bg-white border border-zinc-100 rounded-3xl px-8 py-4 shadow-sm flex items-center gap-6">
              <span className="text-4xl font-black text-zinc-200 italic leading-none">{handoverQueue.length}</span>
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">Recently<br/>Handed Over</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-3 mb-2 px-2">
             <Flame className="text-background" size={20} />
             <h4 className="text-xl font-black uppercase italic text-zinc-900 tracking-tight">In Preparation</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {preparationQueue.length > 0 ? preparationQueue.map((order) => (
              <OrderTicket 
                key={order.id} 
                order={order} 
                onPack={markItemPacked}
                onReady={markReadyForPickup}
                onHandover={markHandover}
                formatTime={formatOrderTime}
              />
            )) : (
              <EmptyState icon={<Box size={48}/>} label="Kitchen is clear" />
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-3 mb-2 px-2">
             <History className="text-zinc-300" size={20} />
             <h4 className="text-xl font-black uppercase italic text-zinc-300 tracking-tight">Archives</h4>
          </div>

          <div className="flex flex-col gap-6">
            {handoverQueue.length > 0 ? handoverQueue.map((order) => (
              <OrderTicket 
                key={order.id} 
                order={order}
                formatTime={formatOrderTime}
                isHandover
              />
            )) : (
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-200">
                <p className="text-[10px] font-black uppercase tracking-widest italic">No handovers recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTicket({ order, onPack, onReady, onHandover, formatTime, isHandover }: any) {
  const identifier = order.tableId === 'Takeaway' ? 'Collection' : `Dine-In`;
  const subIdentifier = order.customerName;

  return (
    <div className={cn(
      "bg-white border rounded-[3rem] p-8 flex flex-col transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group",
      order.status === 'Ready' ? 'border-emerald-500/30' : 
      isHandover ? 'opacity-60 grayscale scale-[0.98]' : 
      'border-zinc-100'
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-background group-hover:text-white transition-colors duration-500">
              <Hash size={18} />
           </div>
           <div>
              <span className="text-2xl font-black italic text-zinc-900 leading-none">{order.orderNumber}</span>
              <div className="flex items-center gap-2 text-zinc-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                 <Clock size={10}/> {formatTime(order.timestamp)}
              </div>
           </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mb-6 flex items-center justify-between bg-zinc-50/50 p-4 rounded-2xl">
         <span className="text-[10px] font-black uppercase text-zinc-500 truncate max-w-[140px] italic">{subIdentifier}</span>
         <span className="px-3 py-1 bg-background/5 text-background text-[9px] font-black uppercase rounded-lg">{order.items.length} Items</span>
      </div>

      <div className="space-y-3 flex-1 mb-8">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className={cn(
            "flex justify-between items-center p-4 rounded-2xl border transition-all",
            item.status === 'Served' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-zinc-50'
          )}>
            <div className="flex items-center gap-3">
              <span className="text-background font-black italic text-[11px]">{item.quantity}x</span>
              <span className={cn("text-[11px] font-black uppercase italic truncate max-w-[160px]", item.status === 'Served' ? 'line-through text-zinc-300' : 'text-zinc-800')}>
                 {item.name}
              </span>
            </div>
            {!isHandover && item.status !== 'Served' && order.status !== 'Ready' && (
              <button 
                onClick={() => onPack(order.id, idx)} 
                className="bg-zinc-900 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic hover:bg-background transition-colors"
              >
                Pack
              </button>
            )}
            {item.status === 'Served' && <PackageCheck className="text-emerald-500" size={16} />}
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {!isHandover && (
          <>
            {order.status !== 'Ready' ? (
              <button 
                onClick={() => onReady(order.id)}
                disabled={order.status !== 'Served'}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase italic text-[11px] flex items-center justify-center gap-3 transition-all duration-500 active:scale-95",
                  order.status === 'Served' 
                  ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" 
                  : "bg-zinc-50 text-zinc-300 cursor-not-allowed border border-zinc-100"
                )}
              >
                <CheckCircle2 size={18}/> Mark Ready
              </button>
            ) : (
              <button 
                onClick={() => onHandover(order.id)} 
                className="w-full py-5 bg-background text-white rounded-2xl font-black uppercase italic text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-background/20 transition-all active:scale-95"
              >
                <Handshake size={18}/> Process Handover
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: any = {
    'Received': 'bg-blue-50 text-blue-600 border-blue-100',
    'Preparing': 'bg-orange-50 text-orange-600 border-orange-100',
    'Served': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Ready': 'bg-emerald-500 text-white border-emerald-600',
    'Handover': 'bg-background text-white border-background'
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border", config[status])}>
      {status === 'Served' ? 'Packed' : status === 'Handover' ? 'Complete' : status}
    </span>
  );
}

function EmptyState({ icon, label }: any) {
  return (
    <div className="col-span-full h-64 flex flex-col items-center justify-center bg-zinc-50/50 border-4 border-dashed border-zinc-100 rounded-[4rem] text-zinc-200">
       <div className="bg-white p-6 rounded-full shadow-md mb-4">{icon}</div>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">{label}</p>
    </div>
  );
}
