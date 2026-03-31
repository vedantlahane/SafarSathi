import { getSession, getAdminSession } from "../session";

function isLocalHostname(hostname: string): boolean {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isPrivateHostname(hostname: string): boolean {
    return hostname.endsWith(".local") ||
        /^10\./.test(hostname) ||
        /^192\.168\./.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
}

function resolveBaseUrl(): string {
    // Explicit override via env var
    const envUrl = import.meta.env.VITE_BACKEND_NODE_URL as string | undefined;
    if (envUrl?.trim()) return envUrl.trim();

    if (typeof window === "undefined") {
        return "http://localhost:8081";
    }

    // Only use port 8081 automatically for local/LAN development.
    const { protocol, hostname, origin } = window.location;
    if (isLocalHostname(hostname) || isPrivateHostname(hostname)) {
        return `${protocol}//${hostname}:8081`;
    }

    // Deployed frontend should use same-origin API unless env override is set.
    return origin;
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
    if (isAdminRoute) {
        token = adminSession?.token || touristSession?.token || "";
    } else {
        token = touristSession?.token || adminSession?.token || "";
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
