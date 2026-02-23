/** Trigger device vibration for tactile feedback. */
export function hapticFeedback(
    type: "light" | "medium" | "heavy" = "light"
) {
    if ("vibrate" in navigator) {
        const patterns = { light: 10, medium: 25, heavy: 50 };
        navigator.vibrate(patterns[type]);
    }
}
