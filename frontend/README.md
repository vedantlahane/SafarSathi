# YatraX Client HUD (React Frontend) 🚀

A mobile-first, high-fidelity React 19 application designed to act as a real-time safety companion for tourists. Built with state-of-the-art UI principles, featuring rich glassmorphism HUD overlays, smooth Framer Motion transitions, and fully responsive map controls.

---

## 🛠️ Technology Stack

- **Core Framework**: React 19 (compiled)
- **Build Server**: Vite 7
- **Styling**: TailwindCSS & custom Vanilla CSS configurations
- **Interactive Maps**: Mapbox GL JS via `react-map-gl`
- **Data Queries**: TanStack Query (React Query) for optimized state caching
- **Animations**: Framer Motion (micro-animations, smooth panel expansions, pulse states)
- **Icons**: Lucide React

---

## 🎨 Design & Interaction Systems

- **Semantic Over Numeric**: Safety metrics focus on actionable words and colors (e.g., "Safe", "Caution", "Elevated Risk") instead of anxiety-inducing bare numbers, preventing the *School Grade Fallacy*.
- **Glassmorphism Design**: Layout panels leverage translucent layers (`backdrop-blur-xl bg-white/70`) with soft drop shadows and thin borders to overlay cleanly on maps.
- **Coordinate Drift Stabilization**: Home page safety evaluation query keys round latitude and longitude to **3 decimal places** (approx. 110m). This stops tiny GPS drifts from triggering redundant API requests.
- **Smart Polling**: Automatic polling requests refresh background safety stats once every **5 minutes** (`300_000` ms) to preserve device battery and server resources.

---

## 📦 Directory Structure

```text
frontend/
├── public/                 # PWA manifests, icons, and static assets
└── src/
    ├── components/         # Shadcn-based primitive components & custom UI cards
    ├── layout/             # Responsive tab layouts (User and Admin panels)
    ├── lib/                # API Axios instances and auth/session helpers
    └── pages/
        ├── admin/          # Control center (alerts log, advisories manager, broadcasts)
        └── user/
            ├── home/       # Main feed dashboard (Safety Score Hero, dynamic alerts list)
            └── map/        # Interactive HUD Mapbox with active layers & polygon risk zones
```

---

## 🚀 Setup and Development

### 1. Environment Configuration (`.env`)
Create a `.env` file in the root of the `frontend/` directory:

```env
VITE_MAPBOX_ACCESS_TOKEN="your-mapbox-access-token"
```

### 2. Installation
Navigate to the folder and install dependencies:

```bash
# Navigate to the frontend folder
cd frontend

# Install package packages
npm install
```

### 3. Running Locally
Run the Vite development server:

```bash
npm run dev
```
- The local client will be available at **`http://localhost:5173`**.
- Vite features a built-in proxy configuration (`vite.config.ts`) that forwards `/api/*` and WebSocket traffic directly to the local backend gateway at `http://localhost:8081`.

### 4. Build & Production
To generate a production-optimized build:

```bash
npm run build
```
The compiled output is compiled into the `dist/` directory, ready to deploy.
