import type { WebSocket, WebSocketServer } from "ws";

/**
 * Room-based WebSocket hub.
 * Clients join rooms by sending: { type: "JOIN", room: "admin" | "tourist:<id>" | "zone:<id>" }
 * Server broadcasts to specific rooms or all clients.
 */

let websocketServer: WebSocketServer | null = null;

// Room membership: room name → Set of WebSocket clients
const rooms = new Map<string, Set<WebSocket>>();

// Reverse lookup: client → Set of room names (for cleanup on disconnect)
const clientRooms = new Map<WebSocket, Set<string>>();

export function registerWebSocketServer(server: WebSocketServer) {
  websocketServer = server;

  server.on("connection", (ws: WebSocket) => {
    clientRooms.set(ws, new Set());

    ws.on("message", (data: Buffer | string) => {
      try {
        const msg = JSON.parse(typeof data === "string" ? data : data.toString());
        if (msg.type === "JOIN" && typeof msg.room === "string") {
          joinRoom(ws, msg.room);
        } else if (msg.type === "LEAVE" && typeof msg.room === "string") {
          leaveRoom(ws, msg.room);
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      const myRooms = clientRooms.get(ws);
      if (myRooms) {
        for (const room of myRooms) {
          rooms.get(room)?.delete(ws);
          if (rooms.get(room)?.size === 0) rooms.delete(room);
        }
      }
      clientRooms.delete(ws);
    });
  });
}

function joinRoom(ws: WebSocket, room: string) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room)!.add(ws);
  clientRooms.get(ws)?.add(room);
}

function leaveRoom(ws: WebSocket, room: string) {
  rooms.get(room)?.delete(ws);
  if (rooms.get(room)?.size === 0) rooms.delete(room);
  clientRooms.get(ws)?.delete(room);
}

/**
 * Broadcast a message to all clients in a specific room.
 */
export function broadcastToRoom(room: string, message: { type: string; payload: unknown }) {
  const clients = rooms.get(room);
  if (!clients) return;
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

/**
 * Broadcast a message to ALL connected clients (legacy behavior + alerts).
 */
export function broadcastAll(message: { type: string; payload: unknown; destination?: string }) {
  if (!websocketServer) return;
  const payload = JSON.stringify(message);
  websocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

/**
 * Legacy alert broadcast: sends to all clients AND the admin room.
 */
export function broadcastAlert(alert: {
  id: number;
  touristId: string;
  alertType: string;
  lat?: number | null;
  lng?: number | null;
  status: string;
  message?: string | null;
  createdTime: string;
}) {
  const message = { destination: "/topic/alerts", type: "ALERT", payload: alert };
  broadcastAll(message);
  broadcastToRoom("admin", { type: "ALERT", payload: alert });
}
