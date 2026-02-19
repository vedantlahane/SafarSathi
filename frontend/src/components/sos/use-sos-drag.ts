import { useRef, useCallback, useState, useEffect } from "react";
import { hapticFeedback } from "@/lib/store";
import { useSession } from "@/lib/session";
import { useSOS } from "./use-sos";
import { detectSwipeDirection, isValidSOSTrigger, calculateSnapPosition, clampVerticalPosition, type GestureState } from "./sos-gesture-handler";

const LONG_PRESS_MS = 300;
const PRE_ALERT_MS = 2000;
const BOTTOM_NAV_HEIGHT = 100;

interface DragState { isDragging: boolean; isLongPress: boolean; dragOffset: { x: number; y: number }; }

/** All pointer/gesture logic for the SOS ball. Returns state + handlers. */
export function useSOSDrag(ballSize: number) {
    const session = useSession();
    const { phase, position, preAlertSent, startCountdown, setPosition, markPreAlertSent, resetPreAlert } = useSOS();

    const RESET: DragState = { isDragging: false, isLongPress: false, dragOffset: { x: 0, y: 0 } };
    const [drag, setDrag] = useState<DragState>(RESET);

    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const preAlertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const gestureRef = useRef<GestureState | null>(null);
    const hasMoved = useRef(false);

    const clearTimers = useCallback(() => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
        if (preAlertTimer.current) { clearTimeout(preAlertTimer.current); preAlertTimer.current = null; }
    }, []);

    const sendPreAlert = useCallback(async () => {
        if (preAlertSent || !session?.touristId) return;
        markPreAlertSent();
        try {
            const API_BASE = (
                (import.meta.env.VITE_BACKEND_NODE_URL as string | undefined) ??
                "http://localhost:8081"
            ).replace(/\/$/, "");
            await fetch(`${API_BASE}/api/sos/pre-alert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    touristId: session.touristId,
                    lat: null,
                    lng: null,
                    timestamp: new Date().toISOString(),
                    type: "PROLONGED_HOLD",
                }),
            });
        } catch {
            /* silent */
        }
    }, [preAlertSent, session?.touristId, markPreAlertSent]);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (phase !== "idle") return;
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);

            hasMoved.current = false;
            setDrag((d) => ({ ...d, isDragging: true }));

            gestureRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startTime: Date.now(),
                currentX: e.clientX,
                currentY: e.clientY,
                isLongPress: false,
                ballSide: position.side,
            };

            longPressTimer.current = setTimeout(() => {
                if (gestureRef.current) {
                    gestureRef.current.isLongPress = true;
                    setDrag((d) => ({ ...d, isLongPress: true }));
                    hapticFeedback("heavy");
                }
            }, LONG_PRESS_MS);

            preAlertTimer.current = setTimeout(() => {
                sendPreAlert();
            }, PRE_ALERT_MS);
        },
        [phase, position.side, sendPreAlert],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!gestureRef.current || !drag.isDragging) return;
            const dx = e.clientX - gestureRef.current.startX;
            const dy = e.clientY - gestureRef.current.startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true;
            gestureRef.current.currentX = e.clientX;
            gestureRef.current.currentY = e.clientY;
            setDrag((d) => ({ ...d, dragOffset: { x: dx, y: dy } }));
        },
        [drag.isDragging],
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent) => {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            clearTimers();

            if (!gestureRef.current) { setDrag(RESET); return; }

            const gesture = gestureRef.current;

            if (gesture.isLongPress) {
                const direction = detectSwipeDirection(gesture);
                if (isValidSOSTrigger(direction, gesture.ballSide)) {
                    setDrag(RESET);
                    gestureRef.current = null;
                    resetPreAlert();
                    startCountdown();
                    return;
                }
            }

            if (hasMoved.current) {
                const newSide = calculateSnapPosition(e.clientX, window.innerWidth);
                const newY = clampVerticalPosition(
                    e.clientY, ballSize, window.innerHeight, 48, BOTTOM_NAV_HEIGHT,
                );
                setPosition({ side: newSide, y: (newY / window.innerHeight) * 100 });
            }

            setDrag(RESET);
            gestureRef.current = null;
            resetPreAlert();
        },
        [clearTimers, ballSize, setPosition, startCountdown, resetPreAlert],
    );

    useEffect(() => clearTimers, [clearTimers]);

    return { drag, onPointerDown, onPointerMove, onPointerUp };
}
