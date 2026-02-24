import {
    useState,
    useCallback,
    useRef,
    useEffect,
    useMemo,
    type ReactNode,
} from "react";
import { SOSContext, type SOSPhase, type SOSPosition } from "./sos-context";
import { postSOS } from "@/lib/api";
import { useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";

const POSITION_STORAGE_KEY = "safeguard-sos-position";

function getStoredPosition(): SOSPosition {
    try {
        const raw = localStorage.getItem(POSITION_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as SOSPosition;
            if (
                (parsed.side === "left" || parsed.side === "right") &&
                typeof parsed.y === "number"
            ) {
                return parsed;
            }
        }
    } catch {
        /* ignore */
    }
    return { side: "right", y: 50 };
}

interface SOSProviderProps {
    children: ReactNode;
}

export function SOSProvider({ children }: SOSProviderProps) {
    const session = useSession();
    const [phase, setPhase] = useState<SOSPhase>("idle");
    const [countdown, setCountdown] = useState(3);
    const [position, setPositionState] = useState<SOSPosition>(getStoredPosition);
    const [preAlertSent, setPreAlertSent] = useState(false);

    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const setPosition = useCallback((pos: SOSPosition) => {
        setPositionState(pos);
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos));
    }, []);

    const cancelSOS = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        setPhase("idle");
        setCountdown(3);
        setPreAlertSent(false);
        hapticFeedback("light");
    }, []);

    const fireSOS = useCallback(async () => {
        setPhase("firing");
        hapticFeedback("heavy");

        const touristId = session?.touristId;
        if (!touristId) {
            setPhase("success");
            return;
        }

        try {
            const getLocation = (): Promise<{
                lat: number | null;
                lng: number | null;
                accuracy: number | null;
            }> =>
                new Promise((resolve) => {
                    if (!navigator.geolocation) {
                        resolve({ lat: null, lng: null, accuracy: null });
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(
                        (pos) =>
                            resolve({
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude,
                                accuracy: pos.coords.accuracy,
                            }),
                        () => resolve({ lat: null, lng: null, accuracy: null }),
                        { enableHighAccuracy: true, timeout: 5000 },
                    );
                });

            const loc = await getLocation();
            await postSOS(touristId, {
                lat: loc.lat ?? undefined,
                lng: loc.lng ?? undefined,
            });
        } catch {
            /* Still show success — fire-and-forget principle */
        }

        setPhase("success");
    }, [session?.touristId]);

    const startCountdown = useCallback(() => {
        setPhase("countdown");
        setCountdown(3);
        hapticFeedback("heavy");

        let current = 3;
        countdownRef.current = setInterval(() => {
            current -= 1;
            if (current <= 0) {
                if (countdownRef.current) clearInterval(countdownRef.current);
                countdownRef.current = null;
                fireSOS();
            } else {
                setCountdown(current);
                hapticFeedback("heavy");
            }
        }, 1000);
    }, [fireSOS]);

    const dismissSuccess = useCallback(() => {
        setPhase("idle");
        setCountdown(3);
        setPreAlertSent(false);
    }, []);

    const markPreAlertSent = useCallback(() => setPreAlertSent(true), []);
    const resetPreAlert = useCallback(() => setPreAlertSent(false), []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    const value = useMemo(
        () => ({
            phase,
            countdown,
            position,
            preAlertSent,
            startCountdown,
            cancelSOS,
            dismissSuccess,
            setPosition,
            setPhase,
            markPreAlertSent,
            resetPreAlert,
        }),
        [
            phase,
            countdown,
            position,
            preAlertSent,
            startCountdown,
            cancelSOS,
            dismissSuccess,
            setPosition,
        ],
    );

    return <SOSContext.Provider value={value}>{children}</SOSContext.Provider>;
}
