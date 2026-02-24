import { useEffect, useState } from "react";
import { fetchTouristProfile } from "@/lib/api";
import type { TouristProfile } from "@/lib/api";

export function useTouristProfile(touristId?: string) {
  const [profile, setProfile] = useState<TouristProfile | null>(null);

  useEffect(() => {
    if (!touristId) {
      setProfile(null);
      return;
    }

    let active = true;
    (async () => {
      try {
        const data = await fetchTouristProfile(touristId);
        if (active) setProfile(data);
      } catch {
        // Silent: use existing profile state
      }
    })();

    return () => {
      active = false;
    };
  }, [touristId]);

  return { profile, setProfile };
}
