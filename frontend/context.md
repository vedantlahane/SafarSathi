# YatraX Frontend — Context Document
> Use this file to understand the frontend architecture for creating flowcharts, diagrams, and presentations.

---

## 1. Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | TailwindCSS v4 + Vanilla CSS (glassmorphism, oklch colors) |
| Routing | React Router v7 (BrowserRouter) |
| Server State | TanStack React Query v5 |
| Global UI State | Custom Observable Store (hand-rolled, NOT Zustand) |
| Session/Auth | Custom `useSyncExternalStore` store (localStorage/sessionStorage) |
| Animations | Framer Motion v12 (`motion/react`) |
| Map Engine | Mapbox GL JS v3 via `react-map-gl` v8 |
| Geofencing | RBush (R-Tree) + Turf.js (Polygon + Distance) |
| Forms | React Hook Form + Zod validation |
| HTTP Client | Axios (wrapped in typed `request<T>()` helper) |
| WebSocket | Native browser `WebSocket` API (room-based pub/sub) |
| PWA | vite-plugin-pwa (autoUpdate, NetworkOnly for /api) |
| Charts | Recharts + Nivo Radar |
| QR Code | qrcode.react |
| Biometrics | @simplewebauthn/browser |
| Push Notif | @capacitor/push-notifications (future native support) |

---

## 2. Application Structure (Directory Tree)

```
frontend/src/
├── main.tsx                  # Entry point, QueryClient provider, BrowserRouter
├── App.tsx                   # Root routes (UserLayout + AdminLayout)
│
├── layouts/
│   ├── user/
│   │   ├── UserLayout.tsx    # Shell: ThemeProvider → SOSProvider → StatusBar → Outlet → BottomNav → SOSBall → Onboarding
│   │   └── components/
│   │       ├── bottom-nav.tsx        # 4-tab bottom navigation (home/map/identity/settings)
│   │       ├── status-bar.tsx        # Top status bar (online/offline, battery)
│   │       └── gradient-mesh-bg.tsx  # Animated gradient background (shifts with safety score)
│   └── admin/
│       └── AdminLayout.tsx   # Admin shell with sidebar
│
├── pages/
│   ├── user/
│   │   ├── home/             # Safety dashboard
│   │   ├── map/              # Live map with risk zones and routing
│   │   ├── ID/               # Digital tourist identity card
│   │   ├── settings/         # Profile, preferences, auth
│   │   ├── onboarding/       # First-launch wizard
│   │   └── auth/             # Login/Register forms
│   └── admin/
│       ├── sections/         # Dashboard, Alerts, Tourists, Zones, Police sections
│       └── dialogs/          # Create/Edit/Delete dialogs
│
├── components/
│   ├── ui/                   # Reusable UI primitives (shadcn-style)
│   └── sos/                  # SOS ball, overlays, countdown
│
└── lib/
    ├── api/                  # All HTTP + WebSocket calls
    │   ├── client.ts         # Axios instance with auth interceptor
    │   ├── tourist.ts        # Tourist/Auth/SOS endpoints
    │   ├── public.ts         # Public endpoints (zones, hospitals, POIs, safety)
    │   ├── admin.ts          # Admin-only endpoints
    │   ├── notifications.ts  # Notification endpoints
    │   └── websocket.ts      # WebSocket client + types
    ├── geofence.ts           # GeofenceEngine (RBush + Turf)
    ├── geo.ts                # haversineMeters(), createCirclePolygon()
    ├── session.ts            # Tourist session store (localStorage)
    └── store/
        ├── app-state.ts      # AppState observable (isOnline, emergencyMode, etc.)
        ├── user-prefs.ts     # UserPrefs observable (GPS, notifications, privacy)
        └── index.ts          # hapticFeedback() helper
```

---

## 3. Routing Map

