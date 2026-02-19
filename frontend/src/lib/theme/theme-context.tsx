import { createContext } from "react";
import type { SafetyState, ThemeColors } from "./theme-config";
import { THEME_COLORS } from "./theme-config";

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeContextValue {
    /** Current numeric safety score (0-100) */
    safetyScore: number;
    /** Derived safety state */
    safetyState: SafetyState;
    /** Active resolved color palette */
    colors: ThemeColors;
    /** Whether dark mode is currently active */
    isDark: boolean;
    /** Raw user preference: light | dark | auto */
    themeMode: ThemeMode;
    /** Update the safety score */
    setSafetyScore: (score: number) => void;
    /** Update the theme mode preference */
    setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
    safetyScore: 100,
    safetyState: "safe",
    colors: THEME_COLORS.safe,
    isDark: false,
    themeMode: "auto",
    setSafetyScore: () => { },
    setThemeMode: () => { },
});
