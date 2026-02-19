import { memo } from "react";
import { LogIn, Mail, Lock, Eye, EyeOff, KeyRound, UserPlus, ChevronRight, Shield, Sparkles, ShieldCheck, Zap, Award, Info, User, Phone, Fingerprint, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageToast } from "./message-toast";
import type { useSettings } from "../hooks/use-settings";

type S = ReturnType<typeof useSettings>;

function AuthViewInner({ s }: { s: S }) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <MessageToast message={s.message} />
            <div className="relative overflow-hidden px-6 pt-8 pb-12">
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
                <div className="relative text-center">
                    <div className="relative inline-flex mb-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-2xl shadow-blue-500/30"><Shield className="h-12 w-12" /></div>
                        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg border"><Sparkles className="h-5 w-5 text-amber-500" /></div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">SafarSathi</h1>
                    <p className="text-muted-foreground max-w-[280px] mx-auto">Your trusted companion for safe and secure travels</p>
                    <div className="flex justify-center gap-6 mt-6">
                        {[{ icon: ShieldCheck, color: "emerald", label: "Verified" }, { icon: Zap, color: "blue", label: "Fast SOS" }, { icon: Award, color: "purple", label: "Trusted" }].map(({ icon: I, color, label }) => (
                            <div key={label} className="text-center"><div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}-100 mx-auto mb-1`}><I className={`h-5 w-5 text-${color}-600`} /></div><p className="text-[10px] text-muted-foreground">{label}</p></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-1 px-4 pb-8 space-y-4">
                <Card className="overflow-hidden border-0 shadow-xl">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><LogIn className="h-5 w-5 text-white" /></div><div className="text-white"><h2 className="font-bold">Welcome Back</h2><p className="text-xs text-blue-100">Sign in to continue</p></div></div>
                    </div>
                    <CardContent className="p-5">
                        <form onSubmit={s.handleLogin} className="space-y-4">
                            <div className="space-y-2"><label className="text-xs font-semibold text-slate-700">Email Address</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="email" value={s.loginEmail} onChange={(e) => s.setLoginEmail(e.target.value)} placeholder="your@email.com" className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500" /></div></div>
                            <div className="space-y-2"><label className="text-xs font-semibold text-slate-700">Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type={s.showLoginPassword ? "text" : "password"} value={s.loginPassword} onChange={(e) => s.setLoginPassword(e.target.value)} placeholder="••••••••" className="pl-11 pr-11 h-12 rounded-xl border-slate-200" /><button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => s.setShowLoginPassword(!s.showLoginPassword)}>{s.showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                            <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 font-semibold" disabled={s.loading}>{s.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" />Sign In</>}</Button>
                        </form>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden border shadow-lg hover:shadow-xl transition-shadow"><CardContent className="p-0"><button className="w-full p-5 flex items-center justify-between text-left" onClick={() => s.setShowRegister(true)}><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"><UserPlus className="h-6 w-6" /></div><div><p className="font-bold text-slate-900">New to SafarSathi?</p><p className="text-sm text-muted-foreground">Create your travel safety account</p></div></div><ChevronRight className="h-5 w-5 text-slate-400" /></button></CardContent></Card>
                <div className="pt-4 space-y-3"><div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50"><Info className="h-5 w-5 text-blue-600 shrink-0" /><p className="text-xs text-blue-700">Your data is protected with end-to-end encryption and blockchain verification</p></div></div>
                <p className="text-center text-xs text-muted-foreground pt-4">SafarSathi v1.0.0</p>
            </div>
            <Sheet open={s.showRegister} onOpenChange={s.setShowRegister}>
                <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl overflow-hidden">
                    <SheetHeader className="pb-4"><SheetTitle className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100"><UserPlus className="h-5 w-5 text-emerald-600" /></div>Create Account</SheetTitle></SheetHeader>
                    <form onSubmit={s.handleRegister} className="mt-2 space-y-4 overflow-y-auto pb-8 h-full">
                        {[{ icon: User, label: "Full Name *", val: s.registerName, set: s.setRegisterName, ph: "John Doe" },
                        { icon: Mail, label: "Email *", val: s.registerEmail, set: s.setRegisterEmail, ph: "your@email.com", type: "email" },
                        { icon: Phone, label: "Phone Number", val: s.registerPhone, set: s.setRegisterPhone, ph: "+91 98765 43210", type: "tel" },
                        { icon: Fingerprint, label: "Passport Number", val: s.registerPassport, set: s.setRegisterPassport, ph: "A1234567" },
                        ].map(({ icon: I, label, val, set, ph, type }) => (
                            <div key={label} className="space-y-2"><label className="text-xs font-semibold text-slate-700">{label}</label><div className="relative"><I className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type={type || "text"} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="pl-11 h-12 rounded-xl" /></div></div>
                        ))}
                        <div className="space-y-2"><label className="text-xs font-semibold text-slate-700">Password *</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type={s.showRegisterPassword ? "text" : "password"} value={s.registerPassword} onChange={(e) => s.setRegisterPassword(e.target.value)} placeholder="Create a strong password" className="pl-11 pr-11 h-12 rounded-xl" /><button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => s.setShowRegisterPassword(!s.showRegisterPassword)}>{s.showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                        <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 font-semibold" disabled={s.loading}>{s.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" />Create Account</>}</Button>
                        <p className="text-center text-xs text-muted-foreground pt-2">By creating an account, you agree to our Terms of Service</p>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export const AuthView = memo(AuthViewInner);
