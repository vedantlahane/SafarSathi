import { memo } from "react";
import { User, CheckCircle2, Star, ChevronRight, LogOut, Bell, MapPin, Vibrate, Volume2, Moon, HelpCircle, MessageSquare, FileText, Shield, Heart, Settings2, ExternalLink, Phone, Globe, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import { MessageToast } from "./message-toast";
import type { useSettings } from "../hooks/use-settings";

type S = ReturnType<typeof useSettings>;

function PreferenceRow({ icon: Icon, iconBg, iconColor, label, description, checked, onCheckedChange, disabled }:
    { icon: typeof Bell; iconBg: string; iconColor: string; label: string; description: string; checked: boolean; onCheckedChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <div className={cn("flex items-center justify-between p-4", disabled && "opacity-50")}>
            <div className="flex items-center gap-3"><div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}><Icon className={cn("h-5 w-5", iconColor)} /></div><div><p className="text-sm font-semibold text-slate-900">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div></div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
        </div>
    );
}

function MenuRow({ icon: Icon, iconBg, iconColor, label }: { icon: typeof HelpCircle; iconBg: string; iconColor: string; label: string }) {
    return (
        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left" onClick={() => hapticFeedback("light")}>
            <div className="flex items-center gap-3"><div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}><Icon className={cn("h-5 w-5", iconColor)} /></div><p className="text-sm font-semibold text-slate-900">{label}</p></div>
            <ExternalLink className="h-4 w-4 text-slate-400" />
        </button>
    );
}

