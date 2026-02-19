import { memo } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";

interface SOSArrowGuidesProps {
    side: "left" | "right";
}

/**
 * Directional arrow guides shown during long-press state.
 * Indicates valid swipe directions for SOS trigger.
 */
function SOSArrowGuidesInner({ side }: SOSArrowGuidesProps) {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {/* Swipe instruction label */}
            <span
                className={`absolute whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ${side === "right" ? "-left-32" : "-right-32"
                    }`}
                style={{
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "var(--theme-card-bg)",
                    color: "var(--theme-primary)",
                    backdropFilter: "blur(8px)",
                }}
            >
                Swipe to trigger SOS
            </span>

            {/* Horizontal arrow — toward center */}
            {side === "right" ? (
                <ArrowLeft
                    className="absolute left-[-28px] top-1/2 -translate-y-1/2 animate-bounce-left"
                    style={{ color: "var(--theme-primary)" }}
                    size={18}
                />
            ) : (
                <ArrowRight
                    className="absolute right-[-28px] top-1/2 -translate-y-1/2 animate-bounce-right"
                    style={{ color: "var(--theme-primary)" }}
                    size={18}
                />
            )}

            {/* Vertical arrows — always shown */}
            <ArrowUp
                className="absolute top-[-24px] left-1/2 -translate-x-1/2 animate-bounce-up"
                style={{ color: "var(--theme-primary)" }}
                size={18}
            />
            <ArrowDown
                className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 animate-bounce-down"
                style={{ color: "var(--theme-primary)" }}
                size={18}
            />
        </div>
    );
}

export const SOSArrowGuides = memo(SOSArrowGuidesInner);
