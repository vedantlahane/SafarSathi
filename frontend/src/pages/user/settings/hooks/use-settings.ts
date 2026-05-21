import { useState, useCallback, useSyncExternalStore } from "react";
import { clearSession, useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import { getPrefs, setPrefs, subscribePrefs } from "@/lib/store/user-prefs";
import { useTouristProfile } from "./use-tourist-profile";
import { useProfileEditor } from "./use-profile-editor";
import { useEmergencyEditor } from "./use-emergency-editor";

/** Reactive hook that reads from the persistent UserPrefs store. */
function useUserPrefs() {
  return useSyncExternalStore(subscribePrefs, getPrefs, getPrefs);
}

export function useSettings() {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Persistent preferences (survive page reload) ───────────────────
  const prefs = useUserPrefs();

  const setPushNotifications = useCallback((v: boolean) => setPrefs({ pushNotifications: v }), []);
  const setAlertSounds = useCallback((v: boolean) => setPrefs({ alertSounds: v }), []);
  const setVibration = useCallback((v: boolean) => setPrefs({ vibration: v }), []);
  const setQuietHours = useCallback((v: boolean) => setPrefs({ quietHours: v }), []);
  const setLocationSharing = useCallback((v: boolean) => setPrefs({ locationSharing: v }), []);
  const setHighAccuracyGps = useCallback((v: boolean) => setPrefs({ highAccuracyGps: v }), []);
  const setAnonymousData = useCallback((v: boolean) => setPrefs({ anonymousData: v }), []);
  // ──────────────────────────────────────────────────────────────────

  const { profile, setProfile } = useTouristProfile(session?.touristId);

  const showMsg = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const profileEditor = useProfileEditor({
    touristId: session?.touristId,
    token: session?.token,
    sessionName: session?.name,
    sessionEmail: session?.email,
    idHash: session?.idHash,
    profile,
    setProfile,
    setLoading,
    showMsg,
  });

  const emergencyEditor = useEmergencyEditor({
    touristId: session?.touristId,
    profile,
    setProfile,
    setLoading,
    showMsg,
  });

  const handleLogout = useCallback(() => {
    hapticFeedback("medium");
    clearSession();
    showMsg("success", "Logged out");
  }, [showMsg]);

  return {
    session,
    loading,
    message,
    ...profileEditor,
    // Notifications — now persistent
    pushNotifications: prefs.pushNotifications,
    setPushNotifications,
    alertSounds: prefs.alertSounds,
    setAlertSounds,
    vibration: prefs.vibration,
    setVibration,
    quietHours: prefs.quietHours,
    setQuietHours,
    // Privacy — now persistent
    locationSharing: prefs.locationSharing,
    setLocationSharing,
    highAccuracyGps: prefs.highAccuracyGps,
    setHighAccuracyGps,
    anonymousData: prefs.anonymousData,
    setAnonymousData,
    ...emergencyEditor,
    handleLogout,
  };
}
