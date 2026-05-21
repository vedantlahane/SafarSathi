# YatraX Backend — Context Document
> Use this file to understand the backend architecture for creating flowcharts, diagrams, and presentations.

---

## 1. Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 24, TypeScript 6, ESM modules |
| HTTP Framework | **Express 5** |
| ORM | **Drizzle ORM** (drizzle-orm/postgres-js) |
| Database | **PostgreSQL + PostGIS** (spatial queries: ST_Buffer, ST_DWithin, ST_Distance) |
| Connection Pool | `postgres` driver, max 10 connections, `prepare: false` (Supabase pooler compatible) |
| Cache | **Redis** (ioredis) — safety scores, AQI, IMD weather, rate limit counters |
| WebSocket | Native **ws** library (room-based pub/sub on `/ws-connect`) |
| Auth | **JWT** (jsonwebtoken) + **bcryptjs** password hashing (cost 12) |
| Validation | **Zod v4** on every route (body, params, query) |
| Rate Limiting | `express-rate-limit` + `rate-limit-redis` (sliding window) |
| Logging | **Pino** + pino-http request middleware |
| Security | **Helmet** (security headers) + CORS |
| Scheduler | **node-cron** (2 background jobs) |
| External APIs | Python ML FastAPI, Open-Meteo AQI, IMD India (OAuth JWT), OpenStreetMap Overpass |
| Dev Tooling | `tsx watch` (hot reload), `drizzle-kit` (migrations + studio) |

---

## 2. Server Architecture

```
Node.js HTTP Server (port 8081)
         │
         ├── Express 5 App
         │     ├── Helmet (security headers)
         │     ├── CORS (configurable origin)
         │     ├── JSON body parser (100KB limit)
         │     ├── Pino HTTP logger
         │     ├── Rate limiters (Redis-backed)
         │     ├── All API Routers (see Section 5)
         │     └── Global error handler
         │
         ├── WsHub (WebSocket Server)
         │     └── Path: /ws-connect
         │           ├── Room: "admin"
         │           ├── Room: "tourist:<uuid>"
         │           └── Room: "zone:<id>"
         │
         └── Background Jobs (node-cron)
               ├── Score recompute: every 5 minutes
               └── Expired zone cleanup: every 15 minutes
```

**Bootstrap sequence** (`server.ts`):
1. Import Express app, create `http.Server`
2. Attach `WsHub` to the same HTTP port
3. Start cron jobs
4. `server.listen(PORT)`
5. Register SIGINT/SIGTERM graceful shutdown (10s timeout)

---

## 3. Environment Variables

Validated at startup with Zod — **fatal exit on missing/invalid values**.

