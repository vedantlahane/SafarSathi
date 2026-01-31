import type { Alert } from "../models/Alert.js";
import type { BlockchainLog } from "../models/BlockchainLog.js";
import type { PoliceDepartment } from "../models/PoliceDepartment.js";
import type { RiskZone } from "../models/RiskZone.js";
import type { Tourist } from "../models/Tourist.js";
import { randomUUID } from "crypto";
import { sha256 } from "../utils/hash.js";
import fs from "fs";
import path from "path";

type PersistedStore = {
	tourists: Tourist[];
	riskZones: RiskZone[];
	policeDepartments: PoliceDepartment[];
	alerts: Alert[];
	blockchainLogs: BlockchainLog[];
	counters: {
		alertId: number;
		riskZoneId: number;
		blockchainLogId: number;
	};
};

const dataDir = path.resolve(process.cwd(), "data");
const dataFile = path.join(dataDir, "store.json");

const now = new Date();
const nowIso = now.toISOString();
const idExpiry = new Date(now.getTime());
idExpiry.setFullYear(idExpiry.getFullYear() + 1);

const seedTourists: Tourist[] = [
	{
		id: "ca4b21f2-ce17-49ef-a829-57d063d20163",
		name: "Aarav Sharma",
		email: "tourist@safarsathi.in",
		phone: "+91-9876543211",
		passportNumber: "IND1234567",
		dateOfBirth: "1993-04-12",
		address: "Pan Bazaar, Guwahati, Assam, India",
		gender: "Male",
		nationality: "Indian",
		emergencyContact: "{\"name\":\"Riya Sharma\",\"relationship\":\"Sibling\",\"phone\":\"+91-9876543210\"}",
		passwordHash: sha256("password123"),
		idHash: sha256("IND1234567+91-9876543211"),
		idExpiry: idExpiry.toISOString(),
		currentLat: 26.2006,
		currentLng: 92.9376,
		lastSeen: nowIso,
		safetyScore: 87.0
	}
];

const seedRiskZones: RiskZone[] = [
	{
		id: 1,
		name: "Kamakhya Hill Restricted Belt",
		description: "Sensitive wildlife and temple security perimeter. Tourists require special pass.",
		centerLat: 26.1667,
		centerLng: 91.7086,
		radiusMeters: 750.0,
		riskLevel: "HIGH",
		active: true,
		createdAt: nowIso,
		updatedAt: nowIso
	},
	{
		id: 2,
		name: "Deepor Beel Wildlife Buffer",
		description: "Flood-prone wetlands with limited transport access after dusk.",
		centerLat: 26.1226,
		centerLng: 91.65,
		radiusMeters: 1200.0,
		riskLevel: "MEDIUM",
		active: true,
		createdAt: nowIso,
		updatedAt: nowIso
	}
];

const seedPoliceDepartments: PoliceDepartment[] = [
	{
		id: randomUUID(),
		name: "SafarSathi Control Center",
		email: "admin@safarsathi.in",
		passwordHash: sha256("admin123"),
		departmentCode: "SS-CONTROL",
		latitude: 26.1445,
		longitude: 91.7362,
		city: "Guwahati",
		district: "Kamrup Metropolitan",
		state: "Assam",
		contactNumber: "+91-9876543210",
		isActive: true
	},
	{
		id: randomUUID(),
		name: "Dispur Police Station",
		email: "dispur@police.assam.gov.in",
		passwordHash: sha256("admin123"),
		departmentCode: "PS-DISPUR",
		latitude: 26.1433,
		longitude: 91.7898,
		city: "Guwahati",
		district: "Kamrup Metropolitan",
		state: "Assam",
		contactNumber: "+91-361-2234567",
		isActive: true
	},
	{
		id: randomUUID(),
		name: "Paltan Bazaar Police Station",
		email: "paltan@police.assam.gov.in",
		passwordHash: sha256("admin123"),
		departmentCode: "PS-PALTAN",
		latitude: 26.1158,
		longitude: 91.7086,
		city: "Guwahati",
		district: "Kamrup Metropolitan",
		state: "Assam",
		contactNumber: "+91-361-2234568",
		isActive: true
	}
];

const seedAlerts: Alert[] = [];
const seedBlockchainLogs: BlockchainLog[] = [];

export const tourists: Tourist[] = [];
export const riskZones: RiskZone[] = [];
export const policeDepartments: PoliceDepartment[] = [];
export const alerts: Alert[] = [];
export const blockchainLogs: BlockchainLog[] = [];

let alertIdCounter = 1;
let riskZoneIdCounter = Math.max(0, ...seedRiskZones.map((zone) => zone.id)) + 1;
let blockchainLogIdCounter = 1;

initializeStore();

export function nextAlertId() {
	const next = alertIdCounter++;
	saveStore();
	return next;
}

export function nextRiskZoneId() {
	const next = riskZoneIdCounter++;
	saveStore();
	return next;
}

export function nextBlockchainLogId() {
	const next = blockchainLogIdCounter++;
	saveStore();
	return next;
}

export function saveStore() {
	const payload: PersistedStore = {
		tourists,
		riskZones,
		policeDepartments,
		alerts,
		blockchainLogs,
		counters: {
			alertId: alertIdCounter,
			riskZoneId: riskZoneIdCounter,
			blockchainLogId: blockchainLogIdCounter
		}
	};
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
	fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2), "utf8");
}

function initializeStore() {
	const persisted = loadPersistedStore();
	if (persisted) {
		tourists.push(...persisted.tourists);
		riskZones.push(...persisted.riskZones);
		policeDepartments.push(...persisted.policeDepartments);
		alerts.push(...persisted.alerts);
		blockchainLogs.push(...persisted.blockchainLogs);
		alertIdCounter = persisted.counters.alertId;
		riskZoneIdCounter = persisted.counters.riskZoneId;
		blockchainLogIdCounter = persisted.counters.blockchainLogId;
		return;
	}

	tourists.push(...seedTourists);
	riskZones.push(...seedRiskZones);
	policeDepartments.push(...seedPoliceDepartments);
	alerts.push(...seedAlerts);
	blockchainLogs.push(...seedBlockchainLogs);
	saveStore();
}

function loadPersistedStore(): PersistedStore | null {
	if (!fs.existsSync(dataFile)) {
		return null;
	}
	try {
		const raw = fs.readFileSync(dataFile, "utf8");
		const parsed = JSON.parse(raw) as PersistedStore;
		if (!parsed || !parsed.tourists || !parsed.riskZones) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}
