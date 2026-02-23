import type { Request, Response } from "express";
import { getAllPoliceDepartments } from "../services/mongoStore.js";

/**
 * Public endpoint — returns active police stations with password hashes stripped.
 * Used by the map page to render station markers.
 */
export async function listPublicStations(_req: Request, res: Response) {
    const depts = await getAllPoliceDepartments();
    const safe = depts.map(({ passwordHash, ...rest }) => rest);
    res.json(safe);
}