| Variable | Default | Description |
|---|---|---|
| `PORT` | 8081 | HTTP/WS listen port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_URL` | — | Redis connection string |
| `JWT_SECRET` | — | Min 32 chars |
| `JWT_EXPIRY` | `7d` | Token lifetime |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `ML_API_URL` | — | Python ML FastAPI base URL |
| `ML_API_TIMEOUT_MS` | 2500 | ML API timeout |
| `IMD_API_KEY` | — | India Meteorological Dept API key |
| `IMD_EMAIL` / `IMD_PASSWORD` | — | IMD OAuth credentials |

---

## 4. Database Schema

All tables use Drizzle ORM with `pg-core`. Spatial tables use PostGIS `geography(Geometry, 4326)` columns.

### `tourists` (Core user table)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto-generated |
| `name` | text | |
| `email` | text unique | |
| `phone` | text | |
| `passportNumber` | text | |
| `passwordHash` | text | bcrypt cost 12 |
| `resetTokenHash` | text nullable | SHA-256 of reset token |
| `resetTokenExpires` | timestamptz | 30-minute window |
| `dateOfBirth` | text nullable | |
| `address` | text nullable | |
| `gender` | text nullable | Male/Female/Non-binary/Prefer not to say |
| `nationality` | text nullable | |
| `bloodType` | text nullable | A+/A-/B+/B-/AB+/AB-/O+/O- |
| `allergies` | text[] nullable | |
| `medicalConditions` | text[] nullable | |
| `emergencyContact` | jsonb `{name, phone, relationship}` | |
| `idHash` | text unique nullable | SHA-256 for QR code verification |
| `idExpiry` | timestamptz | 1 year from registration |
| `currentLat` / `currentLng` | doublePrecision | live location |
| `speed`, `heading`, `locationAccuracy` | doublePrecision | |
| `lastSeen` | timestamptz | |
| `safetyScore` | integer default 100 | 0–100 range |
| `lastScoreUpdate` | timestamptz | |
| `isActive` | boolean default true | |
| `createdAt`, `updatedAt` | timestamptz | |

Indexes: `email`, `idHash`

---

### `risk_zones` (Geofenced danger areas)
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `name` | text | |
| `description` | text nullable | |
| `shapeType` | text | `"circle"` or `"polygon"` |
| `centerLat`, `centerLng` | doublePrecision nullable | circle only |
| `radiusMeters` | integer nullable | circle only (50–50,000m) |
| `polygonCoordinates` | jsonb `number[][]` | polygon only (3–100 vertices) |
| `geom` | geography (PostGIS) | auto-computed: ST_Buffer for circles, ST_GeogFromText for polygons |
| `riskLevel` | text | LOW / MEDIUM / HIGH / CRITICAL |
| `active` | boolean default true | |
| `category` | text nullable | flood/wildlife/crime/traffic/political_unrest/other |
| `source` | text | admin / ml_pipeline / crowd_report |
| `expiresAt` | timestamptz nullable | cron auto-deactivates expired zones |
| `createdAt`, `updatedAt` | timestamptz | |

Indexes: `geom` (GiST spatial), `active`

---

### `police_departments` (Admin users + police stations)
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | also the admin JWT `sub` |
| `name` | text | |
| `email` | text unique | used for admin login |
| `passwordHash` | text | bcrypt |
| `departmentCode` | text unique | |
| `latitude`, `longitude` | doublePrecision | |
| `geom` | geography (PostGIS) | |
| `city`, `district`, `state` | text | |
| `contactNumber` | text | |
| `stationType` | text | outpost / station / district_hq |
| `jurisdictionRadiusKm` | integer default 10 | |
| `officerCount` | integer default 0 | |
| `isActive` | boolean | |

Indexes: `geom` (GiST), `isActive`

---

### `hospitals`
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `name` | text | |
| `latitude`, `longitude` | doublePrecision | |
| `geom` | geography (PostGIS) | |
| `contact` | text | |
| `type` | text | hospital/clinic/pharmacy |
| `tier` | text nullable | PHC/CHC/DH/Medical_College |
| `emergency` | boolean | |
| `specialties` | text[] | |
| `bedCapacity`, `availableBeds` | integer | |
| `operatingHours` | jsonb `{open, close, is24Hours}` | |
| `ambulanceAvailable` | boolean | |
| `city`, `district`, `state` | text | |
| `isActive` | boolean | |

Indexes: `geom` (GiST), `isActive`, `type`

---

### `alerts` (SOS + automated alerts)
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `touristId` | uuid FK → tourists | cascade delete |
| `alertType` | text | SOS / PRE_ALERT / RISK_ZONE / INACTIVITY |
| `priority` | text | LOW / MEDIUM / HIGH / CRITICAL |
| `status` | text | OPEN / PENDING / ACKNOWLEDGED / RESOLVED / DISMISSED / CANCELLED |
| `message` | text nullable | |
| `media` | text[] nullable | up to 10 URLs |
| `latitude`, `longitude` | doublePrecision | |
| `geom` | geography nullable | |
| `preAlertTriggered` | boolean | |
| `escalationLevel` | integer | 1 (pre-alert) → 3 (SOS) |
| `nearestStationId` | uuid FK → police_departments | auto-resolved spatially |
| `resolvedBy` | uuid FK → police_departments | |
| `resolvedAt` | timestamptz | |
| `responseTimeMs` | integer | ms from creation to resolution |
| `assignedUnit` | text | free-form unit name |

Indexes: `geom` (GiST), `status`, `(touristId, status)`, `createdAt`

---

### `tourist_location_logs` (GPS history)
| Column | Type |
|---|---|
| `id` | bigserial PK |
| `touristId` | uuid FK → tourists |
| `latitude`, `longitude` | doublePrecision |
| `geom` | geography (PostGIS) |
| `speed`, `heading`, `accuracy` | doublePrecision nullable |
| `safetyScoreAtTime` | integer |
| `timestamp` | timestamptz |

Indexes: `(touristId, timestamp)`, `geom` (GiST)

---

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `touristId` | uuid FK → tourists | |
| `title`, `message` | text | |
| `type` | text | system / alert / broadcast / advisory |
| `priority` | text | low / normal / high / urgent |
| `read` | boolean default false | |
| `sourceTab` | text | home / map / identity / settings |
| `broadcastTarget` | text nullable | `"all"` / `"tourist:<id>"` / `"zone:<id>"` |
| `createdAt` | timestamptz | |

Indexes: `(touristId, read)`, `createdAt`

---

### `travel_advisories`
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `title`, `body` | text | |
| `severity` | text | INFO / WARNING / CRITICAL |
| `affectedArea` | text nullable | |
| `source` | text | admin |
| `active` | boolean | |
| `expiresAt` | timestamptz nullable | |
| `createdBy` | uuid FK → police_departments | |

---

### `audit_logs`
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `actor` | text | UUID or `"system"` |
| `actorType` | text | admin / system |
| `action` | text | create_advisory / broadcast / etc. |
| `targetCollection` | text | table name |
| `targetId` | text | record ID |
| `changes` | jsonb | before/after diff |
| `ipAddress`, `userAgent` | text | |
| `timestamp` | timestamptz | |

---

### `blockchain_logs` (ID verification audit trail)
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `touristId` | uuid FK → tourists | |
| `dataHash` | text | |
| `transactionId` | text | |
| `status` | text | default `"SUCCESS_ISSUED_ON_TESTNET"` |

---

### `tourist_pois` (OpenStreetMap points of interest)
| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `osmId` | bigint unique | OpenStreetMap ID |
| `name` | text | |
| `type` | text | gurudwara/temple/mosque/church/attraction/monument/museum/fort/hotel/tourist_info/fire_station/pharmacy |
| `latitude`, `longitude` | doublePrecision | |
| `geom` | geography (PostGIS) | |
| `city`, `district`, `state` | text | default "Punjab" |
| `phone`, `website`, `openingHours`, `description` | text nullable | |
| `isActive` | boolean | |

Indexes: `geom` (GiST), `type`, `osmId`, `isActive`

---

### Entity Relationship Diagram

```
tourists ─────────────────────────────────────┐
   │                                           │
   ├──< alerts >──── police_departments        │
   │        │              │                  │
   │        └── nearestStationId              │
   │             resolvedBy                   │
   ├──< tourist_location_logs                 │
   ├──< notifications                         │
   └──< blockchain_logs                       │
                                               │
