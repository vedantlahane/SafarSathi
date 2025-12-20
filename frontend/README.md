# SafarSathi Frontend (Research Prototype)

Mobile-first frontend for SafarSathi, an Integrated IoT-Based System for Proactive Tourist Safety. Built to demo offline edge logic, simulated biometrics, and dynamic risk scoring for research.

## 🛠 Tech Stack

- Framework: React 19 (Vite 7)
- Language: TypeScript 5.9
- Styling: Tailwind CSS 4
- Maps: React-Leaflet 5 + Leaflet (OpenStreetMap)
- State Management: Zustand (planned for Phase 2)
- Geospatial Logic: Turf.js (planned for Phase 1)
- PWA: Vite PWA Plugin (planned for Phase 1)

## 🚀 Quick Start

```bash
npm install
npm run dev
# build
npm run build
```

## 📂 Project Structure

```
src/
├── assets/              # Static assets
├── components/
│   ├── ui/              # Primitives (button, card, tabs)
│   └── simulation/      # Dev console for biometric sliders (planned)
├── layout/              # Main mobile layout (UserLayout.tsx)
├── lib/                 # Utilities (cn, future geospatial helpers)
├── pages/               # Screens (Home, Map, Identity, Settings)
└── store/               # Global state (planned: user location, biometrics)

dataSets/                # JSON overlays (Assam restricted zones, police stations)
```

## 🧭 Current Implementation

- Entry: src/main.tsx mounts src/App.tsx inside StrictMode.
- Shell: src/layout/UserLayout.tsx renders Radix Tabs (Home, Map, Identity, Settings) with desktop top bar + mobile bottom bar; single-page, no React Router.
- Home: src/pages/Home.tsx shows a static safety card and a mock SOS button using navigator.geolocation; alerts are local state only.
- Map: src/pages/Map.tsx centers on Guwahati; renders circles/markers from dataSets/assamRistrictedAreas.json and dataSets/assamPoliceStations.json; includes Nominatim search and locate-me; custom police divIcon.
- Identity / Settings: src/pages/Identity.tsx and src/pages/Settings.tsx are placeholders.
- UI kit: src/components/ui for button/card/tabs; icons from lucide-react.
- Styling: Tailwind 4 utility classes; globals in src/index.css.
- Data & network: No backend/API integration yet; all data is static/local. No auth, persistence, or WebSocket client.

## 🔍 Detailed Frontend Outline (Living Map)

- Layout & navigation
  - Single-page tabbed shell (Radix Tabs) for mobile; desktop shows top tabs.
  - No client-side routing yet; state is preserved per tab session.
- Pages
  - Home: safety card + local SOS; recent alerts list (in-memory). Planned: dynamic safety score, biometric indicators, incident history.
  - Map: Leaflet canvas with restricted zones (circles) and police markers; search (Nominatim), locate-me; popups for zones/stations. Planned: live position, DSS overlays, filter toggles, offline cache indicator.
  - Identity: placeholder. Planned: digital ID card, QR, blockchain log snippets, verification status.
  - Settings: placeholder. Planned: data export, PWA/offline status, simulation toggles, theme.
- Components
  - UI primitives: button, card, tabs (shadcn-style). Planned additions: badge, toast, gauge, slider, switch, dropdown.
  - Simulation: Dev console (planned) for heart rate, gait, env noise sliders; toggle in layout.
  - Map helpers (planned): risk legend, layer toggles, accuracy ring, mini status bar.
- Data sources
  - Static JSON: dataSets/assamRistrictedAreas.json, dataSets/assamPoliceStations.json.
  - Planned API hooks: auth, SOS, risk zones, dashboard, profile.
  - Storage plan: localStorage for incident logs; optional in-memory store for session state.
- State management
  - Current: local component state only.
  - Planned: Zustand store for user location, geo-fence hits, biometrics, DSS score, alerts feed.
- Styling/theming
  - Tailwind utilities; no design tokens yet. Planned: token map for semantic colors (safe/warn/danger), spacing, radii; dark/light adherence.
- Build & quality
  - Scripts: dev/build/preview/lint. Planned: add type-check script and preflight.
  - Testing (planned): vitest + React Testing Library smoke tests for Home/Map; hook tests for geo-fence and DSS.
- Environments
  - Dev: Vite dev server.
  - Offline goal: PWA caching of assets + dataSets, offline geo-fence checks, cached tiles when possible.

## 🗺️ Development Roadmap (Research Focus)

