import { useState, useCallback } from "react";
import { clearSession, useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import { useTouristProfile } from "./use-tourist-profile";
import { useProfileEditor } from "./use-profile-editor";
import { useEmergencyEditor } from "./use-emergency-editor";

export function useSettings() {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [alertSounds, setAlertSounds] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  // Privacy preferences
  const [locationSharing, setLocationSharing] = useState(true);
  const [highAccuracyGps, setHighAccuracyGps] = useState(false);
  const [anonymousData, setAnonymousData] = useState(true);

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
    pushNotifications,
    setPushNotifications,
    alertSounds,
    setAlertSounds,
    vibration,
    setVibration,
    quietHours,
    setQuietHours,
    locationSharing,
    setLocationSharing,
    highAccuracyGps,
    setHighAccuracyGps,
    anonymousData,
    setAnonymousData,
    ...emergencyEditor,
    handleLogout,
  };
}
