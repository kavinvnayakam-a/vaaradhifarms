'use client'

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Printer, X, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReceiptRouter, type PrintSettings as AppPrintSettings } from './receipt-templates';
import { cn } from '@/lib/utils';

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

export default function SettingsManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [tempSettings, setTempSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!firestore) return;
    const unsubSettings = onSnapshot(doc(firestore, "settings", "print_template"), (d) => {
      if (d.exists()) {
        const settings = { ...DEFAULT_PRINT_SETTINGS, ...d.data() } as PrintSettings;
        setPrintSettings(settings);
        setTempSettings(settings);
      }
    });
    return () => unsubSettings();
  }, [firestore]);

  const saveSettings = async () => {
    if (!firestore) return;
    await setDoc(doc(firestore, "settings", "print_template"), tempSettings);
    setShowSettings(false);
    toast({ title: "Configuration Updated" });
  };

  const templates = [
    { id: 'template-1', name: 'Classic Thermal' },
    { id: 'template-2', name: 'Modern Sans' },
    { id: 'template-3', name: 'Minimalist' },
    { id: 'template-4', name: 'Compact' },
    { id: 'template-5', name: 'Large Type' },
    { id: 'template-6', name: 'Centered' },
    { id: 'template-7', name: 'Detailed' },
    { id: 'template-8', name: 'Retail Style' },
    { id: 'template-9', name: 'Boutique' },
    { id: 'template-10', name: 'Eco Minimal' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-background/5 rounded-3xl text-background">
            <Printer size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">Print Engine</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage Hardware & Bill Templates</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-3xl border border-zinc-100">
           <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-zinc-400">Current Template</p>
              <p className="text-sm font-black italic uppercase text-zinc-900">{templates.find(t => t.id === printSettings.templateId)?.name}</p>
           </div>
           <button 
            onClick={() => setShowSettings(true)}
            className="bg-background text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[11px] shadow-xl shadow-background/20 hover:bg-zinc-900 transition-all active:scale-95"
           >
             Configure Hardware
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
               <CheckCircle2 size={24} />
            </div>
            <h4 className="text-lg font-black uppercase italic text-zinc-900">RTP-81 Optimized</h4>
            <p className="text-[11px] text-zinc-400 font-bold uppercase leading-relaxed italic">All templates are pre-scaled for standard 80mm thermal paper widths.</p>
         </div>
         <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
               <LayoutGrid size={24} />
            </div>
            <h4 className="text-lg font-black uppercase italic text-zinc-900">Multi-Template</h4>
            <p className="text-[11px] text-zinc-400 font-bold uppercase leading-relaxed italic">Choose from 10 distinct branding styles for your physical receipts.</p>
         </div>
      </div>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[85vw] h-[85vh] rounded-[3.5rem] p-0 overflow-hidden bg-white border-none shadow-2xl">
          <div className="flex h-full flex-col md:flex-row">
            {/* Controls Side */}
            <div className="w-full md:w-[450px] p-10 bg-zinc-50 flex flex-col gap-8 border-r border-zinc-100 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900 flex items-center gap-3">
                  <Settings className="text-background" /> Config
                </DialogTitle>
                <button onClick={() => setShowSettings(false)} className="p-2 text-zinc-300 hover:text-rose-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Store Display Name</Label>
                  <Input value={tempSettings.storeName} onChange={(e) => setTempSettings(s => ({...s, storeName: e.target.value}))} className="h-12 border-zinc-200 rounded-xl font-bold bg-white text-zinc-900" />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Physical Address</Label>
                  <Input value={tempSettings.address} onChange={(e) => setTempSettings(s => ({...s, address: e.target.value}))} className="h-12 border-zinc-200 rounded-xl font-bold bg-white text-zinc-900" />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Support Phone</Label>
                  <Input value={tempSettings.phone} onChange={(e) => setTempSettings(s => ({...s, phone: e.target.value}))} className="h-12 border-zinc-200 rounded-xl font-bold bg-white text-zinc-900" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">GSTIN Number</Label>
                    <Input value={tempSettings.gstin} onChange={(e) => setTempSettings(s => ({...s, gstin: e.target.value}))} className="h-12 border-zinc-200 rounded-xl font-bold bg-white text-zinc-900" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">FSSAI Number</Label>
                    <Input value={tempSettings.fssai} onChange={(e) => setTempSettings(s => ({...s, fssai: e.target.value}))} className="h-12 border-zinc-200 rounded-xl font-bold bg-white text-zinc-900" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Visual Branding Template</Label>
                  <Select value={tempSettings.templateId} onValueChange={(v: any) => setTempSettings(s => ({...s, templateId: v}))}>
                    <SelectTrigger className="h-14 border-zinc-200 rounded-xl font-black uppercase italic bg-white text-zinc-900"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id} className="font-bold uppercase italic text-xs">{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-auto pt-10">
                <Button onClick={saveSettings} className="w-full h-16 bg-background text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-background/20 hover:bg-zinc-900 transition-all active:scale-95">
                  Apply Configuration
                </Button>
              </div>
            </div>

            {/* Preview Side */}
            <div className="flex-1 bg-white p-16 overflow-y-auto custom-scrollbar flex flex-col items-center gap-10">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.5em]">Live Hardware Preview</p>
                  <div className="h-[1px] w-20 bg-zinc-100 mx-auto" />
               </div>
               <div className="scale-110 origin-top shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-sm">
                  {/* Static Mock Order for Preview */}
                  <ReceiptRouter 
                    order={{
                      orderNumber: '0042',
                      customerName: 'Demo Customer',
                      tableId: 'Takeaway',
                      items: [
                        { name: 'Demo Harvest Box', quantity: 2, price: 250 },
                        { name: 'Organic Nectar', quantity: 1, price: 120 }
                      ],
                      subtotal: 620,
                      cgst: 15.5,
                      sgst: 15.5,
                      totalPrice: 651,
                      timestamp: { seconds: Date.now() / 1000 }
                    } as any} 
                    settings={tempSettings} 
                    tableNumber={null} 
                  />
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
