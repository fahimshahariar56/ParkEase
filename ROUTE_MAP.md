# ParkEase — Route Map & Requirements Checklist

## 1. Role & Access Matrix

| Role | Permissions & Boundaries | Unauthorized Action |
|---|---|---|
| **Visitor** | View landing page, inspect public parking info, switch theme, access login/registration. | N/A |
| **Customer** | Manage personal profile, vehicles, search slot availability, create/cancel reservations, simulate payment. No access to admin routes or other customers' records. | Redirect to `/login` with return URL. |
| **Admin** | Full system oversight: parking lots/slots, reservations, active/past sessions (entry/exit), customer directory, pricing rules, demo revenue reports. | Redirect to `/login` or 403 Forbidden. |

---

## 2. Route & Navigation Map

### 2.1 Public Routes (`PublicLayout`)
- **`/` (Landing Page)**
  - Access: Public (Visitor / Customer / Admin)
  - Features: Hero with scroll-choreographed 3D car, feature overview, how-it-works, benefits, live slot preview CTA.
  - Backend Dependencies: `GET /api/v1/parking/lots` (summary/preview stats).
- **`/login` (Login Page)**
  - Access: Public (Redirects to role dashboard if already authenticated).
  - Features: Email/password authentication for Customer and Admin.
  - Backend Dependencies: `POST /api/v1/auth/login`.
- **`/register` (Registration Page)**
  - Access: Public (Redirects to `/parking` if already authenticated).
  - Features: Customer self-registration only (`role: CUSTOMER` strictly enforced on server).
  - Backend Dependencies: `POST /api/v1/auth/register`.

### 2.2 Customer Routes (`CustomerLayout`)
- **`/parking` (Find & Reserve Parking)**
  - Access: Authenticated Customer (Public visitor prompted to log in upon reservation attempt).
  - Features: Lot selection, date/time interval picker, slot availability grid, vehicle selector, booking confirmation modal.
  - Backend Dependencies: `GET /api/v1/parking/lots`, `GET /api/v1/parking/slots/availability`, `GET /api/v1/vehicles`, `POST /api/v1/reservations`.
- **`/profile` (Customer Profile & Vehicles)**
  - Access: Authenticated Customer (`CUSTOMER` role).
  - Features: Profile details, vehicle management (add/edit/delete license plates and vehicle types), active/past reservation overview.
  - Backend Dependencies: `GET /api/v1/auth/me`, `PATCH /api/v1/users/profile`, `GET /api/v1/vehicles`, `POST /api/v1/vehicles`, `DELETE /api/v1/vehicles/:id`, `GET /api/v1/reservations/my`.
- **`/reservations/:id` (Reservation Details & Demo Payment)**
  - Access: Authenticated Reservation Owner or Admin.
  - Features: Reservation status, assigned lot/slot, time window, vehicle details, fee breakdown, simulated payment action ("DEMO PAYMENT — NO REAL MONEY CHARGED").
  - Backend Dependencies: `GET /api/v1/reservations/:id`, `PATCH /api/v1/reservations/:id/cancel`, `POST /api/v1/payments/:id/simulate`.

### 2.3 Admin Routes (`AdminLayout`)
- **`/admin` (Admin Overview Dashboard)**
  - Access: Authenticated Admin (`ADMIN` role).
  - Features: Occupancy rate, active reservations count, current active sessions, daily demo revenue.
  - Backend Dependencies: `GET /api/v1/admin/dashboard/stats`, `GET /api/v1/admin/reports/occupancy`.
- **`/admin/lots` (Parking Lots & Slots Management)**
  - Access: Authenticated Admin.
  - Features: Lot list/editor, slot inventory grid, slot status toggle (Available/Maintenance).
  - Backend Dependencies: `GET /api/v1/admin/lots`, `POST /api/v1/admin/lots`, `GET /api/v1/admin/slots`, `POST /api/v1/admin/slots`, `PATCH /api/v1/admin/slots/:id`.
- **`/admin/reservations` (Reservation Operations)**
  - Access: Authenticated Admin.
  - Features: Filterable reservation logs, status changes (Confirm, Cancel, Mark No-Show).
  - Backend Dependencies: `GET /api/v1/admin/reservations`, `PATCH /api/v1/admin/reservations/:id/status`.
- **`/admin/sessions` (Entry & Exit Management)**
  - Access: Authenticated Admin.
  - Features: Record vehicle arrival/entry against reservation, record exit, calculate billable duration and fee snapshot.
  - Backend Dependencies: `GET /api/v1/admin/sessions/active`, `POST /api/v1/admin/sessions/entry`, `POST /api/v1/admin/sessions/exit`.
- **`/admin/customers` (Customer Directory)**
  - Access: Authenticated Admin.
  - Features: Customer list, registered vehicles count, reservation history lookup.
  - Backend Dependencies: `GET /api/v1/admin/customers`, `GET /api/v1/admin/customers/:id`.
- **`/admin/pricing` (Pricing Rules Management)**
  - Access: Authenticated Admin.
  - Features: Rate list by vehicle/slot type, active hourly rate configurations.
  - Backend Dependencies: `GET /api/v1/admin/pricing`, `POST /api/v1/admin/pricing`, `PATCH /api/v1/admin/pricing/:id`.
- **`/admin/reports` (Reports & Analytics)**
  - Access: Authenticated Admin.
  - Features: Occupancy trends, reservation volume, clearly labeled "Demo Revenue" audit reports.
  - Backend Dependencies: `GET /api/v1/admin/reports/revenue`, `GET /api/v1/admin/reports/occupancy`.

---

## 3. UI State Coverage Matrix

Every route must implement 6 explicit UI states:
1. **Loading State:** Skeleton loaders and discreet spinners preserving layout stability.
2. **Success / Populated State:** Data populated using JetBrains Mono and Midnight Navy/Emerald color system.
3. **Empty State:** Contextual empty illustration/icon with actionable CTA (e.g. "No vehicles added yet. Add your first vehicle.").
4. **Validation State:** Inline field errors, invalid time-window notifications, plate format warnings before submission.
5. **Error State:** User-friendly error cards with retry actions; no leaked stack traces or raw database errors.
6. **Unauthorized / Forbidden State:** Clean redirect to `/login` or 403 access barrier.

---

## 4. Scoped Task Checklist (Phase 1 & Onwards)

- [x] **Day 1:** Audit repository, document baseline, identify missing components.
- [x] **Day 2:** Formalize requirements, role-access matrix, route map, UI states, and backend dependencies.
- [ ] **Day 3:** Configure design tokens, JetBrains Mono font, Tailwind color system (Midnight Navy/Emerald), dark/light mode foundations.
- [ ] **Day 4:** Build shared UI primitives (buttons, inputs, cards, badges, dialogs, toasts, skeletons).
- [ ] **Day 5:** Build shared app layouts (`PublicLayout`, `CustomerLayout`, `AdminLayout`) and responsive navigation skeleton.
- [ ] **Day 6:** Initialize backend, MySQL connection pool, environment configuration, and health check.
- [ ] **Day 7:** Implement customer registration and login API with bcrypt password hashing.
- [ ] **Day 8:** Implement auth middleware, role verification, ownership checks, and frontend route guards.
