import { memo, type ReactNode, useState, useRef, useEffect } from "react";

interface IDCardFlipProps {
    isFlipped: boolean;
    front: ReactNode;
    back: ReactNode;
    onFlip: () => void;
}

/** CSS 3D transform wrapper — tap to flip between front and back */
function IDCardFlipInner({ isFlipped, front, back, onFlip }: IDCardFlipProps) {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Device orientation support for mobile
    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (!e.gamma || !e.beta || isFlipped) return;
            // Limit tilt values to prevent excessive rotation
            const y = Math.min(Math.max(e.gamma, -20), 20) / 2; // Left/Right
            const x = Math.min(Math.max(e.beta - 45, -20), 20) / -2; // Up/Down (assuming phone is held at ~45 deg)
            setTilt({ x, y });
        };

        if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
             window.addEventListener("deviceorientation", handleOrientation);
        }
        
        return () => window.removeEventListener("deviceorientation", handleOrientation);
    }, [isFlipped]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || isFlipped) return;
        
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Calculate pointer position relative to center of card (-1 to 1)
        const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
        const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);
        
        // Max rotation degrees
        const maxTilt = 12;
        
        // Rotate X is driven by Y coordinate (inverted), Rotate Y is driven by X coordinate
        setTilt({
            x: -mouseY * maxTilt,
            y: mouseX * maxTilt
        });
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
        setIsHovering(false);
    };

    return (
        <div
            ref={cardRef}
            className="w-full cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={onFlip}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => setIsHovering(true)}
            onTouchEnd={() => setIsHovering(false)}
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
                    transform: isFlipped 
                        ? "rotateY(180deg) scale(1.02)" 
                        : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.02 : 1})`,
                    transitionDuration: isHovering && !isFlipped ? "100ms" : "600ms",
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