```
/ (BrowserRouter)
│
├── /  ──→  <UserLayout>         # Tourist-facing shell
│   ├── index ──→ redirect /home
│   ├── /home      ──→ <Home>
│   ├── /map       ──→ <Map>
│   ├── /identity  ──→ <Identity>
│   └── /settings  ──→ <Settings>
│            └── (no session) → renders <Auth> inline
│
└── /admin/*  ──→  <AdminLayout>  # Police/Admin shell
    ├── /admin/login
    ├── /admin/dashboard
    ├── /admin/alerts
    ├── /admin/tourists
    ├── /admin/zones
    └── /admin/police
```

**Navigation Event (programmatic)**:
Components that need to switch tabs dispatch a custom DOM event:
```typescript
window.dispatchEvent(new CustomEvent("yatrax:navigate-tab", { detail: { tab: "settings" } }))
// Caught by UserLayout → calls navigate("/settings")
```

---

## 4. Page Breakdown

### 4.1 Home Page (`/home`)
**Purpose**: Central safety dashboard showing real-time safety status, alerts, and quick actions.

**Component Tree**:
```
Home
├── OfflineBanner              (shown if !isOnline)
├── HomeHeader
│   ├── AvatarFallback         (user initials)
│   ├── BellIcon + Badge       (unread count)
│   └── NotificationSheet      (slide-in list of all notifications)
├── SafetyScoreHero
│   ├── AI Travel Safety label (Sparkles icon)
│   ├── Safety Score ring      (SVG circle gauge, 0-100)
│   ├── Risk state label       (Safe Travel Zone / Caution Required / High Danger)
│   ├── Danger Score badge
│   ├── Smart Guidance block   (AI recommendation text)
│   └── FactorCards           (grid of weighted risk factors)
├── QuickActions
│   ├── Share Location button  (postLocation → /api/action/location/:id)
│   ├── View Map button        (navigates to /map)
│   └── Emergency Contacts     (opens contact sheet)
├── EmergencyStrip             (5 tap-to-call buttons: Police 100, Ambulance 108, Fire 101, Women 181, Tourist 1363)
├── BroadcastList              (admin broadcasts, real-time via WebSocket)
├── AdvisoryList               (travel advisories by severity)
├── AlertList                  (personal alerts with AlertDetailSheet)
└── DailyTip                   (rotating safety tips)
```

**Data Hooks**:
- `useDashboard()` — fetches `TouristDashboard` every 5 min, connects WebSocket to `tourist:<id>` room
- `useLocationShare()` — manual location share button logic
- `useNotifications(alerts)` — local notification unread state

**WebSocket events handled**:
- `ALERT` → prepend to alerts list + toast
- `BROADCAST` → prepend to broadcasts + toast (8s)
- `ADVISORY_CREATED` → prepend to advisories + toast (10s)
- `SCORE_UPDATE` → update safety score + toast if drops >10 points

---

### 4.2 Map Page (`/map`)
**Purpose**: Live interactive map with risk zone overlays, routing, and nearby resources.

**Component Tree**:
```
Map
├── HighRiskAlert              (inline alert if AI danger score > 0.75, auto-dismisses 8s)
├── MapView                   (Mapbox GL JS map)
│   ├── FlyToLocation         (programmatic camera animation)
│   ├── Source: mapbox-dem    (3D terrain raster-dem)
│   ├── Layer: sky            (atmospheric sky rendering)
│   ├── Source: traffic       (Mapbox traffic vector tiles)
│   ├── NavigationControl     (zoom +/-, compass with visualizePitch=true, drag to tilt/rotate)
│   ├── GeolocateControl      (track user location)
│   ├── ScaleControl          (distance scale bar)
│   ├── ZoneOverlay           (GeoJSON fill+line layers for risk zones, color-coded by severity)
│   ├── IsochroneOverlay      (travel-time isochrone around user)
│   ├── StationMarkers        (police station custom markers)
│   ├── HospitalMarkers       (hospital markers)
│   ├── TouristPOIMarkers     (14 POI types: gurudwara, temple, fort, museum, etc.)
│   ├── RouteLines            (safe route polylines: green=safest, blue=fastest, gray=other)
│   ├── UserMarker            (animated heading indicator)
│   ├── DestinationMarker     (drop pin)
│   ├── SearchControl         (geocoded search via Mapbox API)
│   └── StatsPill             (live GPS stats: speed, accuracy, heading)
├── MapOverlays
│   ├── NavigationHeader      (turn-by-turn status bar)
│   ├── RouteInfoPanel        (route comparison: safest vs fastest)
│   ├── ArrivalBanner
│   └── RouteDeviationAlert
├── LayersSheet               (bottom sheet: toggle zones/police/hospitals/POIs/routes + Mapbox config)
└── ZoneDialog                (detail dialog on zone tap)
```

