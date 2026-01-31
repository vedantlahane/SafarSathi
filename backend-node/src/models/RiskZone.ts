export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface RiskZone {
  id: number;
  name: string;
  description?: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  riskLevel: RiskLevel;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
