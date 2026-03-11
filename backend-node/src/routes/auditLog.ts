import { Router } from "express";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { listAuditLogs } from "../controllers/auditLogController.js";

const router = Router();

router.get("/", requireAdmin, listAuditLogs);

export default router;