**Data Hooks**:
- `useMapData()` — GPS tracking (`watchPosition`), fetches zones/stations/hospitals/POIs via React Query, runs GeofenceEngine on every GPS update, manages layer visibility
- `useMapNavigation()` — destination setting, Mapbox Directions API for route alternatives, route safety scoring
- `useNavigation()` — active navigation state machine (deviation detection, arrival detection)
- `useMatrixRouting()` — Mapbox Matrix API for road-time ETA to nearest station/hospital

**Map Configuration**:
- Default center: LPU Phagwara [31.2554, 75.7048]
- Default pitch: 65° (3D view)
- Default bearing: -17°
- Max bounds: Punjab [73.5,29.3] → [77.0,32.5]
- Map style: `mapbox://styles/mapbox/standard`
- Mapbox Standard config: 3D buildings, light preset (day/dusk/dawn/night), traffic, POI labels
- Terrain: `mapbox-dem` raster-DEM, exaggeration 1.5×

---

### 4.3 Identity Page (`/identity`)
**Purpose**: Digital tourist ID card with QR code for emergency verification by police.

**Component Tree**:
```
Identity
├── (no session) → IDEmptyState    (CTA to go to Settings)
├── (loading) → IDSkeleton
└── IDCard
    ├── IDCardFlip               (CSS 3D flip animation, also responds to device tilt via DeviceOrientationEvent)
    │   ├── IDCardFront          (Name, nationality, travel type, avatar, idHash badge, safety score)
    │   └── IDCardBack           (QR code encoding /api/admin/id/verify?hash=<idHash>, passport partial, validity)
    ├── IDQuickActions
    │   ├── Share button         (navigator.share or clipboard copy)
    │   └── View Details button
    └── IDDetailsSheet           (full profile: blood type, allergies, emergency contact, medical conditions)
```

**Hook**: `useIdentity()` — fetches profile via React Query `["touristProfile", touristId]`

---

### 4.4 Settings Page (`/settings`)
**Purpose**: Profile management, preferences, and authentication.

**When logged out**: renders `<Auth />` (login/register/forgot-password inline)

**Component Tree (logged in)**:
```
Settings → LoggedInView
├── SettingsHeader             (name, email, avatar)
├── EmergencyProfile           (blood type, allergies, emergency contact — editable sheets)
├── NotificationSettings       (push notifications, alert sounds, vibration, quiet hours toggles)
├── PrivacySettings            (location sharing, high-accuracy GPS, anonymous data)
├── ThemeSelector              (light/dark/system)
├── LanguageSelector
├── AboutSection               (app version)
└── DangerZone                 (logout + delete account)
```

---

### 4.5 Onboarding Wizard
**Purpose**: First-launch experience, shown as full-screen overlay (z-[60]).

**5 Steps**:
```
Step 0: SplashScreen           (Logo + tagline + "Loading safety setup…" pulse)
Step 1: PermissionStep         (Request location + notification permissions)
Step 2: FeatureSlides          (3 feature slides: Safety Score / SOS Ball / Safe Routes)
Step 3: SOSTutorial            (Interactive demo of SOS long-press + swipe gesture)
Step 4: GetStarted             (Continue as Guest OR Sign In → navigates to /settings)
```

**Completion**: stored in localStorage (`yatrax-onboarding-complete`), never shown again.

---

### 4.6 Authentication (`<Auth />`)
**Modes**: `"login"` | `"register"` | `"success"`

