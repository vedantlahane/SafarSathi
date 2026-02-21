import { useState, useCallback } from "react";
import { toast } from "sonner";
import { postLocation } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import type { LocationShareState } from "../types";

export function useLocationShare(): LocationShareState {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const share = useCallback(() => {
    if (!session?.touristId) {
      toast.error("Not signed in", {
        description: "Sign in to share your location",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Location unavailable", {
        description: "Your device does not support geolocation",
      });
      return;
    }

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
          hapticFeedback("medium");
          toast.success("Location shared", {
            description: "Your position has been sent to safety services",
          });
          setTimeout(() => setShared(false), 3000);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Could not share location";
          toast.error("Share failed", { description: message });
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        setLoading(false);
        toast.error("Location access denied", {
          description: geoErr.message || "Enable location permissions to share",
        });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }
    );
  }, [session?.touristId]);

  return { loading, shared, share };
}