import { useEffect, useRef, useState, memo } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedNumberProps {
    /** The target numeric value */
    value: number;
    /** Animation duration in ms */
    duration?: number;
    className?: string;
    /** Custom formatter, e.g. (n) => `${n}%` */
    format?: (n: number) => string;
}

/** Ease-out cubic easing function */
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Number that morphs smoothly between values using requestAnimationFrame.
 * Interrupts current animation when value changes and starts from the
 * currently displayed value.
 */
function AnimatedNumberInner({
    value,
    duration = 1000,
    className,
    format = (n) => String(Math.round(n)),
}: AnimatedNumberProps) {
    const [display, setDisplay] = useState(value);
    const animationRef = useRef<number>(0);
    const startValueRef = useRef(value);
    const startTimeRef = useRef(0);

    useEffect(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        startValueRef.current = display;
        startTimeRef.current = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = startValueRef.current + (value - startValueRef.current) * eased;

            setDisplay(current);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
        // Intentionally only re-run when `value` changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]);

    return (
        <span className={cn("tabular-nums", className)} aria-live="polite">
            {format(display)}
        </span>
    );
}

export const AnimatedNumber = memo(AnimatedNumberInner);
