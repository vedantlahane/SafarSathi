# Proactive Tourist Safety System — Frontend Master Guide

Single, expert-level guide for building the SafarSathi hybrid web client as an edge computing node. It aligns the implementation with the invention disclosure "An Integrated IoT-Based System for Proactive Tourist Safety Monitoring and Dynamic Incident Response" by translating patent concepts (Gateway Layer, Dynamic Safety Score, Tamper-Evident Cryptographic Log, IoT sensor fusion) into a concrete React/TypeScript codebase that works offline.

## Purpose and Scope

- Treat the frontend as the "Gateway Layer": simulate edge IoT inputs, fuse data locally, and stay operable offline (airplane mode / disaster zones).
- Keep the Panic Button responsive under load; favor concurrent React updates and lightweight state subscriptions.
- Enforce tamper evidence via client-side SHA-256 hashing (Web Crypto API) and local blockchain log persisted offline.
- Provide a deployable PWA shell: installable, offline-first, secure contexts (HTTPS/localhost), and geolocation/crypto availability.

## Tech Stack and Dependency Mandate

| Category | Package | Version (current or target) | Notes |
| --- | --- | --- | --- |
| Core | react, react-dom | ^19.2.0 | Concurrent features for high-frequency UI updates. |
| Build | vite | ^7.2.4 | Fast HMR; PWA plugin added below. |
| Language | typescript | ~5.9.3 | Enable `strict` + `noImplicitAny`. |
| Styling | tailwindcss | ^4.1.18 | Utility-first; define safety palette. |
| Icons | lucide-react | ^0.555.0 | Lightweight icon set. |
| Maps | leaflet, react-leaflet | ^1.9.4, ^5.0.0 | Offline-tile friendly. |
| State | @reduxjs/toolkit, react-redux | ^2.x, ^9.x (add) | RTK slices/selectors; lean subscriptions for perf. |
| Router | react-router-dom | ^6.20.0 (add) | For multi-screen flows if needed. |
| Charts | recharts | ^2.10.0 (add) | DSS trendline. |
| Gauge | react-gauge-chart | ^0.5.1 (add) | Semi-circle safety gauge. |
| QR gen | qrcode.react | ^3.1.0 (add) | Use `QRCodeSVG` named export. |
| QR scan | @yudiel/react-qr-scanner | latest (add) | Hook-based camera scanning. |
| Storage | idb | ^8.0.0 (add) | IndexedDB wrapper for the log. |
| PWA | vite-plugin-pwa | ^0.20.x (add) | Service worker/manifest automation. |
| Geospatial | turf (optional) | ^7.x | Use only if Leaflet helpers are insufficient. |

> Install missing packages when implementing modules: `npm install @reduxjs/toolkit react-redux recharts react-gauge-chart qrcode.react @yudiel/react-qr-scanner idb vite-plugin-pwa react-router-dom`.

## Project Setup

```bash
npm install
npm run dev
npm run build   # type-check + production bundle
npm run lint    # eslint
```

TypeScript config: ensure `compilerOptions.strict = true` and `noImplicitAny = true` in tsconfig.json.

## Reference Architecture (Frontend as Edge Node)

- PWA shell: installable, offline cache of app shell, icons, manifest, and critical datasets; service worker uses Cache-First for shell and Stale-While-Revalidate for data.
- Dual-path Panic logic: online posts to API + WebSocket; offline triggers local notification and shows emergency QR beacon.
- Local blockchain log: every significant event (zone entry, panic, DSS drop) mined into a SHA-256–linked chain; validity check surfaces integrity warnings in UI.
- Dynamic Safety Score (DSS): deterministic heuristic over biometrics, environment, and geo context; recalculates on each simulated tick.
- Offline geofencing: point-in-polygon checks on-device; triggers score penalty, notification, and blockchain log entry.
- Identity QR: compact JSON payload with abbreviated keys for density; high error correction; scanner validates schema.

## Recommended Directory Map

```
src/
├── components/           # UI primitives and composites
│   ├── ui/               # button, card, tabs, toast, gauge wrapper
│   ├── identity/         # IdentityQR, QRScanner
│   ├── blockchain/       # BlockchainLogViewer
│   ├── dashboard/        # SafetyScoreGauge, Trendline
│   └── panic/            # PanicButton FAB
├── features/             # Screen-level modules (Home, Map, Identity, Settings)
├── hooks/                # useBiometricSimulation, useGeoLocation, useGeoFence
├── lib/                  # Block, Blockchain, safetyEngine, geo math
├── store/                # Redux Toolkit slices (biometric, log, app)
├── pages/                # Routed pages if react-router is enabled
└── utils/                # crypto, formatting helpers
public/manifest.webmanifest
```

## Core Modules and Implementation Guidance

### 1) Tamper-Evident Cryptographic Log

- Use Web Crypto API only; do not add crypto-js. Implement `sha256(message: string): Promise<string>` in `src/utils/crypto.ts` using TextEncoder + `crypto.subtle.digest`.
- `Block` model: `{ index, timestamp (ISO), data: Record<string, unknown>, previousHash, hash }`. Provide async `calculateHash()`; instantiate via a factory that awaits hashing.
- `Blockchain` class: start with genesis (index 0, previousHash "0"); `addBlock(data)` appends with previous hash; `isChainValid()` re-hashes and checks links. Persist chain to IndexedDB via `idb` and keep an in-memory mirror.
- UI: `BlockchainLogViewer` lists blocks with truncated hashes; if `isValid` is false, surface a red integrity banner.

