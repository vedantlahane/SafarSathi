/**
 * Persistent user preferences — backed by localStorage.
 * Toggles in Settings now survive page refreshes.
 */

const PREFS_KEY = "YatraXUserPrefs";

export interface UserPrefs {
  // Notifications
  pushNotifications: boolean;
  alertSounds: boolean;
  vibration: boolean;
  quietHours: boolean;
  // Privacy / Location
  locationSharing: boolean;
  highAccuracyGps: boolean;
  anonymousData: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  pushNotifications: true,
  alertSounds: true,
  vibration: true,
  quietHours: false,
  locationSharing: true,
  highAccuracyGps: false,
  anonymousData: true,
};

let cachedPrefs: UserPrefs | null = null;
const listeners = new Set<() => void>();

export function getPrefs(): UserPrefs {
  if (cachedPrefs) return cachedPrefs;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = { ...DEFAULT_PREFS, ...JSON.parse(raw) } as UserPrefs;
      cachedPrefs = parsed;
      return cachedPrefs;
    }
  } catch {
    // ignore parse errors
  }
  const defaults = { ...DEFAULT_PREFS };
  cachedPrefs = defaults;
  return cachedPrefs;
}

export function setPrefs(partial: Partial<UserPrefs>): void {
  cachedPrefs = { ...getPrefs(), ...partial };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(cachedPrefs));
  } catch {
    // storage quota exceeded — ignore
  }
  listeners.forEach((l) => l());
}

export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
