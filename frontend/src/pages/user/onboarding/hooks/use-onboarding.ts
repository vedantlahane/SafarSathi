import { useCallback, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "@/lib/utils/storage";

const ONBOARDING_KEY = "yatrax:onboarding:v1";
const SPLASH_MS = 1400;

type PermissionState = "granted" | "denied" | "unknown";

interface StoredOnboarding {
  completed: boolean;
  completedAt?: number;
}

export interface OnboardingState {
  visible: boolean;
  step: number;
  locationPermission: PermissionState;
  notificationPermission: PermissionState;
  canContinuePermissions: boolean;
  next: () => void;
  back: () => void;
  requestLocation: () => Promise<void>;
  requestNotifications: () => Promise<void>;
  complete: () => void;
  skipToEnd: () => void;
}

export function useOnboarding(): OnboardingState {
  const [visible, setVisible] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [locationPermission, setLocationPermission] =
    useState<PermissionState>("unknown");
  const [notificationPermission, setNotificationPermission] =
    useState<PermissionState>("unknown");

  useEffect(() => {
    const stored = getItem<StoredOnboarding>(ONBOARDING_KEY, { completed: false });
    setVisible(!stored.completed);
  }, []);

  useEffect(() => {
    if (!visible || step !== 0) return;
    const timeout = window.setTimeout(() => setStep(1), SPLASH_MS);
    return () => window.clearTimeout(timeout);
  }, [visible, step]);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission("granted");
          resolve();
        },
        () => {
          setLocationPermission("denied");
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
      );
    });
  }, []);

  const requestNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") {
      setNotificationPermission("denied");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission === "granted" ? "granted" : "denied");
  }, []);

  const next = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const back = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const complete = useCallback(() => {
    setItem<StoredOnboarding>(ONBOARDING_KEY, {
      completed: true,
      completedAt: Date.now(),
    });
    setVisible(false);
  }, []);

  const skipToEnd = useCallback(() => {
    setStep(4);
  }, []);

  const canContinuePermissions = useMemo(
    () => locationPermission !== "unknown" && notificationPermission !== "unknown",
    [locationPermission, notificationPermission]
  );

  return {
    visible,
    step,
    locationPermission,
    notificationPermission,
    canContinuePermissions,
    next,
    back,
    requestLocation,
    requestNotifications,
    complete,
    skipToEnd,
  };
}
