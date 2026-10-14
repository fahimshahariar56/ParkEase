# ARCHITECTURE — ParkEase Smart Parking Slot Management System

## 1. Architecture Overview

ParkEase uses a three-layer web architecture:

1. **Frontend:** React + Vite + Tailwind CSS
2. **Backend:** Node.js + Express.js REST API
3. **Database:** MySQL 8+ with InnoDB

The browser must not connect directly to MySQL. The backend is the authority for authentication, authorization, availability, reservation conflict checks, pricing, parking-session state, and demo-payment state.

```text
Visitor / Customer / Admin
          |
          v
React + Vite + Tailwind
  - Public / Customer / Admin layouts
  - Motion for React interactions
  - GSAP + ScrollTrigger landing choreography
  - Three.js / React Three Fiber hero scene
          |
          | HTTPS / JSON REST API
          v
Node.js + Express
  - Routes / Controllers
  - Authentication + Role Authorization
  - Validation
  - Services / Business Rules
  - Transactions
          |
          | mysql2 parameterized queries
          v
MySQL 8+ / InnoDB
  - users, vehicles, parking_lots, parking_slots
  - pricing_rules, reservations
  - parking_sessions, payments
```

## 2. Architectural Principles

- Keep the frontend, backend, and database responsibilities separate.
- Organize backend code by feature/module.
- Keep HTTP routing/controllers thin; business rules belong in services.
- Validate request data before executing business operations.
- Use parameterized SQL through `mysql2`.
- Use database constraints and transactions in addition to application checks.
- Return consistent API response shapes and safe error messages.
- Do not return secrets or password hashes.
- Keep demo payment explicitly simulated.
- Preserve existing code patterns if the repository already has a valid architecture; adapt rather than rewrite unnecessarily.

## 3. Frontend Architecture

### Responsibilities
- Render landing, auth, customer, and admin pages.
- Provide responsive navigation and reusable components.
- Manage forms, client-side validation, loading and error states.
- Call the backend through a centralized API client.
- Apply role-aware routing for user experience; backend authorization remains mandatory.
- Maintain dark/light theme consistently.
- Render the scroll-linked 3D car on the landing page with a fallback.

### Suggested structure

```text
frontend/
  public/
    images/
  src/
    assets/
    components/
      ui/
      navigation/
      parking/
      dashboard/
      forms/
      motion/
      three/
    layouts/
      PublicLayout.jsx
      CustomerLayout.jsx
      AdminLayout.jsx
    pages/
      LandingPage.jsx
      LoginPage.jsx
      RegisterPage.jsx
      AdminDashboard.jsx
      FindParkingPage.jsx
      CustomerProfilePage.jsx
      ReservationDetailsPage.jsx
    routes/
    services/
      api.js
      authService.js
      parkingService.js
      reservationService.js
      paymentService.js
    hooks/
    context/
    utils/
    styles/
      tokens.css
      globals.css
```

This is a suggested structure, not a requirement to duplicate existing files. Follow the current repository's naming and file conventions when established.

### Frontend route expectations

| Route | Access |
|---|---|
| `/` | Public |
| `/login` | Public |
| `/register` | Public; creates customers only |
| `/parking` | Customer flow; redirect to login if authentication is required |
| `/profile` | Authenticated customer |
| `/reservations/:id` | Authenticated owner or authorized admin |
| `/admin/*` | Admin only |

### Theme and animation responsibilities
- **Motion for React:** UI state transitions, buttons, dialogs, dropdowns, navigation, theme toggle, slot selection.
- **GSAP + ScrollTrigger:** scroll-linked landing-page timeline and car choreography.
- **Three.js / React Three Fiber:** 3D scene and camera/lighting.
- Never let two animation systems own the same element transform at once.
- Clean up timelines, ScrollTriggers, event listeners, and GPU resources.
- Respect reduced motion and provide mobile/low-power fallback.

## 4. Backend Architecture

### Responsibilities
- Authenticate users and authorize roles.
- Validate and normalize request data.
- Enforce resource ownership.
- Calculate availability, reservation conflicts, fees, and payment transitions.
- Use database transactions for multi-step changes.
- Return consistent errors and avoid leaking internals.

### Suggested structure

```text
backend/
  src/
    app.js
    server.js
    config/
      database.js
      env.js
    middleware/
      authenticate.js
      authorizeRole.js
      validateRequest.js
      errorHandler.js
      notFound.js
    modules/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
        auth.validation.js
      users/
      vehicles/
      parking/
      reservations/
      sessions/
      payments/
      reports/
    routes/
      index.js
    services/
    utils/
```