travel_advisories ──── police_departments      │
   (createdBy)                                 │
                                               │
risk_zones ────────────────────────────────────┘
   (geom, polygonCoordinates)
   
audit_logs (standalone — references anything by ID string)
tourist_pois (standalone — OSM data)
police_departments (standalone — also admin users)
```

---

## 5. All API Endpoints

### Authentication (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None (rate-limited) | Register tourist; returns JWT + QR hash + user |
| POST | `/api/auth/login` | None (rate-limited) | Login tourist; returns JWT |
| GET | `/api/auth/me` | JWT (tourist) | Get own profile |
| POST | `/api/auth/password-reset/request` | None (rate-limited) | Request password reset token |
| POST | `/api/auth/password-reset/confirm` | None (rate-limited) | Confirm token + set new password |
| GET | `/api/auth/profile/:touristId` | JWT (self or admin) | Get tourist profile |
| PUT | `/api/auth/profile/:touristId` | JWT (self or admin) | Update tourist profile |
| DELETE | `/api/auth/profile/:touristId` | JWT (self or admin) | Delete tourist account |

### Tourist Self-Service (`/api/tourists`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tourists/me` | JWT (tourist) | Get own profile |
| PATCH | `/api/tourists/me` | JWT (tourist) | Update own profile |
| POST | `/api/tourists/me/password` | JWT (tourist) | Change password |
| DELETE | `/api/tourists/me` | JWT (tourist) | Delete own account |

### Action / SOS / Location (`/api/action`)
| Method | Path | Rate Limit | Description |
|---|---|---|---|
| POST | `/api/action/location/:touristId` | 60/min | Ingest GPS; recompute safety score; check geofences |
| POST | `/api/action/sos/:touristId` | 3/min | Fire SOS alert (CRITICAL, escalation 3) |
| POST | `/api/action/sos/:touristId/pre-alert` | 3/min | Silent pre-alert (MEDIUM, escalation 1) |
| POST | `/api/action/sos/:alertId/cancel` | 100/min | Cancel an alert |
| GET | `/api/action/sos/:alertId/status` | 100/min | Get alert status |
| GET | `/api/action/tourist/:touristId/alerts` | 100/min | List tourist's alerts |

### Risk Zones — Public (`/api/risk-zones`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/risk-zones/active` | None | All active zones |
| GET | `/api/risk-zones/nearby?lat&lng&radiusKm&riskLevel` | None | Nearby zones with distance |

