# SafarSathi - Tourist Safety PWA

🛡️ **SafarSathi** is a modern Progressive Web Application designed to enhance tourist safety through AI-powered features, real-time monitoring, and emergency assistance.

## ✨ Features

### 🧠 AI-Powered Safety
- Smart safety scoring based on location and time
- Intelligent risk assessment
- Real-time threat detection

### 🆘 Emergency System
- Hold-to-activate SOS button with haptic feedback
- Automatic location sharing
- Emergency contact notifications
- Offline emergency support

### 🗺️ Interactive Map
- Real-time safety zones
- Police station locations
- Safe route recommendations
- Crowd density monitoring
- Admin-managed risk zone geofences with live alerts

### 📱 PWA Features
- Offline functionality
- Push notifications
- Home screen installation
- Cross-platform compatibility

### 🎨 Modern Design
- Glassmorphism UI
- Responsive design
- Dark theme support
- Smooth animations

## 🚀 Tech Stack

### Frontend
- **React** - UI Framework
- **Leaflet.js** - Interactive maps
- **TensorFlow.js** - AI features
- **Service Workers** - PWA functionality

### Styling
- **Modern CSS** with custom properties
- **Glassmorphism** design system
- **Responsive** mobile-first approach

## 📁 Project Structure

```
SafarSathi/
├── frontend/
│   ├── public/
│   │   ├── manifest.json
│   │   └── service-worker.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthContext.js
│   │   │   └── SOSButton.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── MapView.js
│   │   │   └── Register.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── Dashboard.css
│   │   │   ├── Login.css
│   │   │   ├── MapView.css
│   │   │   ├── Register.css
│   │   │   └── SOSButton.css
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backendapi
./mvnw spring-boot:run
```

> The backend uses Spring Boot with MySQL. Ensure the database connection in `backendapi/src/main/resources/application.properties` points to a running MySQL instance before starting the server.

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
- Client-side encryption for sensitive data
- Secure session management
- Input validation and sanitization
- HTTPS enforcement

## 🌐 Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing
This project was developed for a hackathon. Contributions are welcome!

## 📄 License
This project is licensed under the MIT License.

## 👥 Team
Developed by Team SafarSathi for the Hackathon 2025

---

**SafarSathi** - Making tourism safer, one journey at a time! 🌟