Use the current project's established module pattern if it already exists. Avoid creating empty abstraction layers without a concrete need.

### Request flow

1. Router receives request.
2. Authentication middleware verifies identity when required.
3. Role/ownership middleware or service checks authorization.
4. Validation layer checks request shape and values.
5. Controller invokes a service.
6. Service performs business rules and parameterized database operations.
7. Controller returns a safe, consistent JSON response.
8. Central error handler handles unexpected failures.

## 5. Database Architecture

Use MySQL 8+ and InnoDB. The core relational entities are:

### `users`
- Primary key: `id`
- Unique email
- Password hash, never plaintext
- Role: `CUSTOMER` or `ADMIN`
- Profile fields as required

### `vehicles`
- Primary key: `id`
- `user_id` foreign key to `users`
- Unique normalized plate number where appropriate
- Vehicle type, e.g. motorcycle, car, SUV, van

### `parking_lots`
- Primary key: `id`
- Name, address/description, operational status, and supported metadata

### `parking_slots`
- Primary key: `id`
- `lot_id` foreign key to `parking_lots`
- Slot number, slot type, current operational status
- Unique constraint on `(lot_id, slot_number)`

### `pricing_rules`
- Primary key: `id`
- Applicable vehicle/slot type or pricing scope
- Hourly rate, effective dates, active state
- Validate overlapping/active rules in application logic or through a clearly defined policy

