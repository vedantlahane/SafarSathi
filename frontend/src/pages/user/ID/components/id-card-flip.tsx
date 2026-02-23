import { memo, type ReactNode } from "react";

interface IDCardFlipProps {
    isFlipped: boolean;
    front: ReactNode;
    back: ReactNode;
    onFlip: () => void;
}

/** CSS 3D transform wrapper — tap to flip between front and back */
function IDCardFlipInner({ isFlipped, front, back, onFlip }: IDCardFlipProps) {
    return (
        <div
            className="w-full cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={onFlip}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? "Flip card to front" : "Flip card to back"}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onFlip(); }}
        >
            <div
                className="relative w-full transition-transform"
                style={{
                    paddingBottom: "63.1%", /* credit card 1.586:1 aspect ratio */
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transitionDuration: "600ms",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Front face */}
                <div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {front}
                </div>

                {/* Back face */}
                <div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    {back}
                </div>
            </div>
        </div>
    );
}

export const IDCardFlip = memo(IDCardFlipInner);
