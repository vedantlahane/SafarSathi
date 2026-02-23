import { useState, useEffect, useCallback } from "react";
import { fetchTouristProfile, getApiBaseUrl } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import type { TouristProfile } from "../types";

export function useIdentity() {
    const session = useSession();
    const [profile, setProfile] = useState<TouristProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
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
                if (active) setProfile(data as TouristProfile);
            } catch { /* silent */ } finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, [session?.touristId]);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    const handleCopy = useCallback(async (text: string, label: string) => {
        if (!text) return;
        hapticFeedback("light");
        await navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    const verificationUrl = profile?.idHash
        ? `${getApiBaseUrl()}/api/admin/id/verify?hash=${profile.idHash}`
        : null;

    const handleShare = useCallback(async () => {
        if (!profile) return;
        hapticFeedback("light");
        const shareData = {
            title: "YatraX Tourist ID",
            text: `Tourist ID: ${profile.touristId || profile.id}\nName: ${profile.name}\nVerified by YatraX`,
            url: verificationUrl || undefined,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.text);
                setCopied("share");
                setTimeout(() => setCopied(null), 2000);
            }
        } catch { /* cancelled */ }
    }, [profile, verificationUrl]);

    return {
        session, profile, loading, copied, isOnline,
        isFlipped, handleFlip, showDetails, setShowDetails,
        verificationUrl, handleCopy, handleShare,
    };
}
