import { memo } from "react";
import { User, Fingerprint, Mail, Phone, FileText, Globe, MapPin, Calendar, Clock, Activity, Droplets, Heart, AlertTriangle, Copy, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { TouristProfile } from "../types";

interface IDDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: TouristProfile | null;
    copied: string | null;
    onCopy: (text: string, label: string) => void;
}

function Row({ icon: Icon, label, value, copyable, onCopy, copied, badge, badgeColor }: {
    icon: typeof User; label: string; value: string; copyable?: boolean;
    onCopy?: () => void; copied?: boolean; badge?: boolean; badgeColor?: "emerald" | "blue" | "amber";
}) {
    const colors = { emerald: "bg-emerald-100 text-emerald-700", blue: "bg-blue-100 text-blue-700", amber: "bg-amber-100 text-amber-700" };
    return (
        <div className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                {badge ? (
                    <Badge className={cn("mt-1 text-xs", colors[badgeColor || "emerald"])}>{value}</Badge>
                ) : (
                    <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
                )}
            </div>
            {copyable && onCopy && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={onCopy} aria-label={`Copy ${label}`}>
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
            )}
        </div>
    );
}

function IDDetailsSheetInner({ open, onOpenChange, profile, copied, onCopy }: IDDetailsSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />Profile Details
                    </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto -mx-6 px-6 pb-8">
                    <div className="space-y-1 divide-y">
                        <Row icon={Fingerprint} label="Tourist ID" value={profile?.touristId || profile?.id || "—"} copyable onCopy={() => onCopy(profile?.touristId || profile?.id || "", "id")} copied={copied === "id"} />
                        <Row icon={User} label="Full Name" value={profile?.name || "—"} />
                        <Row icon={Mail} label="Email" value={profile?.email || "—"} />
                        <Row icon={Phone} label="Phone" value={profile?.phone || "—"} />
                        <Row icon={FileText} label="Passport" value={profile?.passportNumber ? `****${profile.passportNumber.slice(-4)}` : "—"} />
                        <Row icon={Globe} label="Nationality" value={profile?.nationality || "—"} />
                        <Row icon={MapPin} label="Address" value={profile?.address || "—"} />
                        <Row icon={Calendar} label="Date of Birth" value={profile?.dateOfBirth || "—"} />
                        <Row icon={Clock} label="ID Expiry" value={profile?.idExpiry || "—"} />
                        <Row icon={Droplets} label="Blood Type" value={profile?.bloodType || "—"} />
                        <Row icon={AlertTriangle} label="Allergies" value={profile?.allergies?.join(", ") || "None"} />
                        <Row icon={Heart} label="Medical Conditions" value={profile?.medicalConditions?.join(", ") || "None"} />
                        <Row icon={Phone} label="Emergency Contact" value={profile?.emergencyContact?.phone || "Not set"} />
                        <Row icon={Activity} label="Status" value="Active" badge badgeColor="emerald" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export const IDDetailsSheet = memo(IDDetailsSheetInner);
