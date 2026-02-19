import { useState, useCallback } from "react";
import { postLocation } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import type { LocationShareState } from "../types";

export function useLocationShare(): LocationShareState {
    const session = useSession();
    const [loading, setLoading] = useState(false);
    const [shared, setShared] = useState(false);

    const share = useCallback(() => {
        if (!session?.touristId || !navigator.geolocation) return;

        hapticFeedback("light");
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await postLocation(session.touristId, {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                    });
                    setShared(true);
                    setTimeout(() => setShared(false), 2000);
                } catch {
                    /* silent */
                } finally {
                    setLoading(false);
                }
            },
            () => setLoading(false),
        );
    }, [session?.touristId]);

    return { loading, shared, share };
}
