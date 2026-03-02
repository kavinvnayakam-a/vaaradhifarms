"use client"

import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { importMenu, type ImportMenuOutput } from "@/ai/flows/import-menu-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Upload, CheckCircle2, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn, formatCurrency } from "@/lib/utils";
import Image from "next/image";

export default function MenuAIImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ImportMenuOutput['items'] | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setExtractedItems(null);
    }
  };

  const handleExtract = async () => {
    if (!preview) return;
    setIsExtracting(true);
    try {
      const result = await importMenu({ photoDataUri: preview });
      setExtractedItems(result.items);
      toast({ title: "Extraction Successful", description: `Found ${result.items.length} items.` });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "AI Error", description: "Could not read the menu. Please try a clearer photo." });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveAll = async () => {
    if (!firestore || !extractedItems) return;
    setIsSaving(true);
    try {
      const menuCol = collection(firestore, "menu_items");
      const promises = extractedItems.map(item => 
        addDoc(menuCol, {
          ...item,
          available: true,
          showImage: false,
          image: "",
          timestamp: serverTimestamp()
        })
      );
      await Promise.all(promises);
      toast({ title: "Inventory Synced", description: "All extracted items added to your menu." });
      setExtractedItems(null);
      setFile(null);
      setPreview(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const removeItem = (index: number) => {
    if (!extractedItems) return;
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-background p-4 rounded-3xl shadow-lg shadow-background/20 text-white">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-black italic uppercase text-zinc-900 tracking-tighter">AI Menu Importer</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Digitize physical menus instantly using Vision AI
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Upload & Preview Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 border-dashed border-zinc-200 rounded-[3rem] overflow-hidden bg-zinc-50/50">
            <CardContent className="p-8">
              {!preview ? (
                <label className="flex flex-col items-center justify-center gap-4 cursor-pointer py-20 hover:bg-white transition-colors group">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-background" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase italic text-zinc-900">Upload Menu Image</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">JPG, PNG or PDF (Max 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image src={preview} alt="Menu Preview" fill className="object-cover" />
                  <button 
                    onClick={() => { setPreview(null); setFile(null); setExtractedItems(null); }}
                    className="absolute top-4 right-4 bg-background text-white p-2 rounded-xl shadow-xl hover:bg-zinc-900 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {preview && !extractedItems && (
            <Button 
              onClick={handleExtract} 
              disabled={isExtracting}
              className="w-full h-16 bg-background text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-background/20 hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isExtracting ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {isExtracting ? "AI is reading menu..." : "Start AI Extraction"}
            </Button>
          )}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7">
          {!extractedItems ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-zinc-50 border-4 border-dashed border-zinc-100 rounded-[4rem] text-center p-10">
               <div className="bg-white p-8 rounded-full shadow-lg mb-6">
                  <AlertCircle size={48} className="text-zinc-200" />
               </div>
               <h3 className="text-2xl font-black uppercase italic text-zinc-300 tracking-tighter">Awaiting Input</h3>
               <p className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest mt-2 max-w-xs">
                 Upload a clear photo of your menu card to see the magic happen.
               </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xl font-black uppercase italic text-zinc-900 tracking-tight flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-500" /> Review Extracted Items
                </h4>
                <span className="px-4 py-1.5 bg-zinc-100 rounded-full text-[9px] font-black uppercase text-zinc-400">{extractedItems.length} Items Found</span>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
                {extractedItems.map((item, idx) => (
                  <div key={idx} className="group bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-3 py-1 bg-background/5 text-background text-[8px] font-black uppercase rounded-lg">{item.category}</span>
                          <h5 className="font-black text-zinc-900 uppercase italic text-sm">{item.name}</h5>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight line-clamp-1">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-background italic leading-none mb-2">{formatCurrency(item.price)}</p>
                        <button onClick={() => removeItem(idx)} className="text-zinc-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-zinc-100 p-8 rounded-[3rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Action Required</p>
                  <p className="text-sm font-bold text-zinc-900 uppercase italic">Confirm and push to live menu</p>
                </div>
                <Button 
                  onClick={handleSaveAll} 
                  disabled={isSaving}
                  className="px-10 h-14 bg-background text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-background/20 hover:bg-zinc-900 transition-all active:scale-95"
                >
                  {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                  Finalize & Sync Inventory
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
