import { getSession, getAdminSession } from "../session";

function resolveBaseUrl(): string {
    // Explicit override via env var
    const envUrl = import.meta.env.VITE_BACKEND_NODE_URL as string | undefined;
    if (envUrl) return envUrl;

    // Auto-detect: use the same hostname the browser loaded from,
    // so LAN / remote devices hit the right backend.
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8081`;
}

const API_BASE_URL = resolveBaseUrl();

function buildUrl(path: string) {
    const trimmedBase = API_BASE_URL.replace(/\/$/, "");
    const trimmedPath = path.startsWith("/") ? path : `/${path}`;
    return `${trimmedBase}${trimmedPath}`;
}

export async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // Check path for admin route
    const isAdminRoute = path.startsWith("/api/admin");
    const adminSession = getAdminSession();
    const touristSession = getSession();

    // Choose appropriate token
    let token = "";
    if (isAdminRoute && adminSession?.token) {
        token = adminSession.token;
    } else if (!isAdminRoute && touristSession?.token) {
        token = touristSession.token;
    } else if (touristSession?.token) {
        // Fallback: if no admin token, but tourist token exists, send tourist token
        // Wait, better: Just use whatever token if the specific one is missing,
        // but prefer the right one based on role.
        token = touristSession.token || adminSession?.token || "";
    } else {
        token = adminSession?.token || "";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(path), {
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string> ?? {}),
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(
            message || `Request failed with status ${response.status}`
        );
    }

    if (response.status === 204) {
        return null as T;
    }
    return (await response.json()) as T;
}

export function getApiBaseUrl() {
    return API_BASE_URL;
}
