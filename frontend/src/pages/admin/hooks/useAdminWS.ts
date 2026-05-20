import { useEffect, useRef, useCallback } from "react";
import { getAdminSession } from "@/lib/session";
import { toast } from "sonner";

interface AdminWSOptions {
  onNewAlert?: (alert: any) => void;
  onNewAdvisory?: (advisory: any) => void;
  enabled?: boolean;
}

function buildWsUrl(token: string): string {
  const backendUrl = import.meta.env.VITE_BACKEND_NODE_URL as string | undefined;
  let base = "";
  if (backendUrl?.trim()) {
    // Convert http(s):// → ws(s)://
    base = backendUrl.trim().replace(/^http/, "ws").replace(/\/$/, "");
  } else {
    // Same origin — derive from window.location
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    base = `${proto}://${window.location.host}`;
  }
  return `${base}/ws-connect?token=${encodeURIComponent(token)}`;
}

export function useAdminWS({ onNewAlert, onNewAdvisory, enabled = true }: AdminWSOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const onNewAlertRef = useRef(onNewAlert);
  const onNewAdvisoryRef = useRef(onNewAdvisory);
  // Keep refs in sync without triggering reconnect
  useEffect(() => { onNewAlertRef.current = onNewAlert; }, [onNewAlert]);
  useEffect(() => { onNewAdvisoryRef.current = onNewAdvisory; }, [onNewAdvisory]);

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return;

    const session = getAdminSession();
    if (!session?.token) return;

    const url = buildWsUrl(session.token);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        // Join the admin room
        ws.send(JSON.stringify({ type: "JOIN", room: "admin" }));
        console.log("[AdminWS] connected, joined room 'admin'");
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === "ALERT" && msg.payload) {
            onNewAlertRef.current?.(msg.payload);
            const alertType = (msg.payload.alertType || msg.payload.type || "Alert").replace(/_/g, " ");
            toast.warning(`🚨 New Alert: ${alertType}`, {
              description: msg.payload.message || `Priority: ${msg.payload.priority || "UNKNOWN"}`,
              duration: 8000,
            });
          } else if (msg.type === "ADVISORY_CREATED" && msg.payload) {
            onNewAdvisoryRef.current?.(msg.payload);
            toast.info(`📢 New Advisory: ${msg.payload.title || ""}`, {
              description: `Severity: ${msg.payload.severity || "info"}`,
              duration: 8000,
            });
          }
        } catch {
          // Ignore non-JSON frames
        }
      };

      ws.onclose = (event) => {
        wsRef.current = null;
        if (!mountedRef.current) return;
        if (event.code !== 1000) {
          // Abnormal close — reconnect after 3 s
          reconnectTimer.current = setTimeout(() => {
            if (mountedRef.current) connect();
          }, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.warn("[AdminWS] failed to connect:", err);
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "unmount");
        wsRef.current = null;
      }
    };
  }, [connect]);
}
