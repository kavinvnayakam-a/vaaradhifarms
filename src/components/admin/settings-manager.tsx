"use client"

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/types';
import { Settings, Save, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReceiptRouter, type PrintSettings as AppPrintSettings } from './receipt-templates';

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
    toast({ title: "Settings Saved" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/5 rounded-2xl text-primary">
              <Printer size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Hardware & Print</h3>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Configure receipt templates and printers</p>
            </div>
          </div>
          <Button onClick={() => setShowSettings(true)} className="h-12 px-6 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-accent transition-all">
            <Settings size={16} className="mr-2"/>
            <span>Configure</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[75vw] rounded-[3rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic flex items-center gap-3"><Settings className="text-primary"/>Hardware Config</DialogTitle>
          </DialogHeader>
          <div className="flex h-[60vh] gap-8">
            <div className="w-1/2 overflow-y-auto pr-4 space-y-6">
                <div>
                  <Label className="text-[10px] font-black uppercase text-primary/40">Store Name</Label>
                  <Input value={tempSettings.storeName} onChange={(e) => setTempSettings(s => ({...s, storeName: e.target.value}))} />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase text-primary/40">Address</Label>
                  <Input value={tempSettings.address} onChange={(e) => setTempSettings(s => ({...s, address: e.target.value}))} />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase text-primary/40">Template</Label>
                  <Select value={tempSettings.templateId} onValueChange={(v: any) => setTempSettings(s => ({...s, templateId: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template-1">Classic</SelectItem>
                      <SelectItem value="template-2">Modern</SelectItem>
                      {/* ... other templates */}
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <div className="w-1/2 bg-gray-100 rounded-3xl p-8 flex items-center justify-center">
               {/* Preview would go here */}
               <p className="text-primary/20 font-black uppercase">Template Preview</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveSettings} className="bg-primary text-white px-8 py-4 rounded-xl font-black uppercase text-xs">Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
