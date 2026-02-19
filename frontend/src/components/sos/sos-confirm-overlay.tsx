import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useSOS } from "./use-sos";

/**
 * Full-screen countdown overlay: 3...2...1
 * Tap anywhere to cancel. Red pulsing background intensifies each tick.
 */
function SOSConfirmOverlayInner() {
    const { phase, countdown, cancelSOS } = useSOS();

    const handleCancel = useCallback(() => {
        cancelSOS();
    }, [cancelSOS]);

    if (phase !== "countdown") return null;

    const intensity = 4 - countdown; // 1 → 1, 2 → 2, 3 → 3

    return (
        <div
            className={cn(
                "fixed inset-0 z-[60] flex flex-col items-center justify-center",
                "transition-colors duration-300",
                "cursor-pointer",
            )}
            style={{
                background:
                    intensity >= 3
                        ? "rgba(220, 38, 38, 0.85)"
                        : intensity >= 2
                            ? "rgba(220, 38, 38, 0.65)"
                            : "rgba(220, 38, 38, 0.45)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
            onClick={handleCancel}
            role="alertdialog"
            aria-label={`SOS countdown: ${countdown}. Tap to cancel.`}
        >
            {/* Countdown number */}
            <span
                key={countdown}
                className="animate-countdown-pop text-white font-black select-none"
                style={{ fontSize: "min(40vw, 200px)" }}
            >
                {countdown}
            </span>

            {/* Cancel instruction */}
            <p className="mt-8 text-white/90 text-lg font-semibold animate-pulse">
                Tap anywhere to cancel
            </p>

            {/* Pulsing ring */}
            <div
                className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping pointer-events-none"
                style={{ margin: "20%", animationDuration: "1s" }}
            />
        </div>
    );
}

export const SOSConfirmOverlay = memo(SOSConfirmOverlayInner);
