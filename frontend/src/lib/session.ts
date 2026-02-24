import { useSyncExternalStore } from "react";

export type TouristSession = {
  touristId: string;
  token?: string;
  name?: string;
  email?: string;
  idHash?: string;
};

export type AdminSession = {
  adminId: string;
  token: string;
  name: string;
  email: string;
  departmentCode: string;
  city: string;
  district: string;
  state: string;
};

const STORAGE_KEY = "safarSathiSession";
const SESSION_STORAGE_KEY = "safarSathiSession:temp";
const ADMIN_STORAGE_KEY = "safarSathiAdminSession";
let cachedSession: TouristSession | null = null;
let cachedAdminSession: AdminSession | null = null;
const listeners = new Set<() => void>();
const adminListeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function emitAdminChange() {
  adminListeners.forEach((listener) => listener());
}

export function getSession(): TouristSession | null {
  if (cachedSession) {
    return cachedSession;
  }
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const sessionRaw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionRaw) {
      return null;
    }
    try {
      cachedSession = JSON.parse(sessionRaw) as TouristSession;
      return cachedSession;
    } catch {
      return null;
    }
  }
  try {
    cachedSession = JSON.parse(raw) as TouristSession;
    return cachedSession;
  } catch {
    return null;
  }
}

export function saveSession(session: TouristSession, options?: { persist?: boolean }) {
  cachedSession = session;
  const persist = options?.persist ?? true;
  if (persist) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    window.localStorage.removeItem(STORAGE_KEY);
  }
  emitChange();
}

export function clearSession() {
  cachedSession = null;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  emitChange();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSession() {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}

export function getAdminSession(): AdminSession | null {
  if (cachedAdminSession) {
    return cachedAdminSession;
  }
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    cachedAdminSession = JSON.parse(raw) as AdminSession;
    return cachedAdminSession;
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  cachedAdminSession = session;
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
  emitAdminChange();
}

export function clearAdminSession() {
  cachedAdminSession = null;
  window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  emitAdminChange();
}

export function subscribeAdminSession(listener: () => void) {
  adminListeners.add(listener);
  return () => adminListeners.delete(listener);
}

export function useAdminSession() {
  return useSyncExternalStore(subscribeAdminSession, getAdminSession, getAdminSession);
}
