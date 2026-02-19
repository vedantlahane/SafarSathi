import { memo } from "react";
import { QrCode, Shield, Verified } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface QRSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name?: string;
}

function QRSheetInner({ open, onOpenChange, name }: QRSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl h-auto pb-10">
                <SheetHeader className="pb-4"><SheetTitle className="text-center">Verification QR Code</SheetTitle></SheetHeader>
                <div className="flex flex-col items-center">
                    <div className="relative p-6 bg-white rounded-3xl shadow-xl border">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">Scan to Verify</div>
                        <div className="h-56 w-56 bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center">
                            <div className="relative">
                                <QrCode className="h-32 w-32 text-slate-800" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-12 w-12 rounded-xl bg-white shadow flex items-center justify-center"><Shield className="h-6 w-6 text-primary" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm font-medium text-slate-900">{name}</p>
                        <Badge className="bg-emerald-100 text-emerald-700"><Verified className="mr-1 h-3 w-3" />Verified Identity</Badge>
                        <p className="text-xs text-muted-foreground max-w-70">Authorities can scan this code to instantly verify your identity</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export const QRSheet = memo(QRSheetInner);
