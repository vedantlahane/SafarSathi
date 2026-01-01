# Frontend Build Plan (Static-First)

This plan guides the static-only implementation of the Proactive Tourist Safety frontend before any backend wiring. It is optimized for offline/demo scenarios and uses deterministic mock data.

## Goals
- Render core UX on static data: dashboard (DSS gauge + trend), map overlays, identity QR, panic UI, blockchain log view.
- Keep architecture ready for Redux Toolkit, PWA, and service integrations later.
- Maintain clear folder structure and typed mocks to swap with APIs later.

## Scope (this phase)
- Static datasets only: existing JSON overlays plus mock modules.
- No network calls; panic flow stays local (modal + static payload).
- Optional: wire a minimal Redux store with preloadedState from mocks, or import mocks directly during this pass.

## Proposed Folder Structure
```
src/
├── components/
│   ├── ui/                  # button, card, tabs, toast shell, gauge wrapper
│   ├── dashboard/           # SafetyScoreGauge, SafetyTrend, BiometricsChips
│   ├── identity/            # IdentityQR (static), QRScanner stub view
│   ├── blockchain/          # BlockchainLogViewer (static blocks)
│   └── panic/               # PanicButton FAB + modal
├── features/                # Screen-level modules
│   ├── home/                # Dashboard assembly
│   ├── map/                 # Map screen assembly
│   ├── identity/            # Identity screen assembly
│   └── settings/            # Settings stub
├── hooks/                   # useBiometricSimulation (mock-driven), useGeoLocation (optional)
├── lib/                     # blockchain model, geo math, safety engine (static-friendly)
├── mocks/                   # static data sources
│   ├── biometrics.ts        # snapshots + time-series for trend
│   ├── dss.ts               # precomputed DSS points
│   ├── blocks.ts            # sample blockchain entries (hashes can be placeholder strings)
│   ├── identity.ts          # static profile for QR payload
│   └── panic.ts             # static panic payload (geo + biometrics)
├── pages/                   # Route/tab entry points
├── store/                   # Redux Toolkit slices (optional this phase)
├── types/                   # shared types (Block, DSSPoint, IdentityPayload, PanicPayload)
└── utils/                   # crypto helper (Web Crypto), formatting
```

## Work Packages (static phase)
1) **Dependencies** (if not already): `npm install @reduxjs/toolkit react-redux recharts react-gauge-chart qrcode.react @yudiel/react-qr-scanner idb`
2) **Types**: add `src/types/index.ts` with `Block`, `DSSPoint`, `BiometricSnapshot`, `IdentityPayload`, `PanicPayload`.
3) **Mocks** (`src/mocks/`):
   - `biometrics.ts`: normal/stress/recovery snapshots; small time-series for trend.
   - `dss.ts`: array of `{ t: number | string, score: number }` for chart.
   - `blocks.ts`: 3–5 block objects with plausible hashes (can be hardcoded strings now).
   - `identity.ts`: `{ uid, bt, ec, t }` for QR.
   - `panic.ts`: `{ location, biometrics, timestamp }` payload for modal display.
4) **Dashboard components**:
   - `SafetyScoreGauge` (react-gauge-chart) with color bands (Green 80–100, Yellow 50–79, Red 0–49).
   - `SafetyTrend` (recharts line) fed by mock DSS.
   - `BiometricsChips` to show heart rate/skin temp/AQI from mock snapshot.
5) **Dashboard screen (`features/home`)**: assemble gauge + trend + biometrics cards using mocks.
6) **Map screen (`features/map`)**: render react-leaflet map centered on Guwahati; plot restricted zones and police markers from `dataSets/*.json`; add legend.
7) **Identity screen**:
   - `IdentityQR` using `QRCodeSVG` with mock identity payload.
   - Scanner stub panel with guidance text (no camera permission needed yet).
8) **Panic UI**:
   - FAB with long-press visual.
   - On trigger, open modal showing static panic payload; no network calls.
9) **Blockchain viewer**: list mock blocks with truncated hashes and a validity badge (assume valid=true for now).
10) **Routing/shell**: keep existing tabbed layout; optionally add react-router later. Ensure mocks are imported where needed.

## Nice-to-Haves (still static)
- Add a small toast component for mock alerts.
- Add a status ribbon for "Offline demo" to signal static mode.

## Out-of-Scope (later phases)
- Live sensors, WebSocket, backend auth/SOS, RTK Query, PWA/service worker wiring.

## Suggested Task Order
1) Create `types/` and `mocks/` files.
2) Build dashboard components (gauge, trend, chips) and wire the Home screen.
3) Finish map overlays from existing JSON.
4) Add Identity QR screen.
5) Add Panic FAB + modal with static payload.
6) Add Blockchain viewer.
7) Polish styling and accessibility for touch targets.

## Checklist
- [ ] Types added
- [ ] Mocks added
- [ ] Dashboard (gauge + trend + chips) renders from mocks
- [ ] Map renders static zones/markers
- [ ] Identity QR renders mock payload
- [ ] Panic modal shows static payload
- [ ] Blockchain viewer shows mock chain
- [ ] Basic styling pass
