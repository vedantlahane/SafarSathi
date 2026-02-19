import { memo } from "react";
import { Layers, AlertCircle, AlertTriangle, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import type { RiskFilter, LayerVisibility, RiskZone } from "../types";

interface LayersSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userInZone: boolean;
    riskFilter: RiskFilter;
    setRiskFilter: (f: RiskFilter) => void;
    showLayers: LayerVisibility;
    setShowLayers: React.Dispatch<React.SetStateAction<LayerVisibility>>;
    zoneCount: number;
}

function LayersSheetInner({ open, onOpenChange, userInZone, riskFilter, setRiskFilter, showLayers, setShowLayers, zoneCount }: LayersSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[60vh] pb-8">
                <SheetHeader><SheetTitle className="flex items-center gap-2"><Layers className="h-5 w-5" />Map Layers & Filters</SheetTitle></SheetHeader>
                <div className="space-y-6 mt-6 pb-4">
                    {userInZone && (
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div><p className="font-semibold text-red-900">You're in a Risk Zone</p><p className="text-sm text-red-700 mt-1">Stay alert and keep emergency contacts ready.</p></div>
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-semibold mb-3 text-slate-700">Risk Level Filter</p>
                        <div className="flex flex-wrap gap-2">
                            {(["all", "high", "medium", "low"] as const).map((level) => (
                                <Button key={level} variant={riskFilter === level ? "default" : "outline"} size="sm"
                                    className={cn("rounded-full capitalize h-10 px-4",
                                        riskFilter === level && level === "high" && "bg-red-500 hover:bg-red-600",
                                        riskFilter === level && level === "medium" && "bg-amber-500 hover:bg-amber-600",
                                        riskFilter === level && level === "low" && "bg-yellow-500 hover:bg-yellow-600",
                                    )}
                                    onClick={() => { hapticFeedback("light"); setRiskFilter(level); }}>
                                    {level === "all" ? `All Zones (${zoneCount})` : `${level} Risk`}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-3 text-slate-700">Show on Map</p>
                        <div className="flex gap-3">
                            <Button variant={showLayers.zones ? "default" : "outline"} className={cn("flex-1 h-12 rounded-xl gap-2", showLayers.zones && "bg-amber-500 hover:bg-amber-600")}
                                onClick={() => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, zones: !l.zones })); }}><AlertTriangle className="h-5 w-5" />Risk Zones</Button>
                            <Button variant={showLayers.police ? "default" : "outline"} className={cn("flex-1 h-12 rounded-xl gap-2", showLayers.police && "bg-blue-500 hover:bg-blue-600")}
                                onClick={() => { hapticFeedback("light"); setShowLayers((l) => ({ ...l, police: !l.police })); }}><Shield className="h-5 w-5" />Police</Button>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-3 text-slate-700">Legend</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50"><div className="h-4 w-4 rounded-full bg-red-500 opacity-60" /><span className="text-sm">High Risk</span></div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50"><div className="h-4 w-4 rounded-full bg-amber-500 opacity-60" /><span className="text-sm">Medium Risk</span></div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50"><div className="h-4 w-4 rounded-full bg-yellow-500 opacity-60" /><span className="text-sm">Low Risk</span></div>
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50"><Shield className="h-4 w-4 text-blue-600" /><span className="text-sm">Police Station</span></div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export const LayersSheet = memo(LayersSheetInner);
