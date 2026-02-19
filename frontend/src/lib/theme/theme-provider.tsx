import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { ThemeContext, type ThemeMode } from "./theme-context";
import {
    THEME_COLORS,
    DARK_BG,
    scoreToState,
    type SafetyState,
} from "./theme-config";

const STORAGE_KEY = "safeguard-theme-mode";

function getStoredMode(): ThemeMode {
    if (typeof window === "undefined") return "auto";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
    return "auto";
}

function isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 1;
}

function resolveIsDark(mode: ThemeMode): boolean {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return isNightTime();
}

function applyCSSVariables(state: SafetyState, isDark: boolean): void {
    const root = document.documentElement;
    const colors = THEME_COLORS[state];

    if (isDark) {
        const darkBg = DARK_BG[state];
        root.style.setProperty("--theme-bg-from", darkBg.from);
        root.style.setProperty("--theme-bg-to", darkBg.to);
        root.style.setProperty("--theme-card-bg", colors.cardBgDark);
        root.style.setProperty("--theme-card-border", colors.cardBorderDark);
    } else {
        root.style.setProperty("--theme-bg-from", colors.bgFrom);
        root.style.setProperty("--theme-bg-to", colors.bgTo);
        root.style.setProperty("--theme-card-bg", colors.cardBg);
        root.style.setProperty("--theme-card-border", colors.cardBorder);
    }

    root.style.setProperty("--theme-primary", colors.primary);
    root.style.setProperty("--theme-primary-foreground", colors.primaryForeground);
    root.style.setProperty("--theme-glow", colors.glow);
    root.style.setProperty("--sos-scale", String(colors.sosScale));
    root.style.setProperty("--sos-pulse-speed", colors.sosPulseSpeed);

    // Toggle dark class
    root.classList.toggle("dark", isDark);
}

interface ThemeProviderProps {
    children: ReactNode;
    initialScore?: number;
}

export function ThemeProvider({ children, initialScore = 100 }: ThemeProviderProps) {
    const [safetyScore, setSafetyScore] = useState(initialScore);
    const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredMode);

    const safetyState = scoreToState(safetyScore);
    const isDark = resolveIsDark(themeMode);
    const colors = THEME_COLORS[safetyState];

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem(STORAGE_KEY, mode);
    }, []);

    // Apply CSS variables whenever state or dark mode changes
    useEffect(() => {
        applyCSSVariables(safetyState, isDark);
    }, [safetyState, isDark]);

    // Re-check auto mode every minute for sunrise/sunset boundaries
    useEffect(() => {
        if (themeMode !== "auto") return;
        const interval = setInterval(() => {
            const nowDark = isNightTime();
            if (nowDark !== isDark) {
                applyCSSVariables(safetyState, nowDark);
            }
        }, 60_000);
        return () => clearInterval(interval);
    }, [themeMode, isDark, safetyState]);

    const value = useMemo(
        () => ({
            safetyScore,
            safetyState,
            colors,
            isDark,
            themeMode,
            setSafetyScore,
            setThemeMode,
        }),
        [safetyScore, safetyState, colors, isDark, themeMode, setThemeMode],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
