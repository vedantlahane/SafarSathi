import type { Request, Response } from "express";
import type { JwtPayload } from "../middleware/authMiddleware.js";
import { broadcastAll, broadcastToRoom } from "../services/websocketHub.js";
import { getAllTourists, createNotification } from "../services/mongoStore.js";
import { writeAuditLog } from "../services/auditService.js";

/**
 * Send a notification/message broadcast.
 * Target can be: "all" | "zone:<zoneId>" | "tourist:<touristId>"
 */
export async function sendBroadcast(req: Request, res: Response) {
  const admin = req.user as JwtPayload | undefined;
  const { title, message, target, priority } = req.body as {
    title: string;
    message: string;
    target?: string;
    priority?: string;
  };

  const resolvedTarget = target ?? "all";
  const resolvedPriority = priority ?? "normal";

  // Create in-app notifications for affected tourists
  if (resolvedTarget === "all") {
    const tourists = await getAllTourists();
    const notifPromises = tourists.map((t) =>
      createNotification({
        touristId: t._id,
        title,
        message,
        type: "broadcast",
        sourceTab: "home",
        read: false,
        priority: resolvedPriority,
        channel: "in_app",
        broadcastTarget: resolvedTarget,
      })
    );
    await Promise.all(notifPromises);

    broadcastAll({
      type: "BROADCAST",
      payload: { title, message, priority: resolvedPriority },
    });
  } else if (resolvedTarget.startsWith("tourist:")) {
    const touristId = resolvedTarget.replace("tourist:", "");
    await createNotification({
      touristId,
      title,
      message,
      type: "broadcast",
      sourceTab: "home",
      read: false,
      priority: resolvedPriority,
      channel: "in_app",
      broadcastTarget: resolvedTarget,
    });
    broadcastToRoom(resolvedTarget, {
      type: "BROADCAST",
      payload: { title, message, priority: resolvedPriority },
    });
  } else if (resolvedTarget.startsWith("zone:")) {
    // Broadcast to zone room (tourists subscribed to that zone)
    broadcastToRoom(resolvedTarget, {
      type: "BROADCAST",
      payload: { title, message, priority: resolvedPriority },
    });
  }

  if (admin?.sub) {
    await writeAuditLog({
      actor: admin.sub,
      actorType: "admin",
      action: "broadcast_sent",
      targetCollection: "notifications",
      targetId: resolvedTarget,
      changes: { title, message, target: resolvedTarget, priority: resolvedPriority },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  }

  return res.json({ acknowledged: true, target: resolvedTarget });
}
