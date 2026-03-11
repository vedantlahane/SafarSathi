import { memo } from "react";
import { cn } from "@/lib/utils";
import { useThemeColors } from "./use-theme-colors";

/**
 * Full-screen animated gradient mesh background.
 * Uses CSS animations only — no JS animation frames.
 * Fixed position at z-0, behind all content.
 */
function GradientMeshInner() {
    const { isDark } = useThemeColors();

    return (
        <div
            className={cn(
                "pointer-events-none fixed inset-0 z-0 overflow-hidden",
                "transition-opacity duration-2000 ease-in-out",
            )}
            style={{ opacity: isDark ? 0.40 : 0.85 }}
            aria-hidden="true"
        >
            {/* Blob 1 — top-left drift */}
            <div
                className="absolute h-[60vh] w-[60vh] rounded-full animate-mesh-drift-1"
                style={{
                    background: "radial-gradient(circle, var(--theme-bg-from) 0%, transparent 70%)",
                    top: "-10%",
                    left: "-10%",
                }}
            />
            {/* Blob 2 — top-right drift */}
            <div
                className="absolute h-[50vh] w-[50vh] rounded-full animate-mesh-drift-2"
                style={{
                    background: "radial-gradient(circle, var(--theme-bg-to) 0%, transparent 70%)",
                    top: "10%",
                    right: "-15%",
                }}
            />
            {/* Blob 3 — bottom-center drift */}
            <div
                className="absolute h-[55vh] w-[55vh] rounded-full animate-mesh-drift-3"
                style={{
                    background: "radial-gradient(circle, var(--theme-primary) 0%, transparent 70%)",
                    bottom: "-20%",
                    left: "20%",
                    opacity: 0.3,
                }}
            />
            {/* Blob 4 — center drift */}
            <div
                className="absolute h-[40vh] w-[40vh] rounded-full animate-mesh-drift-4"
                style={{
                    background: "radial-gradient(circle, var(--theme-glow) 0%, transparent 60%)",
                    top: "40%",
                    right: "10%",
                }}
            />
        </div>
    );
}

export const GradientMeshBackground = memo(GradientMeshInner);
