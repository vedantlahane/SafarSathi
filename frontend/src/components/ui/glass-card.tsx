import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Elevation level: 1 = hero, 2 = action, 3 = info */
    level?: 1 | 2 | 3;
}

const LEVEL_STYLES = {
    1: cn(
        "backdrop-blur-2xl bg-blend-luminosity",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "ring-1 ring-inset ring-white/40 dark:ring-white/10",
        "border border-white/20 dark:border-white/5",
    ),
    2: cn(
        "backdrop-blur-xl bg-blend-luminosity",
        "shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
        "ring-1 ring-inset ring-white/30 dark:ring-white/5",
        "border border-white/10 dark:border-transparent",
    ),
    3: cn(
        "backdrop-blur-lg bg-blend-luminosity",
        "shadow-none",
        "ring-1 ring-inset ring-white/20 dark:ring-transparent",
        "border border-white/10 dark:border-white/5",
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
                boxShadow: level === 1 ? "var(--theme-glow) 0px 4px 32px -12px" : undefined,
                ...style,
            }}
            {...props}
        />
    ),
);

GlassCard.displayName = "GlassCard";
