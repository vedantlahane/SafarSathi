# YatraX Master Aggregator (Node.js Backend) ⚙️

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24-43853D)
![TypeScript](https://img.shields.io/badge/TypeScript-Execute-3178C6)
![Express](https://img.shields.io/badge/Express-v5.0-000000)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-Supabase-3ECF8E)
![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D)

The central gateway and services hub for the SafarSathi / YatraX ecosystem. This Node.js server acts as the **Master Aggregator**, serving API endpoints to the React client, orchestrating the Python Geospatial ML Engine, broadcasting real-time hazard alerts via WebSockets, and caching heavy queries for sub-millisecond response times.

---

## 🏛️ Architectural Context

This backend is designed for **maximum resilience and low latency**. It operates a dual-layer safety evaluation pipeline. When a user drops a pin, the Aggregator concurrently fetches live environmental data, queries the database for crowdsourced hazards, and pings the local Python microservice for machine-learning baseline scores, synthesizing them all into a final 0-10 Danger Index.

---

## 🛠️ Technology Stack

- **Runtime & Execution**: Node.js (>=24), `tsx` (TypeScript Execute)
- **Framework**: Express (v5)
- **Database & ORM**: Drizzle ORM, PostgresJS (Connecting to Supabase)
- **Caching & Rate Limiting**: Redis (via Upstash/ioredis)
- **Realtime Comm**: `ws` (WebSocket Protocol)
- **Schema Validation**: Zod (Type-safe query and payload parsing)
- **Observability**: Pino (High-speed logging, `pino-pretty` in dev)

---

## 📦 Directory Structure

```text
backend/
├── data/                   # Boundary and OSM geo-data configurations
└── src/
    ├── config/             # Environment loader and Zod validation schemas
    ├── modules/
    │   ├── alert/          # Active incident alerts and geofencing triggers
    │   ├── safety/         # The Synthesis Equation and ML routing controllers
    │   └── dashboard/      # Tourist dashboard composition feeds
    ├── shared/
    │   ├── cache/          # Redis connection pool and wrapper
    │   ├── db/             # Drizzle instance and Postgres schema definitions
    │   └── ml/             # Axios client bridging to the Python FastAPI engine
    └── server.ts           # Server initialization and WebSocket attachments
🚀 Setup and Development
1. Environment Configuration (.env)
Create a .env file in the root of the backend/ directory. The application uses Zod to validate these on startup—it will intentionally crash if required keys are missing.

Code snippet
NODE_ENV=development
PORT=8081
LOG_LEVEL=info

# Database & Cache
DATABASE_URL="postgresql://..."
REDIS_URL="rediss://..."

# Security
JWT_SECRET="your-super-secret-key-at-least-32-chars"
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173

# Microservice Integrations
ML_API_URL=http://localhost:8000
ML_API_TIMEOUT_MS=2500
2. Installation & Boot
Install the dependencies and start the TypeScript watch server:

Bash
# Install dependencies
npm install

# Launch development server
npm run dev
The server will bind to http://localhost:8081.

3. Database Management (Drizzle)
Manage your Supabase PostgreSQL schemas directly from the CLI:

Bash
# Generate SQL migrations from TS schemas
npm run db:generate

# Push migrations to the target database
npm run db:migrate

# Launch Drizzle Studio UI to inspect live tables locally
npm run db:studio
⚙️ Core Logic: The Safety Pipeline
The src/modules/safety module is the beating heart of YatraX, executing a strict fallback protocol to guarantee 100% API uptime:

The Fast Path (ML Hook): Coordinates are blasted to the Python ML server (ML_API_URL). If the user is inside Punjab, the engine returns village-level LOF anomaly classifications and VIIRS nightlight infrastructure scores.

The Cache Layer: High-density queries are snapped to a grid coordinate and cached in Redis for 60 seconds, bypassing ML evaluation for trailing vehicles.

The Circuit Breaker (Failover Logic): If the Python engine times out (exceeds 2500ms), throws a 500 error, or returns OUT_OF_BOUNDS, the Aggregator instantly trips the circuit breaker. It falls back to local heuristic scoring (IMD weather warnings, time-of-day math, and crowdsourced database alerts) to ensure the user is never left without a safety metric.