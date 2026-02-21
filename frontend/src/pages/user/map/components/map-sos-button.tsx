// src/pages/user/map/components/map-sos-button.tsx
import { memo, useState } from "react";
import { Siren, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import { useSession } from "@/lib/session";
import { postSOS } from "@/lib/api";

interface MapSOSButtonProps {
    userPosition: [number, number] | null;
    fallbackPosition: [number, number];
}

function MapSOSButtonInner({ userPosition, fallbackPosition }: MapSOSButtonProps) {
    const session = useSession();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSOS = async () => {
        if (!session?.touristId) return;
        hapticFeedback("heavy");
        setLoading(true);
        try {
            const loc = userPosition || fallbackPosition;
            await postSOS(session.touristId, { lat: loc[0], lng: loc[1] });
            setSuccess(true);
            hapticFeedback("heavy");
            setTimeout(() => setSuccess(false), 4000);
        } catch { /* silent */ } finally { setLoading(false); }
    };

    return (
        <Button variant="destructive" disabled={!session?.touristId || loading}
            className={cn(
                "absolute bottom-4 left-4 z-[1000] h-14 rounded-2xl shadow-2xl gap-2 px-6",
                "bg-linear-to-r from-red-500 to-red-600 transition-all",
                success && "bg-linear-to-r from-emerald-500 to-emerald-600",
            )}
            onClick={handleSOS}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> :
                success ? <><CheckCircle2 className="h-5 w-5" /><span className="font-semibold">SOS Sent!</span></> :
                    <><Siren className="h-5 w-5" /><span className="font-semibold">Emergency SOS</span></>}
        </Button>
    );
}

export const MapSOSButton = memo(MapSOSButtonInner);