### `reservations`
- Primary key: `id`
- Foreign keys to customer, vehicle, and slot
- Start/end timestamps
- Saved hourly-rate snapshot
- Status such as `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- Index fields used in availability queries

### `parking_sessions`
- Primary key: `id`
- Vehicle and slot foreign keys
- Optional unique reservation reference for reservation-backed sessions
- Entry/exit timestamps
- Saved rate snapshot, total fee, and session status
- Prevent multiple active sessions for the same slot/vehicle through transaction logic and constraints where feasible

### `payments`
- Primary key: `id`
- Session reference
- Amount, demo method, status, non-sensitive demo transaction reference, paid timestamp
- Payment history must be retained

Use suitable `DECIMAL` columns for money, consistent timestamp handling, explicit foreign-key actions, indexes, and constraints. Never use floating-point types for monetary amounts.

Reservation API timestamps represent instants and must include an explicit timezone. Convert them to UTC `YYYY-MM-DD HH:mm:ss` values for MySQL bindings, and keep MySQL pooled sessions in UTC so `TIMESTAMP` and `DATETIME` reservation columns use the same policy. Do not reinterpret API timestamps as Bangladesh-local wall-clock values.

## 6. Availability and Reservation Consistency

Availability cannot be inferred only from `parking_slots.status`. It must consider:
- The requested start/end interval.
- Existing reservations that block the requested interval.
- Active parking sessions.
- Slot operational state.
- Vehicle/slot compatibility.
- Reservation status.

Two intervals overlap when:

```sql
existing.start_time < :requested_end
AND existing.end_time > :requested_start
```

Use half-open intervals `[start, end)` so a reservation ending at 10:00 does not conflict with one beginning at 10:00, subject to the product's policy.

### Concurrency strategy
1. Validate the request and ownership.
2. Begin a database transaction.
3. Lock/recheck the relevant slot and overlapping reservations using an appropriate InnoDB locking strategy.
4. Verify no conflicting active reservation/session exists.
5. Insert the reservation with the correct status and rate snapshot.
6. Commit only if all checks pass; otherwise roll back.
7. Return a conflict response if another request reserved the slot first.

A frontend availability result is only a preview; the backend must recheck during booking.

## 7. Parking Session and Fee Rules

- Only authorized admins or explicitly authorized workflows may record entry/exit.
- A session must not be exited or charged twice.
- Save the applicable hourly-rate snapshot at the correct business event.
- Calculate fees on the backend using the defined rounding policy.
- A possible policy is `ceil(duration_minutes / 60)` with a minimum of one billable hour, but implement only the policy confirmed by the project requirements.
- Validate timestamps and ensure exit is after entry.
- Preserve completed session and payment history.

## 8. Demo Payment Architecture

Payments are simulations, not real financial transactions.

- No external payment provider integration.
- Do not collect real card, CVV, PIN, OTP, or mobile-banking credentials.
- Backend verifies session/payment eligibility, permissions, amount, current status, and duplicate attempts.
- Update the demo payment state transactionally.
- Store a demo method/status/reference only as needed.
- UI must say **“DEMO PAYMENT — NO REAL MONEY CHARGED”**.
- Admin reports must label simulated totals **Demo Revenue**.
- Do not trust an amount or success status supplied only by the frontend.

## 9. API Design

Use a versioned REST prefix such as `/api/v1`. Exact route names should follow existing implementation if already established.

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Parking / Slots
- `GET /parking/lots`
- `GET /parking/lots/:lotId`
- `GET /parking/slots`
- `GET /parking/slots/availability`

### Vehicles
- `GET /vehicles`
- `POST /vehicles`
- `PATCH /vehicles/:vehicleId`
- `DELETE /vehicles/:vehicleId`

### Reservations
- `POST /reservations`
- `GET /reservations`
- `GET /reservations/:reservationId`
- `PATCH /reservations/:reservationId/cancel` (or a consistent action route)

### Sessions
- `POST /sessions/:sessionId/entry` or a reservation-aware entry endpoint
- `POST /sessions/:sessionId/exit`
- `GET /sessions/active`
- `GET /sessions/history`

### Payments
- `GET /payments`
- `POST /payments/:paymentId/simulate`

### Admin
- CRUD routes for parking lots and slots
- Admin reservation management routes
- Customer management routes
- Pricing-rule routes
- Dashboard and reporting routes

For every endpoint, define authentication, role requirements, input validation, response shape, and relevant error cases. Do not implement unsupported endpoints merely because they appear in this suggested list.

## 10. API Response and Error Conventions

Use a consistent JSON shape, for example:

```json
{
  "success": true,
  "data": {},
  "message": "Optional safe message"
}
```

For errors, return an appropriate HTTP status and a safe message. Do not send stack traces, SQL statements, secrets, or password hashes to the client. Keep validation errors clear and actionable.

Suggested statuses:
- `200` successful read/update/action
- `201` created
- `400` invalid input
- `401` unauthenticated
- `403` unauthorized
- `404` resource not found
- `409` reservation/duplicate/conflict
- `422` semantically invalid input if used consistently
- `429` rate limited
- `500` unexpected server failure

## 11. Security

- Password hashing with bcrypt or another approved password-hashing algorithm.
- JWT or another documented authentication strategy; keep token handling consistent and secure.
- Never hard-code secrets; load them from environment variables.
- Use parameterized SQL.
- Validate all untrusted input.
- Enforce role checks and record ownership on the server.
- Apply sensible CORS, security headers, and rate limits.
- Prevent mass assignment by allow-listing accepted fields.
- Do not log passwords, tokens, or sensitive personal/payment information.
- Public registration may only create a customer.
- Do not expose internal errors or sensitive database details.

## 12. Environment and Configuration

Maintain `.env` locally and never commit it. Provide `.env.example` with safe placeholders only. Variable names should match the actual implementation, for example:
- `PORT`
- `NODE_ENV`
- `CLIENT_ORIGIN`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

`JWT_SECRET` must be set to a unique cryptographically random value of at least 32 characters. The backend fails at startup if it is missing or too short; it never uses a built-in fallback.

Do not assume every variable is needed; keep the example aligned with actual code.

## 13. Testing Strategy

### Database
- Schema creation and seed scripts run cleanly.
- Foreign keys and unique constraints reject invalid records.
- Availability query correctly handles overlapping and adjacent intervals.
- Transactions roll back on conflict/failure.
- Reports return correct values for test fixtures.

### API
- Registration/login and invalid credentials.
- Role restrictions and ownership checks.
- Vehicle CRUD and invalid plate/type input.
- Reservation creation, cancellation, overlap conflict, and simultaneous booking attempt.
- Session entry/exit and duplicate-exit prevention.
- Demo-payment success/failure and duplicate-payment prevention.
- Input validation, rate limiting, and safe error responses.

### Frontend
- All required routes render.
- Theme toggle works on every layout.
- Forms show validation/loading/error/success states.
- Landing animation works and has reduced-motion fallback.
- Mobile navigation and layouts work.
- Parking slots show accessible status labels.
- No unsupported controls appear functional.

## 14. Implementation Boundaries

- `PRD.md` defines product scope and acceptance criteria.
- `DESIGN.md` and `stitch-design/` define visual direction.
- `PHASE.md` defines the 30-day implementation sequence.
- `RULES.md` defines agent execution and communication constraints.
- This file defines technical architecture and boundaries.

When documentation conflicts, do not silently invent a resolution. Prefer the most specific relevant requirement and ask a concise question only when the conflict blocks safe implementation.
