# SafarSathi - Tourist Safety PWA

🛡️ **SafarSathi** is a modern Progressive Web Application designed to enhance tourist safety through AI-powered features, real-time monitoring, blockchain-backed identity, and emergency assistance.

## ✨ Features

### 🧠 AI-Powered Safety
- Smart safety scoring based on location and time
- Intelligent risk assessment and anomaly detection
- Real-time threat detection with geo-fence alerts

### 🆘 Emergency System
- Hold-to-activate SOS button with haptic feedback
- Automatic location sharing
- Emergency contact notifications
- Offline emergency support

### 🪪 Digital Tourist ID
- Blockchain-backed identity card with QR verification
- Secure download and share actions
- Validity tracking and verification status

### 🗺️ Interactive Map
- Real-time safety zones with Leaflet.js
- Police station locations
- Safe route recommendations
- Admin-managed risk zone geofences with live alerts

### 📱 PWA Features
- Offline functionality
- Push notifications
- Home screen installation
- Cross-platform compatibility

### 🌐 Multilingual Support
- i18next-powered internationalisation
- English + Hindi, Assamese, Bengali, Tamil
- Auto language detection

### 🎨 Modern Design
- Glassmorphism UI with Tailwind CSS
- Responsive mobile-first design
- Dark theme support
- Framer Motion animations

## 🚀 Tech Stack

### Frontend
- **React 19** + **Vite 7** - Modern build tooling
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Utility-first styling
- **Leaflet.js / React-Leaflet** - Interactive maps
- **Framer Motion** - Smooth animations
- **i18next** - Internationalisation
- **Tesseract.js** - OCR for ID verification
- **Day.js** - Date/time formatting

### Backend
- **Spring Boot 3.5** - Java REST API
- **Spring Data JPA** - Database access
- **MySQL** - Relational database
- **WebSocket** - Real-time communication
- **Lombok** - Boilerplate reduction

## 📁 Project Structure

```
SafarSathi/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Shared UI widgets
│   │   │   ├── admin/            # Admin-specific components
│   │   │   ├── icons/            # Icon components
│   │   │   ├── layout/           # Layout wrappers
│   │   │   └── navigation/       # Navigation bars
│   │   ├── features/
│   │   │   └── dashboard/        # Dashboard feature module
│   │   │       ├── components/   # Dashboard-specific widgets
│   │   │       └── DashboardPage.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layout/               # App shell components
│   │   ├── mock/                 # Mock data for development
│   │   ├── pages/                # Route-level screens
│   │   │   └── admin/            # Admin console pages
│   │   ├── services/             # API, auth, and context providers
│   │   ├── utils/                # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/safarsathi/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── dataSets/                     # JSON data for police stations, restricted areas
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Java 17
- MySQL 8.x
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

> The backend uses Spring Boot with MySQL. Ensure the database connection in `backend/src/main/resources/application.properties` points to a running MySQL instance before starting the server.

### Admin Risk Zone Management
- Login to the admin console and open **Risk Zones** to create circular geo-fences.
- Each zone defines a center latitude/longitude, radius in meters, and risk level (Low, Medium, High).
- When tourists enter an active zone, their safety score decreases and police alerts are issued in real time.
- The live mission map renders all active zones to visualize restricted belts alongside SOS activity.

## 🎯 Features in Detail

### Authentication System
- Secure user registration and login
- OCR-based ID verification using Tesseract.js
- Session management with local storage

### Safety Monitoring
- Real-time location tracking
- AI-powered safety score calculation
- Time-based risk assessment
- Proximity alerts for unsafe areas

### Emergency Features
- 3-second hold SOS activation
- Visual progress indicator
- Haptic feedback
- Automatic emergency contact notification
- Location sharing capabilities

### Map Integration
- Interactive Leaflet.js maps
- Real-time marker updates
- Safety zone overlays
- Police station markers
- User location tracking

## 🎨 Design System

### Color Palette
- **Primary Teal**: `#0D9488` - Safety and trust
- **Orange Accent**: `#F97316` - Emergency actions
- **Purple Secondary**: `#7C3AED` - Premium features
- **Neutral Grays**: Modern contrast system

### UI Components
- Glassmorphism cards with backdrop blur
- Smooth micro-interactions
- Responsive grid layouts
- Modern typography (Inter font)

## 📱 PWA Features
- Service worker for offline functionality
- Web app manifest for installation
- Push notification support
- Background sync for emergency alerts

## 🔒 Security Features
- Blockchain-backed identity verification
- Secure session management
- Input validation and sanitization
- HTTPS enforcement

## 🌐 Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🗺️ Available Routes

| Route | Purpose |
|-------|---------|
| `/register`, `/login` | Traveller onboarding with OCR-ready KYC form |
| `/dashboard` | Real-time traveller home with safety stats, quick actions, and SOS |
| `/map` | Leaflet map with AI safety scoring and tracking controls |
| `/id` | Digital ID wallet with QR verification and blockchain logs |
| `/safety` | Safety Center: anomaly feed, geo-fence alerts, tracking toggles |
| `/admin/*` | Authority console: dashboards, alerts, live map, e-FIR generation |

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

## 👥 Team
Developed by Team SafarSathi

---

**SafarSathi** - Making tourism safer, one journey at a time! 🌟