# SafarSathi Frontend

SafarSathi delivers a Smart Tourist Safety experience powered by AI insights, blockchain-based identity, geo-fencing, and opt-in IoT tracking. The frontend is built with **React 19 + Vite** and mocks the full digital ecosystem described in the product blueprint.

## ✨ Feature Highlights

- **Digital Tourist ID** — Blockchain-backed identity card with QR verification, validity window, and secure download/share actions.
- **Traveller Dashboard** — Multilingual UX with live safety score, geo-fence posture, itinerary preview, IoT wearable health, and hold-to-activate SOS button.
- **Safety Center** — AI anomaly feed, geo-fence alerts, tracking preference toggles, and voice assistance for elders or differently abled travellers.
- **Command & Control (Admin)** — Alert triage, live mission map, and automated E-FIR drafts wired to the mocked backend services.
- **Mocked Services Layer** — `src/services/mockApi.js` simulates blockchain logs, anomaly detection, itinerary data, IoT signals, and preference updates.

## 🗺️ Frontend Surface

| Route | Purpose |
|-------|---------|
| `/register`, `/login` | Traveller onboarding with OCR-ready KYC form (mocked) |
| `/dashboard` | Real-time traveller home with safety stats, quick actions, and SOS |
| `/map` | Leaflet map with AI safety scoring, incident overlays, and tracking controls |
| `/id` | Digital ID wallet: QR verification, blockchain log review, privacy notes |
| `/safety` | Safety Center: anomaly triage, geo-fence alerts, tracking toggles, voice assist |
| `/admin/*` | Authority console: dashboards, alerts, live map, automated e-FIR generation |

## 🌐 Multilingual Support

Internationalisation is handled via **i18next** with auto language detection. The UI ships with English plus four Indian languages (Hindi, Assamese, Bengali, Tamil). Extend translations by editing `src/services/i18n.js` and referencing keys through `useTranslation()`.

## 🧰 Project Structure

- `src/services/TouristDataContext.jsx` — React context that hydrates traveller data, anomalies, and preferences from the mock API and exposes helper actions.
- `src/services/mockApi.js` — Centralised mocks for profiles, itinerary, AI events, IoT metrics, blockchain trails, and e-FIR drafting.
- `src/components/` — Feature widgets including `DigitalIDCard`, `TrackingPreferences`, `VoiceAssistance`, and admin `EFIRGenerator`.
- `src/pages/` — Route-level screens split between traveller and admin workspaces.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

The dev server launches on [http://localhost:5173](http://localhost:5173). Traveller and admin flows reuse the same mocked backend context; no additional services are required.

## ✅ Quality Gates

Run lint/build before committing changes:

```bash
npm run lint
npm run build
```

## 📦 Tech Stack

- React 19, React Router v7, Framer Motion, React Leaflet
- React Toastify for notifications
- React QR Code & html-to-image for digital ID exports
- Day.js (with relative time) for human-friendly timestamps
- i18next + browser language detector for localisation

Feel free to plug a real backend underneath the `mockApi` layer once the server-side services are ready.
