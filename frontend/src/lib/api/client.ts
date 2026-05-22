import axios from "axios";
import { getSession, getAdminSession } from "../session";

function resolveBaseUrl(): string {
    const envUrl = import.meta.env.VITE_BACKEND_NODE_URL as string | undefined;
    if (envUrl?.trim()) return envUrl.trim();
    return ""; // Use relative path in browser to let Vite proxy handle it, or same origin in prod
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
            const data = error.response.data;
            errMsg = data.message || data.error || errMsg;
            if (data.details && Array.isArray(data.details)) {
                const detailMessages = data.details.map((d: any) => `${d.path}: ${d.message}`).join(', ');
                if (detailMessages) {
                    errMsg = `${errMsg} - ${detailMessages}`;
                }
            }
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
