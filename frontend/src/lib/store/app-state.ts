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
    window.addEventListener("online", () =>
        appStore.setState({ isOnline: true })
    );
    window.addEventListener("offline", () =>
        appStore.setState({ isOnline: false })
    );
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
                    currentLocation: {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    },
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
