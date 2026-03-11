import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Elevation level: 1 = hero, 2 = action, 3 = info */
    level?: 1 | 2 | 3;
}

const LEVEL_STYLES = {
    1: cn(
        "backdrop-blur-[40px] backdrop-saturate-[200%] relative overflow-hidden bg-blend-luminosity border",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),_inset_0_-1px_1px_rgba(0,0,0,0.05),_0_24px_48px_-12px_rgba(0,0,0,0.15),_0_0_40px_-10px_var(--theme-glow)]",
        "dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),_inset_0_-1px_1px_rgba(0,0,0,0.3),_0_24px_48px_-12px_rgba(0,0,0,0.5)]",
        "before:absolute before:inset-0 before:-z-10 before:w-full before:h-full before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDBwJSIgaGVpZ2h0PSIxMDBwJSI+PGRlZnM+PGZpbHRlciBpZD0ibiIgeD0iMCIgeT0iMCIgd2lkdGg9Ijk4MSIgaGVpZ2h0PSI5ODElIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC4wNCIvPjwvc3ZnPg==')] before:opacity-[0.2] dark:before:opacity-[0.08]"
    ),
    2: cn(
        "backdrop-blur-[30px] backdrop-saturate-[180%] relative overflow-hidden bg-blend-luminosity border",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),_inset_0_-1px_1px_rgba(0,0,0,0.04),_0_16px_32px_-8px_rgba(0,0,0,0.12)]",
        "dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),_inset_0_-1px_1px_rgba(0,0,0,0.2),_0_16px_32px_-8px_rgba(0,0,0,0.35)]",
        "before:absolute before:inset-0 before:-z-10 before:w-full before:h-full before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDBwJSIgaGVpZ2h0PSIxMDBwJSI+PGRlZnM+PGZpbHRlciBpZD0ibiIgeD0iMCIgeT0iMCIgd2lkdGg9Ijk4MSIgaGVpZ2h0PSI5ODElIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC4wNCIvPjwvc3ZnPg==')] before:opacity-[0.15] dark:before:opacity-[0.06]"
    ),
    3: cn(
        "backdrop-blur-[20px] backdrop-saturate-[150%] relative overflow-hidden bg-blend-luminosity border",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_inset_0_-1px_1px_rgba(0,0,0,0.03),_0_8px_16px_-4px_rgba(0,0,0,0.08)]",
        "dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),_inset_0_-1px_1px_rgba(0,0,0,0.15),_0_8px_16px_-4px_rgba(0,0,0,0.3)]",
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
                "rounded-[24px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
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
