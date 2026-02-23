import type { Request, Response } from "express";
import { getActiveHospitals } from "../services/mongoStore.js";

/**
 * Public endpoint — returns active hospitals for the map page.
 */
export async function listPublicHospitals(_req: Request, res: Response) {
    res.json(await getActiveHospitals());
}
