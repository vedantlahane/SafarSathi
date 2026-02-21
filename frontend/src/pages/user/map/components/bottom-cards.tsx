// src/pages/user/map/components/bottom-cards.tsx
import { memo } from "react";
import { Target, Shield, Phone, ExternalLink, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/store";
import type { Destination, PoliceStation } from "../types";

function openInMaps(lat: number, lng: number, name: string) {
    hapticFeedback("light");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`, "_blank");
}

interface DestinationBarProps { destination: Destination; onClear: () => void; }

function DestinationBarInner({ destination, onClear }: DestinationBarProps) {
    return (
        <div className="absolute bottom-32 left-4 right-4 z-[1000]">
            <Card className="shadow-xl border-0 overflow-hidden">
                <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100"><Target className="h-5 w-5 text-emerald-600" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{destination.name}</p><p className="text-xs text-muted-foreground">Destination</p></div>
                    <Button size="sm" className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600" onClick={() => openInMaps(destination.lat, destination.lng, destination.name)}>
                        <ExternalLink className="h-4 w-4" />Navigate
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={onClear}><X className="h-4 w-4" /></Button>
                </CardContent>
            </Card>
        </div>
    );
}
export const DestinationBar = memo(DestinationBarInner);

interface NearestStationBarProps { station: PoliceStation; }

function NearestStationBarInner({ station }: NearestStationBarProps) {
    return (
        <div className="absolute bottom-32 left-4 right-4 z-[1000]">
            <Card className="shadow-xl border-0 overflow-hidden bg-white/95 backdrop-blur">
                <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100"><Shield className="h-5 w-5 text-blue-600" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs text-muted-foreground">Nearest Police Station</p><p className="text-sm font-medium truncate">{station.name}</p></div>
                    <a href={`tel:${station.contact}`}><Button size="sm" variant="outline" className="h-9 gap-1.5"><Phone className="h-4 w-4" />Call</Button></a>
                </CardContent>
            </Card>
        </div>
    );
}
export const NearestStationBar = memo(NearestStationBarInner);
