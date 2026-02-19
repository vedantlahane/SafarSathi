// Pure gesture detection functions — no React dependency for testability

export interface GestureState {
    startX: number;
    startY: number;
    startTime: number;
    currentX: number;
    currentY: number;
    isLongPress: boolean;
    ballSide: "left" | "right";
}

export type SwipeDirection = "left" | "right" | "up" | "down";

const MIN_SWIPE_DISTANCE = 80;

/**
 * Detect the dominant swipe direction from a gesture state.
 * Returns null if the movement is below the minimum threshold.
 */
export function detectSwipeDirection(state: GestureState): SwipeDirection | null {
    const dx = state.currentX - state.startX;
    const dy = state.currentY - state.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Must exceed minimum swipe distance
    if (absDx < MIN_SWIPE_DISTANCE && absDy < MIN_SWIPE_DISTANCE) {
        return null;
    }

    // Determine dominant axis
    if (absDx > absDy) {
        return dx < 0 ? "left" : "right";
    }
    return dy < 0 ? "up" : "down";
}

/**
 * Check if a detected swipe direction constitutes a valid SOS trigger.
 * - Horizontal: must swipe toward center (right→left, left→right)
 * - Vertical: always valid
 */
export function isValidSOSTrigger(
    direction: SwipeDirection | null,
    ballSide: "left" | "right",
): boolean {
    if (!direction) return false;

    // Vertical swipes always trigger
    if (direction === "up" || direction === "down") return true;

    // Horizontal must go toward screen center
    if (ballSide === "right" && direction === "left") return true;
    if (ballSide === "left" && direction === "right") return true;

    return false;
}

/**
 * Calculate which side the ball should snap to based on horizontal position.
 */
export function calculateSnapPosition(
    x: number,
    screenWidth: number,
): "left" | "right" {
    return x < screenWidth / 2 ? "left" : "right";
}

/**
 * Clamp vertical position to stay within viewport respecting safe-area insets.
 */
export function clampVerticalPosition(
    y: number,
    ballSize: number,
    viewportHeight: number,
    topInset: number,
    bottomNavHeight: number,
): number {
    const minY = topInset + ballSize / 2;
    const maxY = viewportHeight - bottomNavHeight - ballSize / 2;
    return Math.max(minY, Math.min(maxY, y));
}