### Risk Zones — Admin (`/api/admin/risk-zones`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/risk-zones` | Admin JWT | All zones |
| GET | `/api/admin/risk-zones/active` | Admin JWT | Active zones |
| GET | `/api/admin/risk-zones/stats` | Admin JWT | Counts by severity/category/source + expiring soon |
| POST | `/api/admin/risk-zones` | Admin JWT | Create zone (circle or polygon) |
| POST | `/api/admin/risk-zones/bulk-status` | Admin JWT | Bulk activate/deactivate (up to 500 IDs) |
| GET | `/api/admin/risk-zones/:zoneId` | Admin JWT | Get zone by ID |
| PATCH | `/api/admin/risk-zones/:zoneId` | Admin JWT | Update zone (supports reshaping) |
| PATCH | `/api/admin/risk-zones/:zoneId/status` | Admin JWT | Toggle active flag |
| DELETE | `/api/admin/risk-zones/:zoneId` | Admin JWT | Delete zone |

### Safety Score (`/api/v1/safety`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/safety/check?lat&lon&hour&networkType&weatherSeverity&aqi&batteryPct` | None | Run master safety aggregator |
| POST | `/api/v1/safety/evaluate` | None | Same aggregator via POST body `{lat, lon, local_hour}` |

### Police Stations — Public (`/api/police-stations`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/police-stations` | None | List all active stations |

### Admin Login (`/api/admin/login`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | None (rate-limited) | Police dept login → admin JWT |

### Police Admin (`/api/admin/police`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/police` | Admin JWT | List all departments |
| POST | `/api/admin/police` | Admin JWT | Create police dept |
| GET | `/api/admin/police/:id` | Admin JWT | Get by ID |
| PATCH | `/api/admin/police/:id` | Admin JWT | Update dept |
| DELETE | `/api/admin/police/:id` | Admin JWT | Remove dept |

### Hospitals — Public (`/api/hospitals`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/hospitals` | None | List active hospitals |
| GET | `/api/hospitals/nearby?lat&lng&radiusKm` | None | Nearby hospitals via PostGIS |
| GET | `/api/hospitals/:id` | None | Get hospital by ID |

### Hospitals Admin (`/api/admin/hospitals`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/hospitals` | Admin JWT | List all (including inactive) |
| POST | `/api/admin/hospitals` | Admin JWT | Create hospital |
| GET | `/api/admin/hospitals/:id` | Admin JWT | Get by ID |
| PATCH | `/api/admin/hospitals/:id` | Admin JWT | Update |
| DELETE | `/api/admin/hospitals/:id` | Admin JWT | Remove |

### Tourist POIs (`/api/tourist-pois`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tourist-pois?type=gurudwara,temple&limit=500` | None | Fetch OSM POIs, filter by type (max 2000) |

### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | JWT (tourist) | List own notifications |
| POST | `/api/notifications/:notifId/read` | JWT (tourist) | Mark one as read |
| POST | `/api/notifications/read-all` | JWT (tourist) | Mark all as read |

### Travel Advisories — Public (`/api/advisories`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/advisories/current` | JWT (tourist) | Active non-expired advisories |

### Travel Advisories — Admin (`/api/admin/advisories`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/advisories` | Admin JWT | List all |
| GET | `/api/admin/advisories/:id` | Admin JWT | Get one |
| POST | `/api/admin/advisories` | Admin JWT | Create (writes audit log + WS broadcast) |
| PATCH | `/api/admin/advisories/:id` | Admin JWT | Update (writes audit log) |
| DELETE | `/api/admin/advisories/:id` | Admin JWT | Remove (writes audit log) |

### Broadcast (`/api/admin/broadcast`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/broadcast` | Admin JWT | Send message to `all` / `tourist:<uuid>` / `zone:<id>` |

### Audit Logs (`/api/admin/audit-logs`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/audit-logs?page&limit&actor&action&targetCollection` | Admin JWT | Paginated audit log |

### Tourist Admin (`/api/admin/tourists`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/tourists?page&limit&search` | Admin JWT | Paginated tourist list |
| GET | `/api/admin/tourists/:touristId` | Admin JWT | Get tourist by ID |

### Dashboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/dashboard/state` | Admin JWT | Full admin dashboard (stats, alerts, tourists, response units) |
| GET | `/api/admin/dashboard/tourist/:touristId` | Admin JWT | Individual tourist dashboard |
| GET | `/api/dashboard` | JWT (tourist) | Own tourist dashboard |
| GET | `/api/tourist/:touristId/dashboard` | JWT | Compatibility route for tourist dashboard |

### Alert Admin (`/api/admin/alerts`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/alerts` | Admin JWT | Active alerts (OPEN/PENDING/ACKNOWLEDGED) |
| GET | `/api/admin/alerts/all` | Admin JWT | All alerts paginated |
| POST | `/api/admin/alerts/:alertId/status` | Admin JWT | Update status |
| POST | `/api/admin/alerts/:alertId/assign` | Admin JWT | Assign unit to alert |

