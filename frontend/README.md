# YatraX Frontend 🚀

A premium, modern React application serving as a real-time safe travel companion. Built with visual excellence in mind, utilizing high-quality styling, glassmorphism, responsive components, and smooth micro-animations.

---

## 🛠️ Technology Stack

- **Core Framework**: React 19 (utilizing the new React Compiler)
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS & custom Vanilla CSS configurations
- **Animations**: Framer Motion (for smooth HUD expansions, list transitions, and pulsing indicator scales)
- **Map Engine**: Mapbox GL JS via `react-map-gl`
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **PWA (Progressive Web App)**: Service Worker and manifest integrated for offline capabilities

---

## 📦 Directory Structure

```
frontend/
├── public/                 # Static assets (PWA icons, manifest)
└── src/
    ├── components/         # Shared UI components (Glass cards, alerts, pull-to-refresh)
    ├── lib/                # Shared utilities, state store, session logic, API client
    └── pages/
        └── user/
            ├── home/       # Dashboard, Safety Score Hero card, alerts list
            └── map/        # Interactive HUD map, custom Layers controllers
```

---

## 🚀 Setup and Development

### Prerequisites
Make sure you have Node.js (version 20+ recommended) installed.

### Installation
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Running Locally
To launch the Vite development server:
```bash
npm run dev
```
The application will start on **`http://localhost:5173`**. It includes a built-in proxy in `vite.config.ts` to redirect `/api/*` and `/ws-connect` traffic to the Node backend at `http://localhost:8081`.

### Production Build
To compile the application (includes PWA service worker generation):
```bash
npm run build
```

---

## 🎨 Aesthetic Design Principles

- **Glassmorphism**: Translucent panels featuring `backdrop-blur-xl`, balanced `bg-white/70` overlays, and premium border micro-highlights.
- **Dynamic HUD**: Map controls, destination cards, and nearest facilities widgets animate on mount and respond cleanly to gestures.
- **Status Indicators**: Safety score colors are dynamically driven by risk values, shifting smoothly from Forest Green (`Low Risk`) to Amber (`Caution`) and Vibrant Red (`High Danger`).