function LoggedInViewInner({ s }: { s: S }) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
            <MessageToast message={s.message} />
            <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-4 pt-6 pb-20">
                <div className="absolute inset-0 overflow-hidden"><div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" /><div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" /></div>
                <div className="relative flex items-center gap-4">
                    <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-white/20 backdrop-blur border border-white/30"><span className="text-3xl font-bold text-white">{s.session?.name?.charAt(0).toUpperCase() || "T"}</span></div>
                    <div className="flex-1 text-white"><p className="text-xl font-bold">{s.session?.name || "Tourist"}</p><p className="text-sm text-blue-100">{s.session?.email}</p>
                        <div className="flex items-center gap-2 mt-2"><Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge><Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur"><Star className="mr-1 h-3 w-3" />Premium</Badge></div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-14 space-y-4">
                <Card className="overflow-hidden shadow-xl border-0"><CardContent className="p-0"><button className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors" onClick={() => s.setShowProfileEdit(true)}>
                    <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100"><User className="h-5 w-5 text-blue-600" /></div><div><p className="font-semibold text-slate-900">Edit Profile</p><p className="text-xs text-muted-foreground">Update your personal information</p></div></div><ChevronRight className="h-5 w-5 text-slate-400" />
                </button></CardContent></Card>

                <Card className="overflow-hidden shadow-lg"><CardContent className="p-0">
                    <div className="px-4 py-3 bg-slate-50 border-b"><div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-slate-600" /><h3 className="text-sm font-bold text-slate-900">Preferences</h3></div></div>
                    <div className="divide-y">
                        <PreferenceRow icon={Bell} iconBg="bg-red-100" iconColor="text-red-600" label="Push Notifications" description="Receive safety alerts & updates" checked={s.notifications} onCheckedChange={s.setNotifications} />
                        <PreferenceRow icon={MapPin} iconBg="bg-emerald-100" iconColor="text-emerald-600" label="Location Sharing" description="Share location with authorities" checked={s.locationSharing} onCheckedChange={s.setLocationSharing} />
                        <PreferenceRow icon={Vibrate} iconBg="bg-purple-100" iconColor="text-purple-600" label="Haptic Feedback" description="Vibration on interactions" checked={s.haptics} onCheckedChange={s.setHaptics} />
                        <PreferenceRow icon={Volume2} iconBg="bg-blue-100" iconColor="text-blue-600" label="Sound Effects" description="Audio feedback for actions" checked={s.soundEffects} onCheckedChange={s.setSoundEffects} />
                        <PreferenceRow icon={Moon} iconBg="bg-slate-100" iconColor="text-slate-600" label="Dark Mode" description="Coming soon" checked={s.darkMode} onCheckedChange={s.setDarkMode} disabled />
                    </div>
                </CardContent></Card>

                <Card className="overflow-hidden shadow-lg"><CardContent className="p-0">
                    <div className="px-4 py-3 bg-slate-50 border-b"><div className="flex items-center gap-2"><Heart className="h-4 w-4 text-slate-600" /><h3 className="text-sm font-bold text-slate-900">Support & Info</h3></div></div>
                    <div className="divide-y">
                        <MenuRow icon={HelpCircle} iconBg="bg-amber-100" iconColor="text-amber-600" label="Help Center" />
                        <MenuRow icon={MessageSquare} iconBg="bg-blue-100" iconColor="text-blue-600" label="Contact Support" />
                        <MenuRow icon={FileText} iconBg="bg-slate-100" iconColor="text-slate-600" label="Terms of Service" />
                        <MenuRow icon={Shield} iconBg="bg-emerald-100" iconColor="text-emerald-600" label="Privacy Policy" />
                        <MenuRow icon={Star} iconBg="bg-purple-100" iconColor="text-purple-600" label="Rate SafarSathi" />
                    </div>
                </CardContent></Card>

                <Button variant="outline" className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold gap-2" onClick={() => s.setShowLogoutConfirm(true)}><LogOut className="h-4 w-4" />Sign Out</Button>
                <div className="text-center pt-2 pb-4 space-y-1"><p className="text-xs text-muted-foreground">SafarSathi v1.0.0</p><p className="text-[10px] text-muted-foreground">Made with ❤️ for safe travels</p></div>
            </div>

            {/* Edit Profile Sheet */}
            <Sheet open={s.showProfileEdit} onOpenChange={s.setShowProfileEdit}>
                <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl overflow-hidden">
                    <SheetHeader className="pb-4"><SheetTitle className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100"><User className="h-5 w-5 text-blue-600" /></div>Edit Profile</SheetTitle></SheetHeader>
                    <form onSubmit={s.handleProfileUpdate} className="mt-2 space-y-4 overflow-y-auto pb-8">
                        {[{ icon: User, label: "Full Name", val: s.profileName, set: s.setProfileName },
                        { icon: Phone, label: "Phone Number", val: s.profilePhone, set: s.setProfilePhone, type: "tel" },
                        { icon: MapPin, label: "Address", val: s.profileAddress, set: s.setProfileAddress },
                        { icon: Globe, label: "Nationality", val: s.profileNationality, set: s.setProfileNationality },
                        { icon: User, label: "Gender", val: s.profileGender, set: s.setProfileGender, ph: "Male / Female / Other" },
                        ].map(({ icon: I, label, val, set, type, ph }) => (
                            <div key={label} className="space-y-2"><label className="text-xs font-semibold text-slate-700">{label}</label><div className="relative"><I className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type={type || "text"} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="pl-11 h-12 rounded-xl" /></div></div>
                        ))}
                        <Separator className="my-4" />
                        <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold" disabled={s.loading}>{s.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="mr-2 h-4 w-4" />Save Changes</>}</Button>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Logout Confirm */}
            <Dialog open={s.showLogoutConfirm} onOpenChange={s.setShowLogoutConfirm}>
                <DialogContent className="rounded-3xl max-w-[85vw] p-6">
                    <DialogHeader><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4"><LogOut className="h-7 w-7 text-red-600" /></div><DialogTitle className="text-center text-xl">Sign Out?</DialogTitle><DialogDescription className="text-center">Are you sure you want to sign out of your SafarSathi account?</DialogDescription></DialogHeader>
                    <div className="flex gap-3 mt-6"><Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => s.setShowLogoutConfirm(false)}>Cancel</Button><Button variant="destructive" className="flex-1 h-12 rounded-xl font-semibold" onClick={s.handleLogout}>Sign Out</Button></div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export const LoggedInView = memo(LoggedInViewInner);
