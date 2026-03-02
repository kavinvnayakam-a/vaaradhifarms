"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Unlock, Mail, Lock, ShieldCheck, Warehouse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import Image from "next/image";

const LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_logo_final-02.webp?alt=media&token=2a082303-daa9-4187-89de-bbeefac2ceec";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-primary p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-none bg-white shadow-2xl rounded-[3rem] overflow-hidden relative z-10">
        <CardHeader className="text-center pt-14 pb-8">
          <div className="relative mx-auto w-40 h-20 mb-8 bg-primary/5 rounded-2xl flex items-center justify-center p-4">
            <Image src={LOGO_URL} alt="Vaaradhi Farms" fill className="object-contain p-4" priority />
          </div>
          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-primary">
            Farm Console
          </CardTitle>
          <CardDescription className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] mt-2">
            Vaaradhi Farms POS
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-14">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 w-4 h-4" />
                <Input type="email" placeholder="admin@vaaradhifarms.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 h-14 bg-gray-50 border-none rounded-2xl font-bold" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40">Security Key</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 w-4 h-4" />
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-12 h-14 bg-gray-50 border-none rounded-2xl font-bold" required />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-16 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-accent transition-all uppercase font-black tracking-widest text-xs">
              {isLoading ? <Loader2 className="animate-spin" /> : "Authenticate Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
