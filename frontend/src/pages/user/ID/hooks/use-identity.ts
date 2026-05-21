import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTouristProfile, getApiBaseUrl } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import type { TouristProfile } from "../types";

export function useIdentity() {
    const session = useSession();
    const [copied, setCopied] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    
    const { 
        data: profile = null, 
        isLoading: loading 
    } = useQuery({
        queryKey: ["touristProfile", session?.touristId],
        queryFn: () => fetchTouristProfile(session!.touristId),
        enabled: !!session?.touristId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

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
            text: `Tourist ID: ${(profile as any).touristId || profile.id}\nName: ${profile.name}\nVerified by YatraX`,
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
        session, profile: profile as TouristProfile | null, loading, copied,
        isFlipped, handleFlip, showDetails, setShowDetails,
        verificationUrl, handleCopy, handleShare,
    };
}
