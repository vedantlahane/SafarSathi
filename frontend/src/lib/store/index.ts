// Barrel re-export — preserves all existing `@/lib/store` imports
export { useAppState, setAppState, useLocationTracking } from "./app-state";
export { hapticFeedback } from "./haptics";

// Backward compat: formatRelativeTime was originally in store.ts
export { formatRelativeTime } from "../utils/format";
