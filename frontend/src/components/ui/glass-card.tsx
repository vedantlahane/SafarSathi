import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Elevation level: 1 = hero, 2 = action, 3 = info */
    level?: 1 | 2 | 3;
}

const LEVEL_STYLES = {
    1: cn(
        "backdrop-blur-xl",
        "shadow-lg shadow-black/5",
        "border",
    ),
    2: cn(
        "backdrop-blur-lg",
        "shadow-md shadow-black/3",
        "border",
    ),
    3: cn(
        "backdrop-blur-md",
        "shadow-none",
        "border",
    ),
} as const;

/**
 * Glassmorphism card with three elevation levels.
 * Background opacity and border color shift with the dynamic theme
 * via CSS custom properties (--theme-card-bg, --theme-card-border).
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ level = 1, className, style, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl transition-all duration-2000 ease-in-out",
                LEVEL_STYLES[level],
                className,
            )}
            style={{
                backgroundColor: "var(--theme-card-bg)",
                borderColor: "var(--theme-card-border)",
                ...style,
            }}
            {...props}
        />
    ),
);

GlassCard.displayName = "GlassCard";
