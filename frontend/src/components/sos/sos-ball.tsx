import { memo } from "react";
import { Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/lib/theme/use-theme-colors";
import { SOS_SIZE } from "@/lib/theme/theme-config";
import { useSOS } from "./use-sos";
import { useSOSDrag } from "./use-sos-drag";
import { SOSArrowGuides } from "./sos-arrow-guides";
import { SOSConfirmOverlay } from "./sos-confirm-overlay";
import { SOSSuccessScreen } from "./sos-success-screen";

function SOSBallInner() {
    const { safetyState } = useThemeColors();
    const { phase, position } = useSOS();

    const ballSize = SOS_SIZE[safetyState];
    const { drag, onPointerDown, onPointerMove, onPointerUp } = useSOSDrag(ballSize);

    const showBall = phase === "idle" || phase === "long-press";

    const yPx =
        typeof window !== "undefined"
            ? (position.y / 100) * window.innerHeight
            : 300;

    const xPos =
        position.side === "right"
            ? `calc(100vw - ${ballSize}px - 12px)`
            : "12px";

    return (
        <>
            {showBall && (
                <button
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    className={cn(
                        "fixed z-50 flex items-center justify-center rounded-full",
                        "touch-none select-none",
                        "transition-[width,height] duration-500 ease-out",
                        "animate-sos-pulse",
                        drag.isDragging && "opacity-100 scale-110",
                        !drag.isDragging && "opacity-85",
                        drag.isLongPress && "scale-130",
                    )}
                    style={{
                        width: ballSize,
                        height: ballSize,
                        left: drag.isDragging
                            ? `calc(${xPos} + ${drag.dragOffset.x}px)`
                            : xPos,
                        top: drag.isDragging
                            ? `calc(${yPx}px - ${ballSize / 2}px + ${drag.dragOffset.y}px)`
                            : `calc(${yPx}px - ${ballSize / 2}px)`,
                        transition: drag.isDragging
                            ? "width 0.5s, height 0.5s"
                            : "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        background: "var(--theme-card-bg)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        boxShadow: "0 0 20px var(--theme-glow), 0 4px 12px rgba(0,0,0,0.1)",
                        animationDuration: "var(--sos-pulse-speed)",
                    }}
                    aria-label="Emergency SOS — long press and swipe to trigger"
                    role="button"
                >
                    <span
                        className="absolute inset-0 rounded-full border-2 transition-colors duration-2000"
                        style={{ borderColor: "var(--theme-primary)" }}
                    />
                    <Siren
                        className="relative z-10 transition-colors duration-2000"
                        style={{
                            color: "var(--theme-primary)",
                            width: ballSize * 0.45,
                            height: ballSize * 0.45,
                        }}
                    />
                    {drag.isLongPress && <SOSArrowGuides side={position.side} />}
                </button>
            )}
            <SOSConfirmOverlay />
            <SOSSuccessScreen />
        </>
    );
}

export const SOSBall = memo(SOSBallInner);
