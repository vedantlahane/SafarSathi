const DEFAULT_BASE_URL = "http://localhost:8081";
const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_NODE_URL as string | undefined) ??
    DEFAULT_BASE_URL;

function buildUrl(path: string) {
    const trimmedBase = API_BASE_URL.replace(/\/$/, "");
    const trimmedPath = path.startsWith("/") ? path : `/${path}`;
    return `${trimmedBase}${trimmedPath}`;
}

export async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(buildUrl(path), {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        ...options,
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
