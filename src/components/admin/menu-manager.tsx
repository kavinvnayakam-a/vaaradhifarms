
"use client"

import { useState, useEffect } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp, 
  setDoc 
} from 'firebase/firestore';
import { uploadMenuImage } from '@/lib/upload-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trash2, 
  Camera, 
  Loader2, 
  Image as ImageIcon, 
  Plus, 
  X, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Coins
} from 'lucide-react';
import { MenuItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [globalShowImages, setGlobalShowImages] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    const unsubItems = onSnapshot(collection(firestore, "menu_items"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MenuItem)));
    });

    const unsubSettings = onSnapshot(doc(firestore, "settings", "menu_config"), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalShowImages(snapshot.data().globalShowImages);
      }
    });

    return () => { unsubItems(); unsubSettings(); };
  }, [firestore]);

  const toggleGlobalImages = async () => {
    if (!firestore) return;
    const settingsRef = doc(firestore, "settings", "menu_config");
    await setDoc(settingsRef, { globalShowImages: !globalShowImages }, { merge: true });
  };

  const toggleImageVisibility = async (item: MenuItem) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "menu_items", item.id);
    await updateDoc(itemRef, { 
      showImage: item.showImage === undefined ? false : !item.showImage 
    });
  };

  const toggleStatus = async (item: MenuItem) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "menu_items", item.id);
    await updateDoc(itemRef, { available: !item.available });
  };

  const handleUpdatePrice = async (itemId: string, newPrice: number) => {
    if (!firestore || isNaN(newPrice) || newPrice < 0) {
      toast({ variant: "destructive", title: "Invalid Price" });
      return;
    }
    const itemRef = doc(firestore, "menu_items", itemId);
    try {
      await updateDoc(itemRef, { price: newPrice });
      toast({ title: "Price Updated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleUpdateDescription = async (itemId: string, newDesc: string) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "menu_items", itemId);
    await updateDoc(itemRef, { description: newDesc });
  };

  const handleRemoveImage = async (itemId: string) => {
    if (!firestore) return;
    if (!confirm("Remove this image?")) return;
    try {
      const itemRef = doc(firestore, "menu_items", itemId);
      await updateDoc(itemRef, { image: "", showImage: false });
      toast({ title: "Image Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleUpdateImage = async (itemId: string, newFile: File) => {
    if (!firestore || !storage) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadMenuImage(storage, newFile);
      if (imageUrl) {
        const itemRef = doc(firestore, "menu_items", itemId);
        await updateDoc(itemRef, { image: imageUrl, showImage: true });
        toast({ title: "Image Updated" });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally { setIsUploading(false); }
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !storage) return;
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    try {
      let imageUrl = "";
      if (file) {
        imageUrl = await uploadMenuImage(storage, file) || "";
      }
      await addDoc(collection(firestore, "menu_items"), {
        name: formData.get("name"),
        price: Number(formData.get("price")),
        category: formData.get("category"),
        description: formData.get("description"),
        image: imageUrl,
        showImage: imageUrl ? true : false,
        available: true,
        timestamp: serverTimestamp()
      });
      setFile(null);
      (e.target as HTMLFormElement).reset();
      toast({ title: "Item Added" });
    } catch (err) {
      toast({ variant: "destructive", title: "Add Failed" });
    } finally { setIsUploading(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* MASTER CONTROL */}
      <section className="bg-background/5 border border-background/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-background">Master Display Control</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Globally toggle images on customer view</p>
        </div>
        <Button 
          onClick={toggleGlobalImages}
          className={cn(
            "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-500",
            globalShowImages 
              ? "bg-background text-white shadow-xl shadow-background/20" 
              : "bg-zinc-100 text-zinc-400"
          )}
        >
          {globalShowImages ? "All Images Visible" : "All Images Hidden"}
        </Button>
      </section>

      {/* ADD ITEM */}
      <section className="bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-xl">
        <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3 text-zinc-900">
          <Plus className="w-6 h-6 text-background" /> New Menu Selection
        </h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Item Name</label>
            <Input name="name" placeholder="e.g. Farm Fresh Pizza" required className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Price (₹)</label>
            <Input name="price" type="number" placeholder="Price" required className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Category</label>
            <Input name="category" placeholder="Category" required className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold" />
          </div>
          <div className="space-y-2 lg:col-span-2 xl:col-span-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Description</label>
            <Input name="description" placeholder="Brief details..." className="h-12 bg-zinc-50 border-zinc-100 rounded-xl font-bold" />
          </div>
          
          <label className="flex items-center justify-center h-12 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-all text-zinc-400 hover:text-background">
            <Camera className="w-4 h-4 mr-2" />
            <span className="text-[10px] font-bold uppercase">{file ? "Ready" : "Photo"}</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <Button disabled={isUploading} className="h-12 bg-background text-white hover:bg-zinc-900 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-background/20">
            {isUploading ? <Loader2 className="animate-spin" /> : "Publish Item"}
          </Button>
        </form>
      </section>

      {/* ITEMS TABLE */}
      <div className="bg-white border border-zinc-100 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
           <h3 className="text-xl font-black uppercase italic tracking-tighter text-zinc-900">Menu Registry</h3>
           <span className="px-4 py-1.5 bg-zinc-50 rounded-full text-[9px] font-black uppercase text-zinc-400">{items.length} Total Items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 text-zinc-400 text-[9px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Product Details</th>
                <th className="px-8 py-5">Summary</th>
                <th className="px-8 py-5">Visuals</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Inventory</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {items.map((item) => (
                <tr key={item.id} className={cn("group transition-colors hover:bg-zinc-50/50", !item.available && "opacity-60")}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden group/img">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-200">
                            <ImageIcon size={20} />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-white opacity-0 group-hover/img:opacity-100 cursor-pointer transition-opacity z-10">
                          <RefreshCw size={16} className={isUploading ? "animate-spin" : ""} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const newFile = e.target.files?.[0];
                            if (newFile) handleUpdateImage(item.id, newFile);
                          }} />
                        </label>
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 uppercase italic leading-none">{item.name}</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">{item.category}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6 max-w-xs">
                    <textarea 
                      defaultValue={item.description}
                      onBlur={(e) => handleUpdateDescription(item.id, e.target.value)}
                      placeholder="Add description..."
                      className="w-full bg-transparent text-[11px] font-bold text-zinc-800 border-none focus:ring-1 focus:ring-background/20 focus:bg-zinc-50/50 rounded-lg p-2 resize-none h-12 custom-scrollbar outline-none italic placeholder:text-zinc-300 transition-all"
                    />
                  </td>

                  <td className="px-8 py-6">
                    <button
                      disabled={!item.image}
                      onClick={() => toggleImageVisibility(item)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest",
                        !item.image 
                          ? "border-zinc-100 text-zinc-200 cursor-not-allowed"
                          : item.showImage !== false 
                          ? "border-background/20 bg-background/5 text-background" 
                          : "border-zinc-200 bg-zinc-50 text-zinc-400"
                      )}
                    >
                      {item.showImage !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.showImage !== false ? "Public" : "Hidden"}
                    </button>
                  </td>

                  <td className="px-8 py-6">
                    <div className="relative w-28">
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300 pointer-events-none" />
                      <input
                        type="number"
                        defaultValue={item.price}
                        onBlur={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 font-black text-zinc-900 bg-zinc-50 border border-zinc-100 rounded-xl focus:border-background focus:ring-0 transition-colors outline-none text-sm"
                      />
                    </div>
                  </td>
                  
                  <td className="px-8 py-6">
                    <button onClick={() => toggleStatus(item)} className={cn(
                      "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                      item.available ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                    )}>
                      {item.available ? "In Stock" : "Sold Out"}
                    </button>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <button onClick={async () => { if(confirm("Delete item?")) { if (firestore) await deleteDoc(doc(firestore, "menu_items", item.id)) } }} className="p-3 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
