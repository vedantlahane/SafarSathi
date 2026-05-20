import { UpdateRiskZoneSchema } from '../backend/src/modules/risk-zone/risk-zone.schema.js';

const payload = {
    name: "Test Zone",
    description: "",
    riskLevel: "MEDIUM",
    shapeType: "circle",
    active: true,
    radiusMeters: 500.5,
    centerLat: 31.0,
    centerLng: 74.0,
};

const result = UpdateRiskZoneSchema.safeParse(payload);
if (!result.success) {
    console.error("Failed!", result.error.errors);
} else {
    console.log("Success!");
}

const payload2 = { ...payload, radiusMeters: 500 };
const result2 = UpdateRiskZoneSchema.safeParse(payload2);
if (!result2.success) {
    console.error("Failed 2!", result2.error.errors);
} else {
    console.log("Success 2!");
}
