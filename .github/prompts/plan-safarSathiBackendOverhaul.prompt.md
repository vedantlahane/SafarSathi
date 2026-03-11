# Plan: Overhaul SafarSathi Backend — Models, Schemas & APIs

The backend currently has **bare-minimum models**, **divergent model/schema definitions**, **missing API endpoints**, and **weak data coupling**. This plan eliminates the redundant `models/` interfaces in favor of Mongoose schemas as the single source of truth, enriches every schema with production-grade fields, adds missing CRUD & real-time endpoints, and wires admin↔user data flow properly — all while keeping the door open for an AI/ML pipeline later.

---

## Step 1 — Unify Models & Schemas (eliminate duplication)

Delete the `models/` directory entirely. The Mongoose schemas in `src/schemas/` become the **single source of truth**. Export TypeScript types derived from them (e.g., `type Tourist = InferSchemaType<typeof TouristSchema>`) so every controller, service, and future ML pipeline consumes one consistent contract.

---

## Step 2 — Enrich Existing Schemas

- **Tourist.schema.ts**: Add `travelType` enum (`solo`, `family`, `group`, `adventure`), `preferredLanguage`, `visaType`, `visaExpiry`, `travelItinerary` (array of `{destination, arrivalDate, departureDate}`), `deviceToken` (for push notifications), `isActive` boolean, `locationHistory` (capped sub-array or separate collection for ML), `speed` & `heading` fields (currently dropped by controller), `lastScoreUpdate` timestamp, and a `2dsphere` GeoJSON index on `currentLocation` (replace flat `currentLat/currentLng` with a GeoJSON `Point`).
- **Alert.schema.ts**: Add `resolvedBy` (ObjectId ref → PoliceDepartment), `resolvedAt`, `cancelledAt`, `preAlertTriggered` boolean, `responseTimeMs` (computed), `escalationLevel` (1–3), `media` (array of attachment URLs), and `nearestStationId` (auto-populated on creation via geospatial query).
- **RiskZone.schema.ts**: Convert center to GeoJSON `Polygon`/`Point` with `2dsphere` index, add `category` enum (`flood`, `wildlife`, `crime`, `traffic`, `political_unrest`, `other`), `createdBy` (ref → PoliceDepartment), `expiresAt` (TTL for temporary zones), `affectedTouristCount` (virtual/computed), `source` (`admin` | `ml_pipeline` | `crowd_report`).
- **PoliceDepartment.schema.ts**: Add `stationType` enum (`outpost`, `station`, `district_hq`) per context.md spec, `jurisdictionRadiusKm`, `officerCount`, `activeAlertCount` (virtual), `coverageArea` (GeoJSON Polygon + `2dsphere`), and **switch password hashing from SHA-256 to bcrypt** for consistency with auth service.
- **Hospital.schema.ts**: Add `tier` enum (`PHC`, `CHC`, `DH`, `Medical College`), `specialties` array, `bedCapacity`, `availableBeds`, `operatingHours`, `ambulanceAvailable` boolean.
- **Notification.schema.ts**: Add `priority` enum (`low`, `normal`, `urgent`, `critical`), `expiresAt`, `channel` (`push`, `ws`, `sms`), `broadcastTarget` (`all` | `zone:<id>` | `tourist:<id>`).

---

## Step 3 — Add New Schemas

- **TouristLocationLog** — time-series collection storing `{touristId, location (GeoJSON), speed, heading, timestamp, safetyScoreAtTime}`. This feeds the future ML anomaly-detection pipeline and decouples hot write path from the Tourist document.
- **Incident** — a richer superset of Alert for post-resolution analytics: `{alertRef, zone, category, description, casualties, mediaUrls, reportedBy, verifiedBy, timeline[]}`. Needed for dashboards and ML training data.
- **TravelAdvisory** — `{region, severity, title, body, issuedBy, effectiveFrom, effectiveTo, source}` — admin-issued or ML-generated travel warnings shown on the map & home page.
- **AuditLog** — `{actor (admin|system), action, targetCollection, targetId, diff, timestamp}` — tracks every admin mutation for accountability and data reliability.

