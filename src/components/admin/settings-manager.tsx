
"use client"

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table as TableType } from '@/lib/types';
import { Plus, Trash2, Loader2, Armchair, Settings, Save, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PrintSettings as AppPrintSettings } from './receipt-templates';

interface PrintSettings extends AppPrintSettings {}

const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  storeName: "Dindigul Ananda's Briyani",
  address: "Authentic Dindigul Briyani, Hyderabad - 500074",
  phone: "+91 98765 43210",
  gstin: "36ABCDE1234F1Z5",
  fssai: "12345678901234",
  footerMessage: "Thank you for visiting Dindigul Ananda's Briyani!",
  paperWidth: '80mm',
  triggerCashDrawer: false,
  optimizedFor: "Restsol RTP-81",
  templateId: 'template-1',
};

export default function SettingsManager() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [tempSettings, setTempSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);


  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'tables'), orderBy('tableNumber'));
    const unsubscribeTables = onSnapshot(q, (snapshot) => {
      setTables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TableType)));
    });

    const unsubSettings = onSnapshot(doc(firestore, "settings", "print_template"), (d) => {
      if (d.exists()) {
        const settings = { ...DEFAULT_PRINT_SETTINGS, ...d.data() } as PrintSettings;
        setPrintSettings(settings);
        setTempSettings(settings);
      }
    });

    return () => {
      unsubscribeTables();
      unsubSettings();
    }
  }, [firestore]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newTableNumber.trim()) return;
    setIsLoading(true);
    try {
      await addDoc(collection(firestore, 'tables'), {
        tableNumber: newTableNumber.trim(),
      });
      toast({ title: 'Table Added', description: `Table ${newTableNumber} is now available.` });
      setNewTableNumber('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add the table.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!firestore) return;
    const isConfirmed = confirm('Are you sure you want to delete this table? This cannot be undone.');
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(firestore, 'tables', id));
      toast({ title: 'Table Removed' });
    } catch (error: any) {
      console.error("Error deleting table:", error);
      if (error.code === 'failed-precondition') {
        toast({
          variant: 'destructive',
          title: 'Deletion Failed',
          description: 'This table has active orders and cannot be deleted. Please clear associated orders first.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not remove the table.',
        });
      }
    }
  };

  const saveSettings = async () => {
    if (!firestore) return;
    await setDoc(doc(firestore, "settings", "print_template"), tempSettings);
    setShowSettings(false);
    toast({ title: "Settings Saved" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Armchair size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900">Table Management</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Add or remove restaurant tables</p>
          </div>
        </div>

        <form onSubmit={handleAddTable} className="flex gap-4 mb-6">
          <Input
            placeholder="Enter Table Number (e.g., '1', 'A5')"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="h-12 bg-zinc-50 border-zinc-200 rounded-xl font-bold"
            required
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 bg-zinc-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
            <span>Add Table</span>
          </Button>
        </form>

        <div className="space-y-2">
          {tables.map(table => (
            <div key={table.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="font-bold text-zinc-800">Table {table.tableNumber}</span>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500 hover:bg-red-50 h-8 w-8" onClick={() => handleDeleteTable(table.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          {tables.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-4">No tables configured yet.</p>
          )}
        </div>
      </div>

       <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <Printer size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900">Hardware & Print</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configure receipt templates and printers</p>
            </div>
          </div>
          <Button onClick={() => setShowSettings(true)} className="h-12 px-6 bg-zinc-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary transition-all">
            <Settings size={16} className="mr-2"/>
            <span>Configure</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic flex items-center gap-3"><Settings className="text-primary"/>POS Hardware Config</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
              Calibrate thermal printer and cash drawer settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeName" className="text-[10px] font-black uppercase text-zinc-400">Store Name</Label>
                <Input id="storeName" value={tempSettings.storeName} onChange={(e) => setTempSettings(s => ({...s, storeName: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
              </div>
              <div>
                <Label htmlFor="optimizedFor" className="text-[10px] font-black uppercase text-zinc-400">Optimized For</Label>
                <Input id="optimizedFor" value={tempSettings.optimizedFor} onChange={(e) => setTempSettings(s => ({...s, optimizedFor: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
              </div>
            </div>
             <div>
                <Label htmlFor="templateId" className="text-[10px] font-black uppercase text-zinc-400">Receipt Template</Label>
                <Select value={tempSettings.templateId} onValueChange={(value) => setTempSettings(s => ({...s, templateId: value as PrintSettings['templateId']}))}>
                    <SelectTrigger id="templateId" className="bg-zinc-950 border-zinc-800">
                        <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="template-1">Classic</SelectItem>
                        <SelectItem value="template-2">Modern</SelectItem>
                        <SelectItem value="template-3">Compact</SelectItem>
                        <SelectItem value="template-4">Premium</SelectItem>
                        <SelectItem value="template-5">Minimal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="address" className="text-[10px] font-black uppercase text-zinc-400">Store Address</Label>
              <Input id="address" value={tempSettings.address} onChange={(e) => setTempSettings(s => ({...s, address: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone" className="text-[10px] font-black uppercase text-zinc-400">Phone</Label>
                <Input id="phone" value={tempSettings.phone} onChange={(e) => setTempSettings(s => ({...s, phone: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
              </div>
              <div>
                <Label htmlFor="gstin" className="text-[10px] font-black uppercase text-zinc-400">GSTIN</Label>
                <Input id="gstin" value={tempSettings.gstin} onChange={(e) => setTempSettings(s => ({...s, gstin: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
              </div>
              <div>
                <Label htmlFor="fssai" className="text-[10px] font-black uppercase text-zinc-400">FSSAI</Label>
                <Input id="fssai" value={tempSettings.fssai} onChange={(e) => setTempSettings(s => ({...s, fssai: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
              </div>
            </div>
            <div>
              <Label htmlFor="footerMessage" className="text-[10px] font-black uppercase text-zinc-400">Footer Message</Label>
              <Input id="footerMessage" value={tempSettings.footerMessage} onChange={(e) => setTempSettings(s => ({...s, footerMessage: e.target.value}))} className="bg-zinc-950 border-zinc-800" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveSettings} className="bg-primary text-white hover:bg-zinc-900 font-black uppercase text-xs tracking-widest py-3 px-6 h-auto">
              <Save className="mr-2 h-4 w-4"/>Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
