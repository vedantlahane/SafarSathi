import axios from "axios";
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
    const envUrl = import.meta.env.VITE_BACKEND_NODE_URL as string | undefined;
    if (envUrl?.trim()) return envUrl.trim();
    if (typeof window === "undefined") return "http://localhost:8081";
    const { protocol, hostname, origin } = window.location;
    if (isLocalHostname(hostname) || isPrivateHostname(hostname)) {
        return `${protocol}//${hostname}:8081`;
    }
    return origin;
}

const API_BASE_URL = resolveBaseUrl();

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        let errMsg = `Request failed with status ${error.response?.status}`;
        if (error.response?.data) {
            errMsg = error.response.data.message || error.response.data.error || errMsg;
        }
        return Promise.reject(new Error(errMsg));
    }
);

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

    const response = await api.request({
        url: path,
        method: options.method || 'GET',
        data: options.body ? JSON.parse(options.body as string) : undefined,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string> ?? {}),
        },
    });

    if (response.status === 204) {
        return null as T;
    }

    const json = response.data;
    if (json && typeof json === "object") {
        const ok = (json as any).ok ?? (json as any).success;
        if ((ok === true || ok === "true") && !("token" in json)) {
            if ("data" in json) return (json as any).data as T;
            if ("user" in json) return (json as any).user as T;
            if ("alert" in json) return (json as any).alert as T;
            if ("zones" in json) return (json as any).zones as T;
            if ("hospitals" in json) return (json as any).hospitals as T;
            if ("departments" in json) return (json as any).departments as T;
        }
    }
    return json as T;
}

export function getApiBaseUrl() {
    return API_BASE_URL;
}