**Register (3 steps)**:
1. Account Info: name, email, password, phone
2. Identity: nationality, passport number, gender, DOB, address, travel type
3. Emergency & Health: emergency contact, blood type, allergies, medical conditions

**Post-register**: Shows `AuthSuccess` with QR code → prompts biometric enrollment

**Login**: email + password → optional biometric (`@simplewebauthn/browser`)

---

### 4.7 Admin Panel (`/admin/*`)
**Purpose**: Police department control panel.

**5 Sections**:
| Section | Description |
|---|---|
| Dashboard | Stats cards + active alerts table + tourists overview |
| Alerts | Full list with bulk-resolve, search, status filters |
| Tourists | List with safety scores, active SOS flags, contact/track actions |
| Zones | Risk zone CRUD on map (circle draw + polygon draw modes) |
| Police | Police department CRUD |

**Real-time**: `useAdminWS()` connects to WebSocket `admin` room → `ALERT` events prepended live to alerts list

---

## 5. State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       STATE LAYER                               │
│                                                                 │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │   TanStack Query    │    │  Custom Observable Stores    │    │
│  │   (Server State)    │    │  (UI / Session State)        │    │
│  │                     │    │                              │    │
│  │  - Dashboard data   │    │  appStore: AppState          │    │
│  │  - Risk zones       │    │    isOnline, emergencyMode   │    │
│  │  - Police stations  │    │    currentLocation           │    │
│  │  - Hospitals        │    │                              │    │
│  │  - Tourist POIs     │    │  sessionStore: TouristSession│    │
│  │  - Profile          │    │    touristId, token, name    │    │
│  │  - Safety score     │    │                              │    │
│  │  - Map routes       │    │  userPrefs: UserPrefs        │    │
│  │                     │    │    locationSharing, gps, etc │    │
│  │  staleTime: 5min    │    │                              │    │
│  │  gcTime: 10min      │    │  adminSessionStore           │    │
│  │  retry: 1           │    │    adminId, token, dept      │    │
│  └─────────────────────┘    └──────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────┐                                        │
│  │   React Context     │                                        │
│  │   (SOSContext)      │                                        │
│  │                     │                                        │
│  │  phase: SOSPhase    │                                        │
│  │  position, countdown│                                        │
│  │  activeAlertId      │                                        │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API Calls Reference

### Public Endpoints (no auth)
| Function | Method | Endpoint | Used In |
|---|---|---|---|
| `fetchPublicRiskZones()` | GET | `/api/risk-zones/active` | useMapData |
| `fetchPoliceDepartments()` | GET | `/api/police-stations` | useMapData |
| `fetchHospitals()` | GET | `/api/hospitals` | useMapData |
| `fetchCurrentAdvisories()` | GET | `/api/advisories/current` | useDashboard |
| `fetchRealTimeSafety(lat, lon)` | POST | `/api/v1/safety/evaluate` | Home + Map |
| `fetchTouristPOIs(types?)` | GET | `/api/tourist-pois?type=...` | useMapData |

### Tourist Auth Endpoints
| Function | Method | Endpoint |
|---|---|---|
| `registerTourist(payload)` | POST | `/api/auth/register` |
| `loginTourist(payload)` | POST | `/api/auth/login` |
| `fetchTouristProfile(id)` | GET | `/api/auth/profile/:id` |
| `updateTouristProfile(id, data)` | PUT | `/api/auth/profile/:id` |
| `deleteAccount(id)` | DELETE | `/api/auth/profile/:id` |
| `requestPasswordReset(email)` | POST | `/api/auth/password-reset/request` |
| `confirmPasswordReset(token, pw)` | POST | `/api/auth/password-reset/confirm` |

### SOS / Location / Alert Endpoints
| Function | Method | Endpoint |
|---|---|---|
| `postLocation(id, payload)` | POST | `/api/action/location/:id` |
| `postSOS(id, payload)` | POST | `/api/action/sos/:id` |
| `postPreAlert(id, payload)` | POST | `/api/action/sos/:id/pre-alert` |
| `cancelSOSAlert(alertId)` | POST | `/api/action/sos/:alertId/cancel` |
| `getSOSAlertStatus(alertId)` | GET | `/api/action/sos/:alertId/status` |

