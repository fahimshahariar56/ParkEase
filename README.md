# ParkEase

ParkEase is a smart parking management application for discovering parking facilities, checking slot availability for a time window, making reservations, and managing parking operations. It is a project/demo system: payments are simulated and never move real money.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Node.js (ES modules), Express 4
- **Database:** MySQL 8+ with InnoDB
- **UI and motion:** Motion for React, GSAP + ScrollTrigger, Three.js

The browser talks to the REST API; it never connects directly to MySQL. The backend owns authentication, role and record authorization, reservation conflict checks, session fees, and demo-payment state.

## Main capabilities

- Public landing, features, how-it-works, and about pages
- Separate customer and administrator login endpoints and interfaces
- Customer parking discovery, reservations, profile, and vehicle management
- Admin operations for lots, slots, reservations, sessions, customers, pricing, payments, and reports
- Dark/light themes, responsive layouts, and reduced-motion support
- Interactive illustrative parking scene with a static fallback

## Project layout

```text
backend/                    Express API, SQL services, and Node tests
database/schema.sql         Core MySQL schema
database/init.sql           Full database initialization alternative
database/reports_demonstration.sql
                            Optional synthetic report data and SQL evidence
database/production_missing_tables.sql
                            Additive production table creation script
frontend/                   React/Vite app
README.md                   Setup and handoff
DESIGN.md                   Visual and interaction design specification
ANIMATION.md                Implemented animation inventory and constraints
ARCHITECTURE.md              System architecture, API and security decisions
PHASE.md                    Day-by-day project scope and completion record
```

## Prerequisites

- Node.js compatible with the installed Vite release (Node 20.19+ or 22.12+; use a current LTS)
- npm
- MySQL 8+ with permission to create/use the `parkease_db` database

## Local setup

1. Install backend and frontend dependencies:

   ```powershell
   npm ci --prefix backend
   npm ci --prefix frontend
   ```

2. Create the backend environment file:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set the MySQL connection values in `backend\.env`. Generate a unique JWT signing secret locally (do not paste it into source control):

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Set the generated value as `JWT_SECRET`. The backend refuses to start if it is missing or shorter than 32 characters. Keep `.env` files private; only the example files belong in version control.

3. Create the schema in a fresh local database:

   ```powershell
   Get-Content -Raw database\schema.sql | mysql -u root -p
   ```

   `schema.sql` creates and selects `parkease_db` and defines the eight core tables. `init.sql` is an alternative full initialization script; do not apply both as a migration strategy. These scripts use `CREATE TABLE IF NOT EXISTS`; they do not upgrade existing table definitions. Review schema drift and take a backup before applying changes to a database with existing data.

4. (Optional) Add synthetic report demonstration data:

   ```powershell
   Get-Content -Raw database\reports_demonstration.sql | mysql -u root -p parkease_db
   ```

   This script uses synthetic operational/payment records and may rely on the expected demonstration customer IDs already existing. Use only in a disposable/demo database and inspect the script before applying it. It is not required for normal startup.

5. Start the API and frontend in separate terminals:

   ```powershell
   npm --prefix backend run dev
   npm --prefix frontend run dev
   ```

   The API defaults to `http://localhost:5000`; Vite defaults to `http://localhost:5173` and proxies `/api` to the API. Open the URL printed by Vite. The API health route is `GET /api/v1/health`.

## Environment variables

`backend/.env.example` lists the API/database variables and optional account-provisioning variable names. Configure values only in an ignored `.env` file.

| Variable | Purpose |
|---|---|
| `PORT` | API port; defaults to `5000` |
| `NODE_ENV` | Runtime mode; defaults to `development` |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `DB_CONNECTION_LIMIT` | MySQL pool size |
| `JWT_SECRET` | Required, unique signing key; minimum 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime; defaults to `24h` |
| `ADMIN_FULLNAME` | Optional admin setup/update display name |
| `ADMIN_EMAIL` | Optional admin setup/update email |
| `ADMIN_PASSWORD` | Admin setup/update password; minimum 12 characters |

## Separate sign-in and admin provisioning

- **Customers:** use `/register` to create a customer account, then sign in at `/login`. The API endpoints are `POST /api/v1/auth/register` and `POST /api/v1/auth/customer/login`. Public registration always creates a `CUSTOMER`; attempts to request an admin role are rejected.
- **Administrators:** sign in at `/admin/login`, which uses `POST /api/v1/auth/admin/login`. Customer credentials are not accepted by the admin login, and admin credentials are not accepted by customer login.
- **Initialize or update an admin:** configure `ADMIN_EMAIL`, `ADMIN_FULLNAME`, and `ADMIN_PASSWORD` in the private backend environment file, then run:

  ```powershell
  npm --prefix backend run seed:admin
  ```

  The script hashes the password with bcrypt. It creates a new admin or updates the password/name of the existing admin with that email; it will not convert an existing customer account. The password must be at least 12 characters. No default credentials are published here; use a unique secret and remove setup-only credentials from the environment after provisioning.

Protected frontend routes improve navigation UX; backend authentication, role checks, and ownership checks remain authoritative. Admin reports and payment-management APIs require an admin token.

## API outline

Base path: `/api/v1`. JSON requests and responses use the centralized API client in `frontend/src/lib/api.js`.

