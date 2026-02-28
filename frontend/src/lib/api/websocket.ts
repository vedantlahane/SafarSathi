import { getApiBaseUrl } from "./client";

/* ─── WS message types ─────────────────────────────────── */

export type WSMessageType =
    | "ALERT"
    | "BROADCAST"
    | "ADVISORY_CREATED"
    | "SCORE_UPDATE"
    | "LOCATION_UPDATE"
    | "ZONE_ALERT";

export interface WSMessage<T = unknown> {
    type: WSMessageType;
    payload: T;
}

export interface WSAlertPayload {
    alertId: number;
    touristId?: string;
    alertType: string;
    status: string;
    message?: string;
    priority?: string;
    lat?: number;
    lng?: number;
    createdTime: string;
}

export interface WSBroadcastPayload {
    title: string;
    message: string;
    priority: string;
    sentAt: string;
}

export interface WSAdvisoryPayload {
    id: string;
    title: string;
    description: string;
    severity: string;
    region: string;
    issuedAt: string;
    expiresAt?: string;
}

export interface WSScoreUpdatePayload {
    touristId: string;
    safetyScore: number;
    previousScore?: number;
    reason?: string;
}

export type WSEventHandlers = {
    onAlert?: (payload: WSAlertPayload) => void;
    onBroadcast?: (payload: WSBroadcastPayload) => void;
    onAdvisory?: (payload: WSAdvisoryPayload) => void;
    onScoreUpdate?: (payload: WSScoreUpdatePayload) => void;
    onAny?: (msg: WSMessage) => void;
};

/* ─── Connection factory ───────────────────────────────── */

export function connectWebSocket(
    room: string,
    handlers: WSEventHandlers,
    token?: string
) {
    const wsBase = getApiBaseUrl().replace(/^http/i, "ws").replace(/\/$/, "");
    const url = token
        ? `${wsBase}/ws-connect?token=${encodeURIComponent(token)}`
        : `${wsBase}/ws-connect`;
    const socket = new WebSocket(url);

    socket.onopen = () => {
        /* join the requested room */
        socket.send(JSON.stringify({ type: "JOIN", room }));
    };

    socket.onmessage = (event) => {
        try {
            const msg: WSMessage = JSON.parse(event.data);
            handlers.onAny?.(msg);

            switch (msg.type) {
                case "ALERT":
                    handlers.onAlert?.(msg.payload as WSAlertPayload);
                    break;
                case "BROADCAST":
                    handlers.onBroadcast?.(msg.payload as WSBroadcastPayload);
                    break;
                case "ADVISORY_CREATED":
                    handlers.onAdvisory?.(msg.payload as WSAdvisoryPayload);
                    break;
                case "SCORE_UPDATE":
                    handlers.onScoreUpdate?.(msg.payload as WSScoreUpdatePayload);
                    break;
            }
        } catch {
            // ignore malformed messages
        }
    };

    return socket;
}

/* ─── Legacy helper — backwards compatible ─────────────── */

export function connectAlertsSocket(onAlert: (alert: unknown) => void) {
    return connectWebSocket("admin", { onAlert: onAlert as WSEventHandlers["onAlert"] });
}
