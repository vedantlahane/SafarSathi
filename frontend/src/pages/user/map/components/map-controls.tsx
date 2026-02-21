// src/pages/user/map/components/map-controls.tsx
import { memo } from "react";
import { useMap } from "react-leaflet";
import { ZoomIn, ZoomOut, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapControlsProps {
    onLocate: () => void;
    locating: boolean;
}

function MapControlsInner({ onLocate, locating }: MapControlsProps) {
    const map = useMap();

    return (
        <div className="absolute bottom-32 right-4 z-[1000] flex flex-col gap-2">
            <Button variant="secondary" size="icon" onClick={() => map.zoomIn()}
                className="h-11 w-11 rounded-xl shadow-lg bg-white/95 backdrop-blur border-0">
                <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => map.zoomOut()}
                className="h-11 w-11 rounded-xl shadow-lg bg-white/95 backdrop-blur border-0">
                <ZoomOut className="h-5 w-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={onLocate} disabled={locating}
                className="h-11 w-11 rounded-xl shadow-lg bg-white/95 backdrop-blur border-0">
                {locating ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <LocateFixed className="h-5 w-5 text-primary" />}
            </Button>
        </div>
    );
}

export const MapControls = memo(MapControlsInner);
