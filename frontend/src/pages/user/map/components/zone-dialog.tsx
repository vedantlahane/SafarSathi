import { memo } from "react";
import { AlertTriangle, MapPin, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RiskZone } from "../types";

interface ZoneDialogProps {
    zone: RiskZone | null;
    onClose: () => void;
    onFlyTo: (pos: [number, number]) => void;
}

function ZoneDialogInner({ zone, onClose, onFlyTo }: ZoneDialogProps) {
    const level = zone?.riskLevel?.toLowerCase();
    return (
        <Dialog open={!!zone} onOpenChange={() => onClose()}>
            <DialogContent className="rounded-3xl max-w-sm mx-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className={cn("h-5 w-5",
                            level === "high" && "text-red-500",
                            level === "medium" && "text-amber-500",
                            level === "low" && "text-yellow-500",
                        )} />
                        {zone?.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Badge className={cn(
                        level === "high" && "bg-red-100 text-red-700",
                        level === "medium" && "bg-amber-100 text-amber-700",
                        level === "low" && "bg-yellow-100 text-yellow-700",
                    )}>{zone?.riskLevel || "Medium"} Risk Zone</Badge>
                    <p className="text-sm text-muted-foreground">{zone?.description || "Stay alert and exercise caution in this area."}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />Radius: {((zone?.radiusMeters || 0) / 1000).toFixed(1)} km
                    </div>
                    <Button className="w-full" onClick={() => {
                        if (zone) onFlyTo([zone.centerLat, zone.centerLng]);
                        onClose();
                    }}><Navigation className="h-4 w-4 mr-2" />View on Map</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export const ZoneDialog = memo(ZoneDialogInner);