### 2) Biometric Simulation and DSS

- Hook `useBiometricSimulation`: emits heartRate, skinTemp, hrv, aqi every 1–2s; supports narrative states (normal 60–80 bpm, stress 120+, recovery taper). Allow developer toggle panel for state control.
- Safety heuristic (frontend baseline):
  - Start 100.
  - Heart rate > 100: -10; > 140: -30.
  - AQI > 150: -15.
  - In risk zone: -40.
  - Clamp to 0–100; compute trend over last 5 minutes for arrow/sparkline.
- Components: `SafetyScoreGauge` (react-gauge-chart) with color zones (Green 80–100, Yellow 50–79, Red 0–49) and `SafetyTrend` (recharts line).

### 3) Identity and QR System

- QR generation: `IdentityQR` uses `QRCodeSVG` (named export) with `level="H"`, compact payload `{ uid, bt, ec, t }` to aid scan reliability on cracked/dirty screens.
- QR scanning: `QRScanner` via `@yudiel/react-qr-scanner`; handle camera permission errors gracefully and show guidance. Validate parsed JSON schema before trusting.
- Offline "optical beacon": Panic offline path navigates to IdentityQR with a panic payload for rescue devices to ingest.

### 4) Offline Geo-Fencing and Maps

- Map: react-leaflet with base tiles (OSM); plan for pre-caching tiles when possible. Layers: risk polygons (red, semi-transparent), police markers, user marker.
- Geometry: implement `isPointInPolygon(point, polygon)` (ray-casting) in `src/lib/geo.ts`. For many vertices, move to a Web Worker if UI jank appears.
- Triggers on entry: apply DSS penalty, show local Notification, and log a blockchain block `{ type: "ZONE_ENTRY", zone, riskLevel }`.

### 5) Panic Button (Dual Path)

- UI: fixed FAB bottom-center; long-press (≈3s) with radial progress to avoid false triggers; aria-label="Emergency Panic Button".
- Logic:
  - Gather GPS + latest biometrics into panic payload.
  - Online: POST to `/api/emergency`, open WebSocket, show "tracking active" state.
  - Offline: fire high-priority notification, switch to QR beacon view, mine block with panic payload.

### 6) State Management (Redux Toolkit slices)

- Store: configure with RTK; enable serializableCheck exceptions for Web Crypto buffers if needed.
- Slices: `biometricSlice` `{ heartRate, skinTemp, hrv, aqi, currentScore }`; `logSlice` `{ chain, isValid }` with thunks to persist/load from IndexedDB; `appSlice` `{ isOnline, isPanicActive, currentUser, location }`.
- Selectors: expose per-field selectors to keep React-Redux subscriptions narrow during high-frequency simulation.
- Optional RTK Query: for backend wiring (auth, emergency API) while keeping offline fallbacks local.

### 7) PWA and Offline Readiness

- Add `vite-plugin-pwa` with:
  - `registerType: 'autoUpdate'`.
  - Cache list: app shell assets, `dataSets/*.json`, manifest, icons, fallback page.
  - Strategies: Cache-First for shell; Stale-While-Revalidate for JSON; Network-First with fallback for map tiles if cached.
- Manifest: `display: 'standalone'`, `start_url: '/'`, safety-colored icons (192/512 px), theme color that matches safe state.
- Verify in DevTools > Application: service worker active, offline toggle still loads dashboard and panic QR.

## Testing and Validation

- Unit (Vitest): blockchain hashing determinism and tamper detection; `isPointInPolygon` inside/outside cases; safety score heuristic thresholds.
- Component (RTL): Safety gauge color bands; panic button long-press behavior; QR generator renders expected payload.
- Offline drills: DevTools offline mode → dashboard loads, Panic triggers QR path (no API call), blockchain logging still works.

## Implementation Checklist (actionable)

- [ ] Add dependencies: @reduxjs/toolkit, react-redux, recharts, react-gauge-chart, qrcode.react, @yudiel/react-qr-scanner, idb, vite-plugin-pwa, react-router-dom.
- [ ] Enforce TS strictness; add `npm run typecheck` script if desired.
- [ ] Implement `src/utils/crypto.ts` (Web Crypto) and `src/lib/blockchain.ts` (Block/Blockchain classes) with IndexedDB persistence.
- [ ] Build Redux slices/store and wire UI components (gauge, trend, blockchain viewer, panic FAB) via selectors.
- [ ] Add service worker via vite-plugin-pwa and manifest with install icons.
- [ ] Create IdentityQR + QRScanner components with compact payloads and error handling.
- [ ] Implement offline geofence math and triggers; add notifications and log entries.
- [ ] Write Vitest coverage for blockchain, geo, DSS; run offline drills.

## Appendix: Web Crypto SHA-256 Reference

```typescript
// src/utils/crypto.ts
export async function sha256(message: string): Promise<string> {
  const msg = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msg);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

Use this helper inside Block.calculateHash to keep hashing native and non-blocking.