### Digital ID Verification
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/id/verify?hash=<hash>` | Admin JWT | Verify tourist QR hash; returns name, passport partial, expiry, blockchain status |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | `{ok: true, service, uptime}` |

---

## 6. Authentication & Authorization

```
JWT Payload:
  { sub: "<uuid>", role: "tourist" | "admin" }

Tourist JWT:
  sub = tourists.id
  role = "tourist"
  Issued by: POST /api/auth/login | /api/auth/register

Admin JWT:
  sub = police_departments.id
  role = "admin"
  Issued by: POST /api/admin/login

Middleware Chain:
  requireAuth   → verifies Bearer token, attaches req.user = { sub, role }
  requireRole("admin") → checks req.user.role === "admin"

Protected Routes:
  Tourist-only:  requireAuth (role check: "tourist" or admin acting on behalf)
  Admin-only:    requireAuth + requireRole("admin")
  Self-or-admin: requireAuth (controller checks req.user.sub === touristId || role === "admin")

Digital ID / QR Verification:
  On register: idHash = SHA-256(passport + phone + timestamp)
  QR code encodes: /api/admin/id/verify?hash=<idHash>
  GET /api/admin/id/verify: returns { name, passportPartial, idExpiry, blockchainStatus }
```

---

## 7. WebSocket Architecture

```
HTTP Server
     │
     └── WebSocket Server (path: /ws-connect)
              │
              └── WsHub (singleton)
                    │
                    ├── clients: Map<ws, Set<roomName>>
                    ├── rooms:   Map<roomName, Set<ws>>
                    │
                    ├── toRoom(room, event)     → sends to all clients in room
                    ├── toAll(event)            → sends to ALL connected clients
                    │
                    └── Client Protocol:
                          → JOIN   { type:"JOIN", room:"admin"|"tourist:<id>"|"zone:<id>" }
                          → LEAVE  { type:"LEAVE", room:"..." }
                          ← events as JSON strings

Named Rooms:
  "admin"           → all connected admin panels
  "tourist:<uuid>"  → specific tourist's frontend
  "zone:<id>"       → all clients interested in a specific zone

Event Format:
  { "type": "ALERT|SCORE_UPDATE|ZONE_UPDATE|BROADCAST|ADVISORY_CREATED", "payload": {...} }

Events Published Per Room:
  "admin":
    - ALERT (new SOS or risk zone alert)
    - ZONE_UPDATE (created/updated/deleted/status_changed/bulk_status_changed/zones_expired)
    - ADVISORY_CREATED
    - BROADCAST

  "tourist:<uuid>":
    - ALERT (their own alerts)
    - SCORE_UPDATE (their safety score changed)
    - BROADCAST

  "zone:<id>":
    - BROADCAST (no DB notification, WebSocket only)
```

---

## 8. Location Ingestion & Safety Scoring Flow

```
POST /api/action/location/:touristId
  Body: { lat, lng, accuracy?, speed?, heading? }
         │
         ▼
  1. Verify JWT (self or admin)
         │
         ▼
  2. Update tourists table:
       currentLat, currentLng, speed, heading, locationAccuracy, lastSeen
         │
         ▼
  3. detectAnomalies() [alert.geofence.ts]
         │
         ├── Check inactivity:
         │     >30 min since lastSeen → score penalty -5
         │     >60 min since lastSeen → score penalty -15, create INACTIVITY alert
         │
         ├── Query risk zones within 0.001km via PostGIS ST_DWithin
         │
         ├── Check which zones tourist was NOT in previously
         │   (in-memory Map<touristId, Set<zoneId>> — resets on server restart)
         │
         └── For each NEWLY entered zone:
               - score penalty based on risk level
               - create RISK_ZONE alert
               - broadcast ALERT to "admin" and "tourist:<id>" rooms
         │
         ▼
  4. Compute new safety score:
       starts at 100
       subtract zone penalties
       subtract inactivity penalty
       clamp to [0, 100]
         │
         ▼
  5. Update tourists.safetyScore in DB
         │
         ▼
  6. Append to tourist_location_logs (fire-and-forget)
         │
         ▼
  7. If score changed → WS broadcast SCORE_UPDATE to "tourist:<id>"
```

### Zone Penalty Table
| Risk Level | Score Penalty |
|---|---|
| CRITICAL | -25 |
| HIGH | -18 |
| MEDIUM | -10 |
| LOW | -5 |
| (unknown) | -8 |

---

## 9. Alert Lifecycle

```
Alert Types:
  SOS          — CRITICAL priority, escalation 3 (manual tourist trigger)
  PRE_ALERT    — MEDIUM priority, escalation 1 (silent, before full SOS)
  RISK_ZONE    — HIGH/MEDIUM priority, escalation 1 (geofence entry)
  INACTIVITY   — MEDIUM priority, escalation 1 (>60 min no location)

