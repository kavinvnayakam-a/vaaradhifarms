"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Unlock, Mail, Lock, ShieldCheck, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import Image from "next/image";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_Logo.webp?alt=media&token=ed839d68-f527-48e4-b45a-f971d90357fa";

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const authInstance = useAuth();
  const [auth, setAuth, isAuthLoaded] = useLocalStorage('vaaradhi-admin-auth', false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthLoaded && auth === true) {
      router.push("/admin");
    }
  }, [auth, isAuthLoaded, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const allowedEmails = ["info@getpik.in", "admin@vaaradhifarms.com", "murugananthands@gmail.com"];
    
    setTimeout(() => {
      if (allowedEmails.includes(email.toLowerCase().trim()) && password.length >= 4) {
        setAuth(true);
        if (authInstance) initiateAnonymousSignIn(authInstance);
        toast({ title: "Authentication Successful", description: "Welcome to Vaaradhi Farms Console." });
      } else {
        setIsLoading(false);
        toast({ variant: "destructive", title: "Access Denied", description: "Invalid administrator credentials." });
      }
    }, 1200);
  };

  if (!isAuthLoaded) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <div className="flex flex-col items-center gap-8">
          <div className="relative group transition-all duration-700 hover:scale-105">
            <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all" />
            <div className="relative bg-white px-10 py-6 rounded-[2.5rem] shadow-2xl border-4 border-white/30">
              <Image src={LOGO_URL} alt="Vaaradhi Farms" width={200} height={86} className="object-contain" priority />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
              Farm Console
            </h1>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
              Restaurant Management POS
            </p>
          </div>
        </div>

        <Card className="border-none bg-white/10 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden">
          <CardContent className="px-10 py-14">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Administrator Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors w-4 h-4" />
                  <Input 
                    type="email" 
                    placeholder="admin@vaaradhifarms.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-2xl font-bold placeholder:text-white/10 focus:bg-white/10 focus:border-white/30 transition-all" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Security Key</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors w-4 h-4" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white rounded-2xl font-bold placeholder:text-white/10 focus:bg-white/10 focus:border-white/30 transition-all" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-16 bg-white text-background hover:bg-primary hover:text-white rounded-2xl shadow-2xl transition-all active:scale-95 uppercase font-black tracking-[0.2em] text-xs border-none"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <div className="flex items-center gap-3">
                    <Unlock size={16} />
                    <span>Authenticate Access</span>
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="h-px w-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <p className="text-[8px] text-center text-white/30 font-bold uppercase tracking-[0.4em]">
                  Authorized Personnel Only
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center gap-4 opacity-30 animate-pulse">
           <p className="text-white text-[10px] font-black uppercase tracking-[1em]">GetPik Digital</p>
        </div>
      </div>
    </div>
  );
}
