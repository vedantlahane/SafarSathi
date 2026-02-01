import { useState, useEffect, useCallback } from "react";

// Simple reactive store for app state
type Listener = () => void;

class Store<T> {
  private state: T;
  private listeners: Set<Listener> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState() {
    return this.state;
  }

  setState(partial: Partial<T>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// App state
interface AppState {
  isOnline: boolean;
  isLocationEnabled: boolean;
  currentLocation: { lat: number; lng: number } | null;
  lastLocationUpdate: Date | null;
  notificationsEnabled: boolean;
  emergencyMode: boolean;
  refreshing: boolean;
}

const appStore = new Store<AppState>({
  isOnline: navigator.onLine,
  isLocationEnabled: false,
  currentLocation: null,
  lastLocationUpdate: null,
  notificationsEnabled: false,
  emergencyMode: false,
  refreshing: false,
});

// Online/offline detection
if (typeof window !== "undefined") {
  window.addEventListener("online", () => appStore.setState({ isOnline: true }));
  window.addEventListener("offline", () => appStore.setState({ isOnline: false }));
}

export function useAppState() {
  const [state, setState] = useState(appStore.getState());
  
  useEffect(() => {
    return appStore.subscribe(() => setState(appStore.getState()));
  }, []);
  
  return state;
}

export function setAppState(partial: Partial<AppState>) {
  appStore.setState(partial);
}

// Location tracking
export function useLocationTracking() {
  const [watching, setWatching] = useState(false);
  
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setWatching(true);
    appStore.setState({ isLocationEnabled: true });
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        appStore.setState({
          currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          lastLocationUpdate: new Date(),
        });
      },
      () => {
        appStore.setState({ isLocationEnabled: false });
      },
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  }, []);
  
  return { watching, startTracking };
}

// Haptic feedback helper
export function hapticFeedback(type: "light" | "medium" | "heavy" = "light") {
  if ("vibrate" in navigator) {
    const patterns = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(patterns[type]);
  }
}

// Format relative time
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Unknown";
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}
