# YatraX Master Gateway & Aggregator (Node.js Backend) ⚙️

The central API gateway and orchestration engine for the YatraX travel safety ecosystem. This Node.js service aggregates intelligence from the Python ML service, live weather/air quality APIs, and GIS databases to evaluate safety indexes in milliseconds.

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (>=24) with `tsx` execution
- **Framework**: Express (v5.2)
- **Database & ORM**: Drizzle ORM + PostgresJS (connecting to Supabase Postgres with PostGIS)
- **Caching & Rate Limiting**: Upstash Redis via `ioredis`
- **Realtime Comm**: `ws` (WebSockets)
- **Validation**: Zod (strict runtime input verification)
- **Logging**: Pino + `pino-pretty`

---

## 🏛️ Safety Synthesis Engine

When a coordinate check is requested at `GET /api/v1/safety/check`, the gateway initiates the **Synthesis Equation**:

$$\text{Danger Index} = \max(\text{ML Anomaly}, \text{AQI Index}) + \text{IMD Weather Penalty}$$

1. **Geospatial ML**: Pings the FastAPI service. Looks up village-level anomaly scores and nightlight levels. If out of bounds or down, it automatically invokes local safety heuristic fail-safes.
2. **Air Quality (AQI)**: Queries the Open-Meteo API. Maps PM10 and PM2.5 to a 0-5 scale.
3. **Indian Gov IMD Weather Warnings**: Uses an automated OAuth token manager to fetch weather alerts from the IMD API. Flags warning codes (Yellow/Orange/Red) to increment the penalty.

---

## 📦 Directory Structure

```text
backend/
├── data/                   # JSON config files and seed data
└── src/
    ├── app.ts              # Express application configuration
    ├── server.ts           # HTTP & WebSocket server launch entrypoint
    ├── seed-admin.ts       # Database seed file for admin & test tourist accounts
    ├── seed-osm.ts        # OpenStreetMap import pipeline script
    ├── modules/
    │   ├── alert/          # Active SOS incident handling
    │   ├── auth/           # Jwt-based authentication and digital ID verification
    │   ├── dashboard/      # Tourist and Admin summary widgets
    │   ├── police/         # Police station lookup and admin registrations
    │   ├── risk-zone/      # Geofenced polygonal danger zones
    │   └── safety/         # The core safety synthesis engine
    └── shared/             # Cache wrappers, db clients, and logging
```

---

## 🚀 Setup and Development

### 1. Environment Configuration (`.env`)
Create a `.env` file in the root of the `backend/` directory:

```env
NODE_ENV=development
PORT=8081
LOG_LEVEL=info

# Database & Cache
DATABASE_URL="postgresql://postgres:password@host:5432/db?sslmode=require"
REDIS_URL="rediss://default:password@host.upstash.io:6379"

# Security
JWT_SECRET="use-a-secure-32-char-string-key"
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173

# Microservice Integrations
ML_API_URL=http://localhost:8000
ML_API_TIMEOUT_MS=2500
```

### 2. Installation & Run
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Seed the database (creates Jalandhar admin & test tourist accounts)
npx tsx src/seed-admin.ts

# Boot dev server with hot-reload
npm run dev
```
The server will run on **`http://localhost:8081`**.

### 3. Database Operations
```bash
# Generate schema migrations
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle UI studio
npm run db:studio
```

---

## 🧪 Integration Tests
The project features a comprehensive PowerShell endpoint verification suite. To run it:
```powershell
powershell ./test-all.ps1
```
This tests all 29 core endpoints (auth, alerts, dashboards, safety check, and admin scopes) verifying correct router responses.