### Dashboard
| Function | Method | Endpoint |
|---|---|---|
| `fetchTouristDashboard(id)` | GET | `/api/tourist/:id/dashboard` |
| `fetchNotifications(id)` | GET | `/api/notifications` |
| `markNotificationRead(id, nId)` | POST | `/api/notifications/:nId/read` |
| `markAllNotificationsRead(id)` | POST | `/api/notifications/read-all` |

### External APIs (called directly from hooks)
| API | Endpoint | Used In |
|---|---|---|
| Mapbox Directions v5 | `https://api.mapbox.com/directions/v5/...` | useMapNavigation |
| Mapbox Matrix v1 | `https://api.mapbox.com/directions-matrix/v1/...` | useMatrixRouting |
| Mapbox Geocoding v5 | `https://api.mapbox.com/geocoding/v5/...` | SearchControl |

---

## 7. Real-Time WebSocket Flow

```
Browser                              Backend (ws://host/ws-connect)
   │                                          │
   │──── WebSocket Connect ──────────────────>│
   │                                          │
   │──── { type: "JOIN", room: "tourist:<id>" }──>│
   │                                          │
   │                                          │  (admin fires SOS update)
   │<─── { type: "ALERT", payload: {...} } ───│
   │   → prepend to alerts, toast warning     │
   │                                          │
   │                                          │  (admin sends broadcast)
   │<─── { type: "BROADCAST", payload: {...}} │
   │   → prepend to broadcasts, toast info    │
   │                                          │
   │                                          │  (cron updates safety score)
   │<─── { type: "SCORE_UPDATE", payload:{} } │
   │   → update SafetyScoreHero ring          │
   │                                          │
   │──── { type: "LEAVE", room: "tourist:<id>"}│  (on component unmount)
```

**Admin WebSocket** uses room `"admin"` and handles `ALERT` events only.

---

## 8. Geofencing System (Client-Side)

```
GPS Update arrives
       │
       ▼
GeofenceEngine.findIntersectingZones(lat, lng)
       │
       ├── Step 1: RBush R-Tree bounding box lookup (O(log N))
       │           → gets candidate zones whose bbox contains the point
       │
       └── Step 2: Exact geometry check
                   ├── Circle zone → Turf.js distance() ≤ radiusMeters
                   └── Polygon zone → Turf.js booleanPointInPolygon()
                          │
                          ▼
                   intersectingZones[]
                          │
                          ▼
               4-second Hysteresis Debounce
               ├── New zone detected? Start enter-timer
               ├── Zone exited? Start exit-timer
               └── Only fire after 4s continuous state
                          │
                          ▼
                   ┌──────────────────┐
                   │  CONFIRMED ENTRY │
                   └──────────────────┘
                          │
                   ┌──────┴──────────────────────┐
                   │  Critical → toast.error(10s)  │
                   │  High     → toast.warning(7s)  │
                   │  Medium   → toast.warning(5s)  │
                   │  All      → hapticFeedback()    │
                   └────────────────────────────────┘
```

**Route Safety Scoring** (in `useMapNavigation`):
```
Route score = 100
  - count(critical intersections) × 50
  - count(high intersections) × 30
  - count(medium intersections) × 15
  - count(low intersections) × 5
  + count(police within 500m) × 10

Routes labeled: isSafest (highest score) | isFastest (lowest duration)
```

---

## 9. SOS System State Machine

