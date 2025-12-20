# SafarSathi (current state)

Tourist-safety prototype with a Spring Boot backend and a mobile-first React UI. The notes below reflect the present codebase (December 2025) rather than the earlier vision statements.

## Current scope

- Frontend: React 19 + Vite 7, Tailwind CSS 4, TypeScript. Mobile tabbed layout with Home (mock SOS + safety card), Map (Leaflet rendering Assam restricted zones and police stations from local JSON), and placeholder Identity/Settings screens. No authentication is wired to the backend yet.
- Backend: Spring Boot 3.5.6 on port 8081 with MySQL + JPA. Provides registration/login for tourists, admin login, risk-zone CRUD, SOS/location pings, dashboard aggregates, and public read-only risk zones. WebSocket is present in config but not actively used by the current UI.
- Data: JSON datasets for map overlays and SQL seeds for tourists, police departments, and risk zones.

## Tech stack

- Frontend: React 19, TypeScript, Vite 7, Tailwind CSS 4, React-Leaflet, lucide-react, Radix Tabs.
- Backend: Spring Boot 3.5.6, Spring Web, Spring Data JPA, Validation, WebSocket starter, Lombok, MySQL connector; Java 17.

## Project layout

```
SafarSathi/
├── frontend/              # Vite + React app
│   └── src/
│       ├── pages/         # Home, Map, Identity (stub), Settings (stub)
│       ├── layout/        # Tabbed mobile layout
│       ├── components/ui  # Shadcn-style UI primitives
│       └── assets, lib
├── backend/               # Spring Boot service
│   ├── src/main/java/com/safarsathi/backendapi
│   │   ├── controllers    # Auth, Admin, RiskZone, SOS, etc.
│   │   ├── models         # Tourist, PoliceDepartment, RiskZone, Alert, BlockchainLog
│   │   └── services       # Business logic layers
│   └── src/main/resources # application.properties, data.sql
├── dataSets/              # JSON for police stations and restricted zones
└── admin_setup.sql        # Optional seed for police departments
```

## Database

- Connection config lives in [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties). Default values: database `safrsathi_db`, user `safarsathi_app`, password `teejnam`, MySQL driver, `spring.jpa.hibernate.ddl-auto=update`, port 8081.
- Create the database and user, then import seeds:
	1) Create DB/user:
		 - `CREATE DATABASE safrsathi_db;`
		 - `CREATE USER 'safarsathi_app'@'%' IDENTIFIED BY 'teejnam';`
		 - `GRANT ALL PRIVILEGES ON safrsathi_db.* TO 'safarsathi_app'@'%';`
	2) Load seeds (orders are interchangeable):
		 - `mysql -u safarsathi_app -p safrsathi_db < backend/src/main/resources/data.sql`
		 - `mysql -u safarsathi_app -p safrsathi_db < admin_setup.sql` (adds admin police rows; overlaps with data.sql for the main control center)

### Tables (JPA models)

- `tourists`: id (UUID), name, email, phone, passport_number, date_of_birth, address, gender, nationality, emergency_contact (JSON text), password_hash (SHA-256), id_hash (digital ID hash), id_expiry (Instant), current_lat/lng, last_seen, safety_score (double, default 100).
- `police_departments`: id (UUID), name, email, password_hash, department_code, latitude, longitude, city, district, state, contact_number, is_active.
- `risk_zones`: id (auto), name, description, center_lat/lng, radius_meters, risk_level (LOW|MEDIUM|HIGH), is_active, created_at, updated_at.
- `alerts`: id (auto), tourist_id (UUID), alert_type (`SOS|INACTIVITY|GEO_FENCE|DEVIATION`), lat, lng, status (`NEW|ACKNOWLEDGED|RESOLVED`), message (TEXT), created_time.
- `blockchain_logs`: id (auto), tourist_id (UUID), data_hash (unique), transaction_id, timestamp, status.

### Seeded records (from data.sql)

- Tourist login: email `tourist@safarsathi.in`, password `password123` (SHA-256 stored).
- Police admin: email `admin@safarsathi.in`, password `admin123`; plus Dispur and Paltan Bazaar stations with the same password.
- Risk zones: Kamakhya Hill Restricted Belt (HIGH, 750m) and Deepor Beel Wildlife Buffer (MEDIUM, 1200m).

## Backend API surface (implemented controllers)

- Auth (tourist):
	- `POST /api/auth/register` – create tourist, returns mock token + QR content.
	- `POST /api/auth/login` – email/password login (hash checked server-side).
	- `GET /api/auth/profile/{touristId}` – fetch tourist profile.
- Admin:
	- `POST /api/admin/login` – police admin login (email/password).
	- `GET /api/admin/id/verify?hash=...` – verify digital ID hash.
	- `GET /api/admin/alerts` – list active alerts; `POST /api/admin/alerts/{id}/status?status=...` – update status.
	- `GET /api/admin/tourists` – list tourists.
- Admin police management: CRUD under `/api/admin/police` (create, read all/one, update, delete departments). Password hashing is expected in the service layer.
- Risk zones:
	- Admin CRUD under `/api/admin/risk-zones` (list, create, update, toggle status, delete).
	- Public read-only active zones at `/api/risk-zones/active`.
- Actions:
	- `POST /api/action/location/{touristId}` – update tourist live location (lat/lng/accuracy).
	- `POST /api/action/sos/{touristId}` – raise SOS alert.
- Dashboards:
	- `GET /api/admin/dashboard/state` – aggregate alerts, tourists, response units.
	- `GET /api/tourist/{touristId}/dashboard` – tourist-facing dashboard state.

## Frontend UI routes (current)

- Tabs inside the single-page layout: Home (mock safety card + local SOS alert list), Map (Leaflet map using dataSets JSON), Identity (placeholder), Settings (placeholder). Entry point in [frontend/src/layout/UserLayout.tsx](frontend/src/layout/UserLayout.tsx).
- Map reads [dataSets/assamRistrictedAreas.json](dataSets/assamRistrictedAreas.json) and [dataSets/assamPoliceStations.json](dataSets/assamPoliceStations.json) for zones and police markers; includes a search bar backed by OpenStreetMap Nominatim.

## Running locally

1) Prerequisites: Node 18+, Java 17, MySQL 8.x.
2) Backend
	 - Configure DB if needed in [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties).
	 - From `backend/`: `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows). Service listens on http://localhost:8081.
3) Frontend
	 - From `frontend/`: `npm install` then `npm run dev`. App serves on http://localhost:5173.

## Known gaps / next steps

- Frontend does not call backend APIs yet (no auth flows, SOS posting, or risk-zone fetch); Identity/Settings pages are stubs.
- WebSocket hooks exist server-side but no client subscription is implemented.
- Password hashing/validation depends on service implementations; ensure hashing is applied on admin police creation.
- Add tests and CI; none are present today.