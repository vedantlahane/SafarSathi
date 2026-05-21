// Barrel re-export — preserves all existing `@/lib/store` imports
export { useAppState, setAppState, useLocationTracking } from "./app-state";
export { hapticFeedback } from "./haptics";
export { getPrefs, setPrefs, subscribePrefs } from "./user-prefs";
export type { UserPrefs } from "./user-prefs";

// Backward compat: formatRelativeTime was originally in store.ts
export { formatRelativeTime } from "../utils/format";