```
  ┌──────────────────────────────────────────────────────────────┐
  │                     SOSBall (Floating Widget)                │
  │  - Snaps to left/right screen edge                          │
  │  - Position persisted to localStorage                        │
  │  - Size: normal < caution < danger (scales with risk state)  │
  └──────────────────────────────────────────────────────────────┘

Phase Machine:

  "idle"
    │
    │  (long-press threshold reached)
    ▼
  "long-press"    ←── SOSArrowGuides appear (pointing to screen center)
    │               ←── postPreAlert() fires silently (backend pre-alert)
    │
    │  (swipe inward / upward / downward toward center)
    ▼
  "countdown"     ←── SOSConfirmOverlay shows 3-2-1 countdown
    │               ←── Heavy haptic on each tick
    │
    │  (any tap to cancel)          │
    ├──────────────────────────────>│ "idle" (cancelSOSAlert if already created)
    │
    │  (countdown reaches 0)
    ▼
  "firing"
    │   1. getCurrentPosition() (GPS, 5s timeout)
    │   2. postSOS(touristId, { lat, lng, message })
    │   3. Stores alertId in context
    ▼
  "success"       ←── SOSSuccessScreen (alert ID, location, emergency contacts)
    │
    │  (user dismisses)
    ▼
  "idle"
```

---

## 10. Authentication Flow

```
TOURIST REGISTRATION:
─────────────────────
User → Settings → Auth (register mode)
  Step 1: Account (name, email, password, phone)
  Step 2: Identity (nationality, passport, gender, DOB, address)
  Step 3: Health (emergency contact, blood type, allergies, medical conditions)
     │
     ▼
  POST /api/auth/register
     │
     ▼
  Response: { touristId, token, user, qr_content }
     │
     ▼
  Mode → "success" (shows QR code)
     │
     ├── User clicks "Continue" → saveSession(localStorage)
     └── (optional) biometricRegisterOptions() → biometricRegisterVerify()


TOURIST LOGIN:
──────────────
  POST /api/auth/login  →  saveSession()
  (optional) startAuthentication() → biometricLoginVerify()


ADMIN LOGIN:
────────────
  POST /api/admin/login  →  saveAdminSession(localStorage)
  Token: role="admin", sub=policeDepartment.id


SESSION STORAGE:
────────────────
  localStorage["YatraXSession"]        Tourist session (persistent)
  sessionStorage["YatraXSession:temp"] Tourist session (tab-only, if "remember me" off)
  localStorage["YatraXAdminSession"]   Admin session


API AUTH:
─────────
  Every Axios request: reads session from store → appends Authorization: Bearer <token>
  Admin routes (/api/admin*) prefer admin token, fall back to tourist token
```

---

## 11. Theme System

```
Safety Score → Theme State → CSS Variables → UI Colors

score ≥ 80  →  "safe"    →  oklch(0.65 0.17 160)  [emerald green]
score ≥ 50  →  "caution" →  oklch(0.70 0.15 75)   [amber]
score < 50  →  "danger"  →  oklch(0.60 0.20 25)   [red]

CSS Custom Properties (all animated with 2s transition):
  --theme-primary           (oklch color)
  --theme-glow              (opacity 0.10 variant)
  --theme-bg-from           (gradient start)
  --theme-bg-to             (gradient end)
  --theme-card-bg           (glass card background)
  --theme-card-border       (glass card border)

GradientMeshBackground: 4 animated blobs (60s drift cycle) whose colors shift with theme
```

---

## 12. Location Posting Strategy

Two independent location posting mechanisms run concurrently:

| Mechanism | Interval | Trigger | Endpoint |
|---|---|---|---|
| `useMapData` (Map page) | 15 seconds | GPS watchPosition | POST /api/action/location/:id |
| `useDashboard` (Home page) | 30 seconds | GPS watchPosition | POST /api/action/location/:id |

Both require: user has interacted with page, location permission granted, session exists.
Each call includes: `lat`, `lng`, `accuracy`, `speed`, `heading`.

---

## 13. Key Data Types

