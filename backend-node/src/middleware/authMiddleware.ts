import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
    sub: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "Missing or invalid token" });
        return;
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
        return;
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    requireAuth(req, res, () => {
        if (req.user?.role !== "admin") {
            res.status(403).json({ success: false, message: "Admin access required" });
            return;
        }
        next();
    });
}