Status Flow:
  OPEN → PENDING → ACKNOWLEDGED → RESOLVED
                               → DISMISSED
                               → CANCELLED (tourist self-cancel)

SOS Creation Flow:
  1. Tourist: POST /api/action/sos/:touristId
  2. Backend finds nearest police station (PostGIS spatial query)
  3. Inserts alert { alertType: "SOS", priority: "CRITICAL", escalationLevel: 3, nearestStationId }
  4. Broadcasts ALERT event to:
       - "admin" room (all police panels)
       - "tourist:<id>" room (tourist's own frontend)

Admin Response Flow:
  1. Admin sees alert in real-time (WS ALERT event)
  2. POST /api/admin/alerts/:alertId/status { status: "ACKNOWLEDGED" }
  3. POST /api/admin/alerts/:alertId/assign { assignedUnit: "Unit 7" }
  4. POST /api/admin/alerts/:alertId/status { status: "RESOLVED" }
     → records resolvedAt + responseTimeMs
```

---

## 10. Safety Score Master Aggregator (`/api/v1/safety`)

```
Input: { lat, lon, local_hour?, networkType?, weatherSeverity?, aqi?, batteryPct?, touristId?, gender?, medicalConditions?, age? }
         │
         ▼
  Cache check: Redis key "safety:<lat>:<lon>:<hour>:<gender>" (TTL: 300s)
  HIT → return cached result
  MISS → proceed
         │
         ▼
  Step 1: Call Python ML FastAPI (POST <ML_API_URL>/safety/evaluate, 2.5s timeout)
    Returns: { ml_baseline, infrastructure, spatial_context }
    │
    ├── SUCCESS: use ML danger index
    └── FAIL (timeout/out-of-bounds/offline): fallback to Phase 1 Heuristic Engine
         │
         ▼
  Step 2: Concurrent Live DB/API Queries
    - AQI Data (Open-Meteo API)
    - IMD Weather Warnings (India Met Dept, OAuth JWT)
    - PostgreSQL gatherContext() (Police ETA, Hospital ETA, Risk Zones)
         │
         ▼
  Step 3: Danger Index Synthesis (The Engines)
    danger = ML_hazard_score
    danger += AQI_modifier (Toxic +1.5)
    danger += IMD_weather_modifier (Orange/Red +2.0)
    danger += Telemetry_modifier (Battery <15% +1.5, No Network +1.0)
    danger += Demographic_modifier (Lone female at night +2.0, Senior +3.0)
    
  Step 4: Emergency Offsets (Safety Boosts)
    danger -= 1.5 IF Police ETA < 10 mins
    danger -= 1.5 IF Hospital ETA < 10 mins (Also mitigates Asthma/AQI penalty)
         │
         ▼
  Step 5: Panic Mitigation Math
    If danger > 7.0 AND NOT in physical risk zone:
       danger = 7 + 3 * (1 - exp(-(danger - 7) / 3))  ← Asymptotic soft curve
    Else:
       danger = clamp(danger, 0, 10)
         │
         ▼
  Step 6: Safety Score
    safety_score = 100 - danger_index × 10

  Status thresholds:
    ≥ 80 = "safe"
    ≥ 50 = "caution"
    < 50 = "danger" (Never reaches CRITICAL_DANGER unless physically in Risk Zone)
         │
         ▼
  Cache result in Redis (300s)
         │
         ▼
  Return to client
```

### Phase 1 Heuristic Engine (ML Fallback)
14 weighted factors when ML is offline:

| Factor | Weight | Data Source |
|---|---|---|
| Time of day (hour) | 0.10 | Client input |
| Day pattern (weekend night) | 0.03 | Client input |
| Season (monsoon/winter/summer) | 0.05 | Server date |
| Daylight (astronomical sunset) | 0.05 | Computed formula |
| Risk zone proximity | 0.12 | DB: riskZoneRepo.nearby(2km) |
| Police ETA | 0.10 | DB: nearest station |
| Hospital ETA | 0.08 | DB: nearest hospital |
| Area density (OSM places) | 0.08 | Overpass API |
| Area profile (safe vs risky) | 0.07 | Overpass API |
| Open businesses | 0.05 | Overpass API |
| Active alerts nearby (3km) | 0.08 | DB count |
| Historical incidents (30d) | 0.07 | Hardcoded 0 (not yet implemented) |
| Network connectivity | 0.04 | Client input |
| Weather severity | 0.05 | Client input |
| Air quality | 0.03 | Client input |

**Hard Caps**:
- CRITICAL/HIGH risk zone nearby → max score 40
- MEDIUM risk zone → max score 65
- >5 active alerts within 3km → max score 30
- No network → max score 50

---

## 11. Background Jobs (Cron)

### Job 1: Safety Score Recompute (every 5 minutes)
```
1. Fetch all active tourists
2. Fetch all active risk zones
3. For each tourist WITH a known location:
     score = 100
     for each circle zone within radius (Haversine):
       score -= penalty[zone.riskLevel]
     if lastSeen > 60 min: score -= 15
     elif lastSeen > 30 min: score -= 5
     score = clamp(score, 0, 100)
4. If score changed from DB value:
     - Write new score to tourists table
     - Push SCORE_UPDATE via WebSocket to "tourist:<id>" room

Note: Only circle zones checked (Haversine). Polygon zones only checked
at location-ingest time via PostGIS.
```

### Job 2: Expired Zone Cleanup (every 15 minutes)
```
1. Find all active risk zones WHERE expiresAt < NOW()
2. Bulk set active = false
3. Broadcast ZONE_UPDATE { event: "zones_expired", count } to "admin" room
```

---

## 12. Broadcast System

```
POST /api/admin/broadcast
Body: {
  title: string,
  message: string,
  target: "all" | "tourist:<uuid>" | "zone:<id>",
  priority: "low" | "normal" | "high" | "urgent"
}
         │
         ▼
Target = "all":
  1. Query all active tourists
  2. Insert notification for EACH tourist
  3. wsHub.toAll(BROADCAST event)

Target = "tourist:<uuid>":
  1. Insert notification for that tourist
  2. wsHub.toRoom("tourist:<uuid>", BROADCAST event)

Target = "zone:<id>":
  1. WebSocket ONLY — no DB notification
  2. wsHub.toRoom("zone:<id>", BROADCAST event)
         │
         ▼
  Write to audit_logs { action: "broadcast", targetCollection: "notifications" }
```

---

## 13. Rate Limiting

Redis-backed sliding window via `express-rate-limit` + `rate-limit-redis`. Prefix: `rl:`.

| Limiter | Window | Prod Limit | Dev Limit | Applied To |
|---|---|---|---|---|
| `authLimiter` | 1 min | 50 req | 1000 | register, login, password reset |
| `sosLimiter` | 1 min | 3 req | 1000 | SOS and pre-alert endpoints |
| `locationLimiter` | 1 min | 60 req | 10000 | Location ingest |
| `generalLimiter` | 1 min | 100 req | 10000 | All other endpoints |

Headers: `RateLimit-Policy`, `RateLimit`, `RateLimit-Remaining`, `RateLimit-Reset` (draft-7)

---

## 14. Error Handling

**Centralized middleware** (`shared/middleware/errorHandler.ts`):

| Error Type | HTTP Status | Trigger |
|---|---|---|
| `AppError(BAD_REQUEST)` | 400 | Invalid input not caught by Zod |
| `AppError(UNAUTHORIZED)` | 401 | Missing/invalid JWT |
| `AppError(FORBIDDEN)` | 403 | Insufficient role |
| `AppError(NOT_FOUND)` | 404 | Record not found |
| `AppError(CONFLICT)` | 409 | Duplicate email/code |
| `AppError(RATE_LIMITED)` | 429 | Rate limit exceeded |
| `AppError(UPSTREAM_TIMEOUT)` | 504 | ML API timeout |
| `AppError(INTERNAL)` | 500 | Unexpected server error |
| `ZodError` | 400 | Request validation failure → field-level errors |
| Unknown | 500 | Logged via Pino + generic response |

---

## 15. Module Directory Structure

```
backend/src/
├── server.ts                    # Entry: HTTP server, WsHub, cron, graceful shutdown
├── app.ts                       # Express app: middleware + router registration
│
├── modules/
│   ├── auth/                    # Tourist register/login/profile/password-reset/biometric
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts           # authService: register, login, getProfile, updateProfile
│   ├── tourist/                 # Tourist self-service CRUD + admin list
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts           # touristService: list, getById, update, delete
│   ├── alert/                   # SOS, pre-alert, location ingest, geofence detection
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   ├── service.ts           # alertService: createSOS, createPreAlert, cancelAlert
│   │   └── geofence.ts          # detectAnomalies(), in-memory touristActiveZones Map
│   ├── risk-zone/               # Zone CRUD + PostGIS spatial queries
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts           # riskZoneService: CRUD, nearby(), stats(), bulkStatus()
│   ├── police/                  # Police dept CRUD + admin login
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts           # policeService: CRUD, login() → admin JWT
│   ├── hospital/                # Hospital CRUD + nearby query
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts
│   ├── safety/                  # Master safety score aggregator
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   ├── aggregator.ts        # ML → AQI → IMD → synthesize danger index
│   │   ├── heuristic.ts         # Phase 1 fallback: 14-factor weighted engine
│   │   ├── context.ts           # fetch OSM (Overpass), AQI, IMD, DB zones
│   │   └── ml-client.ts         # Python ML FastAPI client (2.5s timeout)
│   ├── dashboard/               # Admin + tourist dashboards
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts
│   ├── notification/            # List + mark-read
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts
│   ├── advisory/                # Travel advisory CRUD
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts
│   ├── broadcast/               # Admin broadcast to all/tourist/zone
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts
│   ├── audit/                   # Audit log read
│   │   ├── routes.ts
│   │   ├── controller.ts
│   │   └── service.ts
│   └── tourist-poi/             # OSM POI list
│       ├── routes.ts
│       ├── controller.ts
│       └── service.ts
│
└── shared/
    ├── db/
    │   ├── index.ts             # postgres-js pool + Drizzle client
    │   └── schema.ts            # All Drizzle table definitions
    ├── ws/
    │   └── hub.ts               # WsHub singleton (room-based pub/sub)
    ├── config/
    │   └── env.ts               # Zod-validated environment variables
    ├── middleware/
    │   ├── auth.ts              # requireAuth, requireRole
    │   └── errorHandler.ts      # Centralized error middleware
    ├── plugins/
    │   └── rate-limit.ts        # authLimiter, sosLimiter, locationLimiter, generalLimiter
    └── jobs/
        └── cron.ts              # Score recompute (5min) + zone cleanup (15min)
```

---

## 16. External API Integrations

| API | Purpose | Cache | TTL |
|---|---|---|---|
| **Python ML FastAPI** (`ML_API_URL`) | Primary safety scoring (AI model) | Redis `safety:<lat>:<lon>` | 300s |
| **Open-Meteo Air Quality** | PM2.5, PM10, NO2, Ozone | Redis `aqi:<lat>:<lon>` | 3600s |
| **IMD India District Warnings** | India weather alerts (OAuth JWT) | Redis `imd:<district>` | 21600s |
| **OpenStreetMap Overpass API** | Real POI counts for Phase 1 fallback | None | — |

**IMD OAuth flow**: Token fetched via POST to IMD API with email/password. Cached in-memory. Auto-refreshed 5 minutes before expiry.

---

## 17. Security Overview

| Layer | Mechanism |
|---|---|
| Headers | Helmet (CSP, HSTS, X-Frame-Options, X-Content-Type, etc.) |
| CORS | Configurable `CORS_ORIGIN` env var; credentials: true |
| Auth | JWT (HS256, min 32-char secret, 7d default expiry) |
| Passwords | bcrypt cost factor 12 |
| Rate Limiting | Redis-backed sliding window (3/min for SOS, 60/min for location) |
| Input Validation | Zod on every route — bad input returns 400 + field errors |
| Sensitive fields | `passwordHash`, `resetTokenHash`, `resetTokenExpires` stripped by `toPublic()` before every response |
| Password reset token | Returned raw in API response (noted as school-project mode — not production) |
| DB reset token | Stored as SHA-256 hash only |

---

## 18. Key Observations for Diagrams

1. **Dual geofence layers**: Client-side (RBush + Turf, real-time toasts) AND backend server-side (PostGIS ST_DWithin, persists alert to DB).

2. **In-memory zone state**: `touristActiveZones` Map in `alert/geofence.ts` tracks which zones each tourist is inside. Resets on server restart — all tourists will re-trigger zone alerts after a restart.

3. **Cron only handles circles**: The 5-minute score recompute uses Haversine math (JavaScript). Polygon intersection only happens via PostGIS at location-ingest time.

4. **Safety score has two paths**:
   - **Live ingest**: `POST /api/action/location` → detectAnomalies() → DB zone query → score penalty → update
   - **AI score**: `GET/POST /api/v1/safety` → ML → AQI → IMD → return score (NOT written to DB, used for UI display)

5. **WebSocket is broadcast-only**: No client→server data flows via WebSocket (except JOIN/LEAVE). All mutations go through REST API.

6. **Audit logs are partial**: Only broadcast and advisory operations write audit logs. SOS alerts, zone changes, profile updates do NOT currently log to audit_logs.

7. **Blockchain logs exist but are passive**: Table exists with `SUCCESS_ISSUED_ON_TESTNET` default. Digital ID verification reads from this table but no active service creates records.