```typescript
// Session
TouristSession    { touristId, token?, name?, email?, idHash? }
AdminSession      { adminId, token, name, email, departmentCode, city, district, state }

// Safety
RealTimeSafety    { dangerScore(0-1), recommendation, riskLabel, scanning, factors[], anomaly? }
SafetyFactor      { label, score, trend: "up"|"down"|"stable", detail? }

// Map types
RiskZone          { id, name, shapeType: "circle"|"polygon", centerLat, centerLng, radiusMeters, polygonCoordinates, riskLevel, category, active }
PoliceStation     { id, position[lat,lng], name, contact, available, distance?, eta? }
Hospital          { id, position, name, type, tier, emergency, distance?, eta?, specialties, bedCapacity, availableBeds, ambulanceAvailable }
SafeRoute         { id, coordinates, safetyScore, distanceMeters, durationSeconds, intersections{critical/high/medium/low}, policeNearby, isSafest, isFastest }
TouristPOI        { osmId, name, type(14 types), latitude, longitude, city, district, state }

// Alerts
AlertView         { id, alertType, priority: "critical"|"high"|"medium"|"low", status, message, time }
SOSResponse       { status, alertId }

// Dashboard
TouristDashboard  { profile, safetyScore, status, lastLocation, openAlerts, alerts[], riskZones[], advisories[] }
DashboardData     { safetyScore, status, recommendation, factors, alerts, openAlerts, broadcasts, advisories }
BroadcastView     { title, message, priority, sentAt }
AdvisoryView      { id, title, description, severity, region, issuedAt, expiresAt? }

// Profile
TouristProfile    { id, name, email, phone, passportNumber, DOB, emergencyContact, bloodType, allergies, medicalConditions, safetyScore, idHash, idExpiry }

// User Prefs
UserPrefs         { pushNotifications, alertSounds, vibration, quietHours, locationSharing, highAccuracyGps, anonymousData }

// App State
AppState          { isOnline, isLocationEnabled, currentLocation, emergencyMode }

// SOS Context
SOSPhase          "idle" | "long-press" | "countdown" | "firing" | "success"
SOSPosition       { side: "left"|"right", y: number }

// WebSocket
WSMessageType     "ALERT" | "BROADCAST" | "ADVISORY_CREATED" | "SCORE_UPDATE" | "LOCATION_UPDATE" | "ZONE_ALERT"
```

---

## 14. PWA Configuration

```
Service Worker Strategy:
  /api/*          →  NetworkOnly        (never cached, always live)
  static assets   →  CacheFirst         (precached on install)
  navigation      →  navigateFallback: /index.html (SPA routing)

Manifest:
  name: "YatraX"
  short_name: "YatraX"
  display: "standalone"
  orientation: "portrait"
  start_url: "/"
  theme_color: "#ffffff"
  icons: [192×192 png, 512×512 png, 192×192 maskable svg, 512×512 maskable svg]

Dev mode: service worker disabled + existing SW unregistered on start
```

---

## 15. Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_MAPBOX_TOKEN` | Mapbox GL JS API token (map tiles, directions, geocoding, matrix) |
| `VITE_BACKEND_NODE_URL` | Backend base URL (empty in dev → uses Vite proxy `/api` → `http://localhost:8081`) |

---

## 16. Component Design Patterns

1. **Composition Root Pattern**: `Home` and `Map` pages are intentionally <50 lines with zero logic; all logic lives in custom hooks.

2. **Custom Observable Store**: Instead of Zustand, a hand-rolled `Store<T>` class with `subscribe()` + `useSyncExternalStore()` pattern. Makes stores framework-agnostic and predictable.

3. **React Query for all server state**: Eliminates loading/error boilerplate. Automatic background refetch on focus/interval.

4. **GPS grid snapping**: Safety score queries snap `lat`/`lon` to 2 decimal places (~1.1 km grid) to prevent query storm on GPS micro-updates.

5. **Dual geofence layers**: Client-side (RBush + Turf, real-time zone toasts) AND backend AI scoring (`/api/v1/safety/evaluate`, aggregated risk index).

6. **Fire-and-forget SOS**: SOS success screen shown immediately regardless of API response; backend failure silently swallowed (reliability > accuracy in emergencies).

7. **Mapbox for routing + matrix**: Directions v5 for route alternatives with GeoJSON polylines; Matrix v1 for nearest-station road-time ETA (not straight-line Haversine).