### Phase 1: Edge Engine (Offline Capabilities)

- [ ] Install geospatial lib: `npm install @turf/turf`
- [ ] Offline geo-fencing hook (src/hooks/useGeoFence.ts):
  - watchPosition for live location
  - turf.booleanPointInPolygon against restricted zones
  - local toast/alert when entering a zone
- [ ] PWA: `npm install vite-plugin-pwa`; cache dataSets/ and assets so geo-checks run in Airplane Mode

### Phase 2: Sensor Simulation (Biometrics)

- [ ] State mgmt: `npm install zustand`
- [ ] Global store (src/store/simulationStore.ts): heartRate, gait (Walking/Running/Fall), envNoise; setters/toggles
- [ ] Dev console (src/components/simulation/DevConsole.tsx): sliders/dropdowns for simulated vitals; toggle in UserLayout

### Phase 3: Dynamic Safety Score (DSS)

- [ ] Helper (src/lib/safetyAlgorithm.ts): Score = 100 - (ZonePenalty + BiometricPenalty); e.g., in-zone (-30) + HR>120 (-20) => 50
- [ ] Home dashboard: replace static card with dynamic gauge; colors Green>80, Yellow 50-79, Red<50

### Phase 4: Data Logging for Research

- [ ] Incident logger: persist alerts to localStorage when score < 50 with timestamp/trigger/lat,lng
- [ ] Export: add Settings action to download logs as CSV for plotting

### Phase 5: Backend Wiring (Optional for paper, useful for demo)

- [ ] Connect auth flows (register/login/profile) to backend APIs
- [ ] Wire SOS and location pings to `/api/action/*`; show confirmations and failures
- [ ] Fetch risk zones from `/api/risk-zones/active`; merge with static overlays as fallback
- [ ] Add error/loading states for API calls; retry/backoff for network loss

### Phase 6: UX Polish & Accessibility

- [ ] Toast system for geo-fence hits, SOS status, offline mode
- [ ] Haptics/vibration cues on SOS (where supported)
- [ ] Focus states, keyboard support on desktop; sufficient contrast for gauges and alerts
- [ ] Motion: subtle transitions for tab changes and marker popups

### Phase 7: Testing & Validation

- [ ] Unit: safetyAlgorithm, geo-fence hook (with mocked coords/zones)
- [ ] Component: Home (gauge thresholds), Map (renders zones/markers, search fly-to), Simulation console (state updates)
- [ ] E2E (optional): basic tab navigation and SOS happy path with Playwright/Cypress

## 📝 Implementation Snippets

### Offline Geo-Fencing (draft)

```typescript
import { useEffect } from "react";
import * as turf from "@turf/turf";
import zones from "../dataSets/assamRistrictedAreas.json";

export const useGeoFence = (userLocation: [number, number] | null) => {
  useEffect(() => {
    if (!userLocation) return;

    const point = turf.point([userLocation[1], userLocation[0]]); // lng, lat

    zones.restrictedZones.forEach((zone) => {
      const circle = turf.circle([zone.position[1], zone.position[0]], zone.radius / 1000, { units: "kilometers" });
      const inside = turf.booleanPointInPolygon(point, circle);
      if (inside) {
        alert(`WARNING: You have entered ${zone.name}`);
        // TODO: trigger global alert state
      }
    });
  }, [userLocation]);
};
```

### Simulation Store (draft)

```typescript
import { create } from "zustand";

type SimState = {
  heartRate: number;
  gait: "Walking" | "Running" | "Fall";
  envNoise: number;
  setHeartRate: (hr: number) => void;
  setGait: (g: SimState["gait"]) => void;
  setEnvNoise: (n: number) => void;
};

export const useSimStore = create<SimState>((set) => ({
  heartRate: 75,
  gait: "Walking",
  envNoise: 20,
  setHeartRate: (hr) => set({ heartRate: hr }),
  setGait: (g) => set({ gait: g }),
  setEnvNoise: (n) => set({ envNoise: n }),
}));
```

## 🎨 Styling Notes

- Use bg-destructive for panic states; bg-primary for safe states.
- Keep touch targets ≥44px for mobile.
- Tabs and cards rely on shadcn-style primitives; remain mobile-first.

## ⚠️ Known Issues / WIP

- Auth and backend calls are not wired; data is static.
- Map tiles need connectivity unless cached via PWA.
- No persistence beyond localStorage in planned logging phase.
