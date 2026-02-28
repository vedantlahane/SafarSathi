import { createContext } from "react";

export type SOSPhase =
    | "idle"
    | "long-press"
    | "countdown"
    | "firing"
    | "success";

export interface SOSPosition {
    side: "left" | "right";
    y: number;
}

export interface SOSContextValue {
    /** Current SOS phase */
    phase: SOSPhase;
    /** Countdown value (3, 2, 1) during countdown phase */
    countdown: number;
    /** Ball position */
    position: SOSPosition;
    /** Whether the pre-alert has been sent for the current hold */
    preAlertSent: boolean;
    /** Alert ID returned from the backend after SOS is fired */
    activeAlertId: number | null;
    /** Start the countdown sequence */
    startCountdown: () => void;
    /** Cancel an in-progress SOS (sends cancel to backend if alert exists) */
    cancelSOS: () => void;
    /** Dismiss the success screen */
    dismissSuccess: () => void;
    /** Update ball position */
    setPosition: (pos: SOSPosition) => void;
    /** Set the SOS phase (used by the ball component) */
    setPhase: (phase: SOSPhase) => void;
    /** Mark pre-alert as sent */
    markPreAlertSent: () => void;
    /** Reset pre-alert flag */
    resetPreAlert: () => void;
}

export const SOSContext = createContext<SOSContextValue>({
    phase: "idle",
    countdown: 3,
    position: { side: "right", y: 50 },
    preAlertSent: false,
    activeAlertId: null,
    startCountdown: () => { },
    cancelSOS: () => { },
    dismissSuccess: () => { },
    setPosition: () => { },
    setPhase: () => { },
    markPreAlertSent: () => { },
    resetPreAlert: () => { },
});
