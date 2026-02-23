import { getApiBaseUrl } from "./client";

export function connectAlertsSocket(onAlert: (alert: unknown) => void) {
    const wsBase = getApiBaseUrl().replace(/^http/i, "ws").replace(/\/$/, "");
    const socket = new WebSocket(`${wsBase}/ws-connect`);
    socket.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            if (parsed?.payload) {
                onAlert(parsed.payload);
            }
        } catch {
            // ignore malformed messages
        }
    };
    return socket;
}
