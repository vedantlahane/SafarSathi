import { useState, useEffect, useCallback } from "react";
import { fetchTouristProfile, getApiBaseUrl, type TouristProfile } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";

export function useIdentity() {
    const session = useSession();
    const [profile, setProfile] = useState<TouristProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => setIsOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, []);

    useEffect(() => {
        if (!session?.touristId) { setProfile(null); return; }
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const data = await fetchTouristProfile(session.touristId);
                if (active) setProfile(data);
            } catch { /* silent */ } finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, [session?.touristId]);

    const verificationUrl = profile?.idHash ? `${getApiBaseUrl()}/api/admin/id/verify?hash=${profile.idHash}` : null;

    const handleCopy = useCallback(async (text: string, label: string) => {
        if (!text) return;
        hapticFeedback("light");
        await navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    const handleShare = useCallback(async () => {
        if (!profile || !navigator.share) return;
        hapticFeedback("light");
        try {
            await navigator.share({
                title: "SafarSathi Tourist ID",
                text: `Tourist ID: ${profile.id}\nName: ${profile.name}\nVerified by SafarSathi`,
                url: verificationUrl || undefined,
            });
        } catch { /* cancelled */ }
    }, [profile, verificationUrl]);

    return {
        session, profile, loading, copied, isOnline,
        showQR, setShowQR, showDetails, setShowDetails,
        verificationUrl, handleCopy, handleShare,
    };
}