---

## Step 4 — Fix & Add API Endpoints

**Missing endpoints to build:**

| Endpoint | Purpose |
|---|---|
| `POST /api/sos/pre-alert` | Silent 2-second pre-alert (spec requirement) |
| `POST /api/sos/:id/cancel` | Cancel active SOS before dispatch |
| `GET /api/sos/:id/status` | Poll SOS lifecycle state |
| **Hospital CRUD** (`/api/admin/hospitals`) | Admin can manage hospitals (currently read-only) |
| `POST /api/admin/broadcast` | Send notification to all / zone-filtered tourists |
| `GET /api/admin/audit-log` | Paginated audit trail |
| **Travel Advisory CRUD** (`/api/advisories`) | Admin creates, public reads |
| `GET /api/tourist/:id/location-history` | For ML pipeline & tourist self-review |

**Existing endpoints to fix:**

- **sosController.ts** — accept & persist `speed`, `heading`, `accuracy` from location updates.
- **dashboardController.ts** — return `responseTime`, `activeTouristCount`, `criticalAlertCount` that the frontend already expects.
- **adminPoliceController.ts** — strip `passwordHash` from all list/get responses; switch to bcrypt.
- **authController.ts** — add Zod request validation middleware for register/login payloads.

---

## Step 5 — Strengthen Data Coupling & Real-time Sync

- **Mongoose `ref` + `populate`**: Replace plain string `touristId` / `stationId` fields with `Schema.Types.ObjectId` refs so joins are native and cascading deletes can be handled via middleware hooks.
- **WebSocket rooms**: Upgrade `websocketService.ts` from broadcast-only to room-based (`admin`, `tourist:<id>`, `zone:<id>`). Emit `SCORE_UPDATE`, `ZONE_UPDATE`, `ADVISORY` message types alongside existing `ALERT`.
- **Post-save hooks**: On Alert status change → push WebSocket event to relevant tourist & admin room. On RiskZone create/update → broadcast `ZONE_UPDATE` to all connected map clients. On safety score recalc → push `SCORE_UPDATE` to tourist.
- **Periodic safety-score recomputation**: Add a lightweight cron (e.g., `node-cron`) that recalculates scores for all active tourists every 5 minutes, not just on location update, and pushes changes via WebSocket.

---

## Step 6 — Persistence, Validation & Reliability

- Add **Zod validation middleware** for all request bodies (register, login, SOS, CRUD payloads) — reject malformed data before it hits controllers.
- Add **rate limiting** (`express-rate-limit`) on auth endpoints (5 req/min), SOS (3 req/min), and location updates (1 req/sec).
- Implement **AuditLog writes** inside a Mongoose post-hook on every admin mutation (alert status change, zone CRUD, police CRUD, hospital CRUD).
- Fix the **route deviation stub** in `anomalyDetection.ts` (currently `return 0.0`) — implement actual Haversine distance calculation against itinerary waypoints.
- Add **MongoDB indexes**: `2dsphere` on Tourist `currentLocation`, RiskZone `geometry`, PoliceDepartment `coverageArea`, Hospital `location`; compound index on `TouristLocationLog {touristId, timestamp}`.

---

## Open Questions / Decisions Needed

1. **Location storage format**: Convert all `lat/lng` flat fields to GeoJSON `{ type: "Point", coordinates: [lng, lat] }` — this is a **breaking change** for seed data and frontend map code. Should we migrate in one shot or add a compatibility layer? do whatever thebest
2. **AI/ML pipeline hook**: The `TouristLocationLog` collection and `Incident` schema are designed as training-data sources. Should we add a `source: 'ml_pipeline'` field on RiskZone and TravelAdvisory now so ML-generated entities are distinguishable from admin-created ones? (Recommended: yes.) yes
3. **Old Java/Spring backends**: The workspace has `backend/`, `backend-spring/`, and `backendapi/` directories plus a MySQL-targeting `admin_setup.sql` — these appear to be abandoned iterations. Should we remove them to reduce confusion, or keep them archived? No
