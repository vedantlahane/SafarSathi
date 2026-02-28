// Theme configuration — color definitions for all 3 safety states
// Uses oklch color space for smooth perceptual interpolation

export type SafetyState = "safe" | "caution" | "danger";

export interface ThemeColors {
    bgFrom: string;
    bgTo: string;
    primary: string;
    primaryForeground: string;
    glow: string;
    cardBg: string;
    cardBgDark: string;
    cardBorder: string;
    cardBorderDark: string;
    sosScale: number;
    sosPulseSpeed: string;
    statusLabel: string;
    statusBadge: string;
}

export const THEME_COLORS: Record<SafetyState, ThemeColors> = {
    safe: {
        bgFrom: "oklch(0.98 0.02 160)",   // subtle airy emerald
        bgTo: "oklch(0.98 0.01 180)",     // subtle airy teal
        primary: "oklch(0.65 0.17 160)",   // emerald-500
        primaryForeground: "oklch(0.99 0 0)",
        glow: "oklch(0.65 0.17 160 / 0.10)",
        cardBg: "rgba(255, 255, 255, 0.40)",
        cardBgDark: "rgba(15, 23, 42, 0.55)",
        cardBorder: "rgba(16, 185, 129, 0.15)",
        cardBorderDark: "rgba(16, 185, 129, 0.12)",
        sosScale: 1,
        sosPulseSpeed: "3s",
        statusLabel: "Low Risk",
        statusBadge: "secondary",
    },
    caution: {
        bgFrom: "oklch(0.98 0.03 80)",    // subtle airy amber
        bgTo: "oklch(0.98 0.03 60)",      // subtle airy orange
        primary: "oklch(0.77 0.16 75)",    // amber-500
        primaryForeground: "oklch(0.15 0 0)",
        glow: "oklch(0.77 0.16 75 / 0.10)",
        cardBg: "rgba(255, 255, 255, 0.40)",
        cardBgDark: "rgba(15, 23, 42, 0.55)",
        cardBorder: "rgba(245, 158, 11, 0.15)",
        cardBorderDark: "rgba(245, 158, 11, 0.12)",
        sosScale: 1.167,
        sosPulseSpeed: "2s",
        statusLabel: "Moderate",
        statusBadge: "default",
    },
    danger: {
        bgFrom: "oklch(0.98 0.03 25)",    // subtle airy red
        bgTo: "oklch(0.98 0.02 10)",      // subtle airy rose
        primary: "oklch(0.63 0.22 25)",    // red-500
        primaryForeground: "oklch(0.99 0 0)",
        glow: "oklch(0.63 0.22 25 / 0.12)",
        cardBg: "rgba(255, 255, 255, 0.40)",
        cardBgDark: "rgba(15, 23, 42, 0.55)",
        cardBorder: "rgba(239, 68, 68, 0.20)",
        cardBorderDark: "rgba(239, 68, 68, 0.15)",
        sosScale: 1.333,
        sosPulseSpeed: "1s",
        statusLabel: "High Risk",
        statusBadge: "destructive",
    },
} as const;

/** Dark mode override backgrounds by safety state — muted, low-chroma */
export const DARK_BG: Record<SafetyState, { from: string; to: string }> = {
    safe: {
        from: "oklch(0.17 0.01 260)",   // dark neutral slate
        to: "oklch(0.19 0.03 170)",     // very subtle teal hint
    },
    caution: {
        from: "oklch(0.17 0.01 260)",
        to: "oklch(0.19 0.03 75)",      // very subtle warm hint
    },
    danger: {
        from: "oklch(0.17 0.01 260)",
        to: "oklch(0.19 0.03 25)",      // very subtle red hint
    },
};

/** Derive the safety state from a score (0-100) */
export function scoreToState(score: number): SafetyState {
    if (score >= 80) return "safe";
    if (score >= 50) return "caution";
    return "danger";
}

/** SOS ball size in px per safety state */
export const SOS_SIZE: Record<SafetyState, number> = {
    safe: 48,
    caution: 56,
    danger: 64,
};
