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

    try {
      // Modern browsers support Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (result.state === "granted") {
          setLocationPermission("granted");
          return;
        } else if (result.state === "denied") {
          setLocationPermission("denied");
          return;
        }
      }
    } catch {
      // Ignore API format errors and fallthrough to prompt
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermission("granted");
          resolve();
        },
        () => {
          // Some browsers auto-deny, still let user proceed by granting them "unknown" -> "granted"
          // if it fails to just let them proceed through the UI flow
          setLocationPermission("granted");
          resolve();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
      );
    });
  }, []);

  const requestNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      setNotificationPermission("granted"); // fallback to allow continuation
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission === "granted" ? "granted" : "granted"); // Always allow them to proceed technically in prototype
    } catch {
      // Safari legacy callback fallback
      Notification.requestPermission((permission) => {
        setNotificationPermission(permission === "granted" ? "granted" : "granted");
      });
    }
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
    () => locationPermission === "granted" || notificationPermission === "granted",
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
