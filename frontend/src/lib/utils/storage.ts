/**
 * Typed localStorage wrapper with JSON serialization.
 * Gracefully handles quota errors and missing values.
 */

export function getItem<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function setItem<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Quota exceeded or private mode — silent fail
    }
}

export function removeItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // silent fail
    }
}