| Area | Main endpoints | Access |
|---|---|---|
| Health | `GET /health` | Public |
| Authentication | `POST /auth/register`, `/auth/customer/login`, `/auth/admin/login`; `GET /auth/me` | Public login/register; `/me` authenticated |
| Lots and slots | `GET /parking/lots`, `/parking/slots`, `/parking/slots/availability`; lot/slot create/update/delete | Reads public; writes admin |
| Vehicles and profile | `/vehicles`, `/users/me` | Authenticated; customer resources are owner-scoped |
| Reservations | `/reservations`, `/reservations/:id`, `/reservations/:id/cancel` | Authenticated; customer records are owner-scoped; status administration is admin-only |
| Sessions | `/sessions`, `/sessions/:id`; entry and exit actions | Authenticated reads are owner-scoped for customers; entry/exit actions admin-only |
| Pricing | `/pricing-rules`, `/pricing-rules/effective`; create/deactivate | Reads public; writes admin |
| Demo payments | `/payments`, `/payments/:id`, `/payments/session/:sessionId`; create | Admin-only; simulation only |
| Reports | `/reports/summary`, `/occupancy`, `/reservations`, `/sessions`, `/payments` | Admin-only |

See `backend/src/modules/*/*.routes.js` and `ARCHITECTURE.md` for the authoritative route behavior. Do not assume similarly named frontend pages imply a separate API route.

## Database model and SQL evidence

`database/schema.sql` defines:

- `users` → `vehicles`, `reservations`
- `parking_lots` → `parking_slots`
- `vehicles` and `parking_slots` → `reservations` and `parking_sessions`
- `reservations` → optional one-to-one `parking_sessions` (`reservation_id` is unique)
- `parking_sessions` → demo `payments`

Foreign keys, uniqueness rules, lookup indexes, and transactional business checks support referential integrity and conflict handling. Reservation intervals use half-open overlap checks in the service layer. Session fees are calculated server-side using the saved hourly-rate snapshot. The payment flow is explicitly simulated; it does not use a payment gateway or real card data.

`database/reports_demonstration.sql` contains optional synthetic report data plus queries demonstrating joins, aggregates, views, indexes/constraints, and execution plans. `production_missing_tables.sql` is additive-only and intended for a carefully verified production connection; follow its backup and target-database precautions. None of these SQL files is an automated migration system.

## Design and animation references

- `DESIGN.md` is the visual source of truth: monochrome-first palette, Inter UI + JetBrains Mono technical metadata, dark/light themes, shared components, responsive behavior, accessibility, and local implementation references.
- `ANIMATION.md` records the implemented Motion, GSAP, Three.js, canvas background, reduced-motion behavior, and known limitations.
- `frontend/src/styles/tokens.css` and `frontend/src/styles/globals.css` implement the shared visual tokens and global behavior.
- The landing scene is a procedurally assembled illustrative vehicle, not a licensed photorealistic model. It provides mouse/touch orbit, keyboard arrows, restrained floor rings, and a static poster fallback. It does not represent real-time availability.

## Checks

```powershell
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

The backend test script is Node's built-in test runner. The repository has no configured frontend unit/E2E test script. Lint/build output should be reviewed for warnings; passing does not replace a manual browser walkthrough or database-specific integration test.

## Demonstration checklist

Use a local disposable database and synthetic data. Never use real payment details.

1. Start MySQL, the API, and Vite; confirm `GET /api/v1/health`.
2. Open the public landing page, inspect features/how-it-works, toggle theme, and confirm the scene poster/reduced-motion fallback works.
3. Register a customer; sign out if already authenticated, then sign in via the customer portal.
4. Search lots/slots for a future time window, select a vehicle, create a reservation, and verify it appears in reservation history. Optionally repeat the same slot/time concurrently in a test harness and confirm only one overlapping reservation succeeds.
5. Check customer profile and vehicle management; verify the customer cannot open an admin page or call an admin API.
6. Provision an admin using the private setup procedure above; sign in at `/admin/login`, inspect dashboard metrics and reports, then use the visible sign-out control and confirm protected navigation returns to admin login.
7. In the admin operations flow, record an eligible entry and exit; verify the server-calculated fee and saved rate snapshot.
8. Create a demo payment only for a completed session; confirm the UI/API labels it simulated and verify it appears in the admin payment list and report.
9. Exercise invalid input, overlapping reservation, duplicate exit/payment, empty data, API unavailable, and unauthorized access states.
10. Run the checks above and inspect browser console, narrow/mobile layout, keyboard navigation, and reduced-motion behavior.

Do not present synthetic seed data as live data, demo payment as real revenue, or a mocked test as a successful production transaction.

## Known limitations

- The 3D car is an original procedural illustration; no external car model or licensed photorealistic asset is included.
- Frontend automated unit/E2E tests are not configured. Browser journeys and responsive/accessibility checks require manual execution.
- Demo seed/report SQL assumes the documented local schema and may require existing demonstration users; inspect and use it only on disposable data.
- SQL scripts are initialization/evidence scripts, not versioned schema migrations.
- Rate limiting is not currently configured in the backend; deployments should add an environment-appropriate policy before public exposure.
- Production deployment, credential rotation, TLS/proxy configuration, backups, and database least-privilege grants must be handled by the operator.

## License

No project license file is currently provided. Obtain project-owner approval before redistribution or reuse.
