import type { WebSocketServer } from "ws";
import type { Alert } from "../models/Alert.js";

let websocketServer: WebSocketServer | null = null;

export function registerWebSocketServer(server: WebSocketServer) {
  websocketServer = server;
}

export function broadcastAlert(alert: Alert) {
  if (!websocketServer) {
    return;
  }
  const payload = JSON.stringify({ destination: "/topic/alerts", payload: alert });
  websocketServer.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}
