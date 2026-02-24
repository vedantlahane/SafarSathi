/** Trigger device vibration for tactile feedback. */
export function hapticFeedback(
    type: "light" | "medium" | "heavy" = "light"
) {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        // Prevent Chrome intervention warnings if called before user interaction
        if ("userActivation" in navigator && !(navigator as any).userActivation.hasBeenActive) {
            return;
        }
        try {
            const patterns = { light: 10, medium: 25, heavy: 50 };
            navigator.vibrate(patterns[type]);
        } catch {
            /* ignore */
        }
    }
}
