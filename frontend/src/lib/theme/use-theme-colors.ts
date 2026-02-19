import { useContext } from "react";
import { ThemeContext, type ThemeContextValue } from "./theme-context";

/** Hook to access the current dynamic theme state and controls */
export function useThemeColors(): ThemeContextValue {
    return useContext(ThemeContext);
}
