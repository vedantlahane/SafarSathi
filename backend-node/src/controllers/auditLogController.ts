import type { Request, Response } from "express";
import { getAuditLogs } from "../services/auditService.js";

export async function listAuditLogs(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;
  const actor = req.query.actor as string | undefined;
  const action = req.query.action as string | undefined;
  const targetCollection = req.query.targetCollection as string | undefined;

  const result = await getAuditLogs({ page, limit, actor, action, targetCollection });
  return res.json(result);
}
