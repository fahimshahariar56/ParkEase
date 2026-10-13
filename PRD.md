# ParkEase — Product Requirements Document (PRD)

**Product:** ParkEase — Smart Parking Slot Management System  
**Version:** 1.0  
**Project type:** Academic database project with a functional full-stack web interface  
**Primary stack:** React, Tailwind CSS, Node.js, Express.js, MySQL  
**UI source of truth:** `DESIGN.md` and approved Stitch exports in `stitch-design/`

---

## 1. Product Summary

ParkEase is a smart parking management application that lets customers discover parking availability, reserve a suitable slot, manage their vehicles, and view parking activity. Administrators manage parking lots, slots, reservations, parking entry/exit, pricing, customers, and reports.

The project must demonstrate sound relational database design and real application workflows. It must not pretend to be a production-connected parking sensor network or real payment service.

## 2. Goals

1. Deliver a polished, responsive, accessible user interface.
2. Support customer registration, login, vehicle management, and parking reservations.
3. Support an admin portal for operational management.
4. Use MySQL as the source of truth for application data.
5. Demonstrate relational design, foreign keys, indexes, JOINs, transactions, and useful reporting queries.
6. Deliver a cinematic landing page with scroll-triggered 3D car animation, plus practical dashboard interactions.
7. Support coherent dark and light themes.
8. Clearly label simulated payment and demo revenue.

## 3. Non-Goals

- No real payment processing or payment-provider integration.
- No actual card, CVV, PIN, OTP, bKash, or Nagad credential collection.
- No physical IoT sensors, gate controllers, or live vehicle-recognition system unless explicitly added later.
- No claim of real-time availability unless the backend actually provides it.
- No fake customer counts, testimonials, revenue, partnerships, or performance claims.
- No unnecessary rewrite of existing working code.

## 4. User Roles

### Visitor
- View the landing page and product information.
- Switch dark/light theme.
- Open login or customer registration.
- Click **Find Parking** to begin the customer flow.

### Customer
- Register and log in.
- View and edit allowed profile fields.
- Add and manage their own vehicles.
- Search available slots by supported criteria and time range.
- Create reservations and view their own reservation history.
- View active/completed parking sessions where implemented.
- Use demo-only payment flow and view its status.

### Admin
- Log in through a securely provisioned admin account.
- View operational dashboard metrics derived from backend data.
- Create/update parking lots and slots.
- Review/manage reservations.
- Record vehicle entry and exit / parking sessions.
- Manage pricing rules.
- View customer records and reports according to authorization rules.
- View simulated payment records and clearly labelled demo revenue.

Public registration must never create an admin account.

## 5. Required Pages

1. **Landing Page** — `/`
2. **Admin Dashboard** — `/admin`
3. **Customer Parking / Find Parking** — `/parking`
4. **Customer Profile** — `/profile`
5. **Login** — `/login`
6. **Registration** — `/register`
7. **Reservation Details** — `/reservations/:id`

Additional pages may be added only where needed for a coherent flow, such as customer reservation list, vehicle management, or admin lot details. Reuse layouts and components rather than duplicating screens.

## 6. Functional Requirements

### 6.1 Public Landing Page
- Present ParkEase value proposition and feature overview.
- Include visible **Find Parking** and **Sign In** actions.
- Include scroll-driven 3D car storytelling with a static/reduced-motion fallback.
- Include feature, how-it-works, benefit, and final CTA sections.
- Do not fabricate live availability or unverified product claims.

### 6.2 Authentication
- Register customers with validated required fields.
- Authenticate with secure password hashing and session/token strategy defined in `ARCHITECTURE.md`.
- Show loading, validation, authentication error, and success states.
- Restrict protected pages by authentication and role.
- Never expose passwords or password hashes in API responses.
- Admin provisioning must be separate from public registration.

### 6.3 Customer Profile and Vehicles
- Read/update only the authenticated customer's permitted profile fields.
- List/create/update/delete their own vehicles as allowed by business rules.
- Validate plate numbers and vehicle types.
- Prevent deleting a vehicle if doing so would break an active session or reservation.

### 6.4 Parking Discovery and Reservations
- Show parking lots and eligible slots based on real database/API data.
- Support applicable filters: lot, vehicle/slot type, date, start time, and end time.
- Validate start/end times and slot compatibility.
- Prevent overlapping reservations for the same slot.
- Enforce availability and reservation rules on the server, not only in the frontend.
- Use database transactions and appropriate locking/rechecking to handle simultaneous booking attempts.
- Display conflicts clearly and allow the customer to choose another slot.

For a requested interval `[requested_start, requested_end)`, an existing reservation overlaps when:
`existing.start_time < requested_end AND existing.end_time > requested_start`.
Only reservations in relevant active statuses should block availability. Active parking sessions must also be considered.

### 6.5 Parking Sessions
- Admin can record entry for an eligible reservation or supported walk-in workflow.
- Store entry time, slot, vehicle, and hourly-rate snapshot.
- Admin can record exit once only.
- Calculate the fee on the server from the saved rate snapshot and actual duration.
- Prevent duplicate completion/charging.
- Preserve session and payment history.

### 6.6 Demo Payments
- Simulated only; no real gateway/API or actual money movement.
- UI must display **“DEMO PAYMENT — NO REAL MONEY CHARGED”**.
- Demo payment state must come from the backend.
- Backend validates session/payment ownership or admin permission, amount, current status, and duplicate attempts.
- Store demo method, status, timestamp, and a non-sensitive demo reference if required.
- Never request or store real card details, CVV, PIN, OTP, or mobile-banking credentials.
- Call reports based on these records **Demo Revenue**.

### 6.7 Admin Dashboard and Reports
- Metrics must be derived from database/API values or visibly identified seed/demo data.
- Support slot, reservation, session, customer, pricing, and payment management within scope.
- Include useful reports such as occupancy, daily reservations, completed sessions, and demo-payment summaries.
- Use loading, empty, error, and populated states.

## 7. Data Requirements

Expected core entities:
- `users`
- `vehicles`
- `parking_lots`
- `parking_slots`
- `pricing_rules`
- `reservations`
- `parking_sessions`
- `payments`

The exact schema, constraints, relationships, indexes, and transaction boundaries are defined in `ARCHITECTURE.md` and SQL scripts. Keep the schema normalized and protect referential integrity.

## 8. Design and Interaction Requirements

Follow `DESIGN.md` and approved files in `stitch-design/`.

- Primary font: **JetBrains Mono**.
- Main palette: Midnight Navy `#0B1220`, elevated surfaces `#111C2E`, Emerald `#10B981`, cool light background `#F8FAFC`, with accessible semantic status colors.
- Provide deliberately designed dark and light themes.
- Landing page: cinematic scroll-triggered 3D car scaling, movement, and subtle rotation.
- Use GSAP + ScrollTrigger for scroll choreography.
- Use Motion for React for buttons, dialogs, menus, theme toggle, and UI transitions.
- Use Three.js / React Three Fiber only where it adds value; provide mobile/reduced-motion fallback.
- Do not let GSAP and Motion control the same element transform simultaneously.
- Respect `prefers-reduced-motion`, keyboard access, contrast, and touch-friendly sizing.
- Keep dashboards clean, data-rich, and consistent; avoid excessive glass, glow, gradients, or card nesting.

## 9. Non-Functional Requirements

### Security
- Hash passwords using a suitable password-hashing library.
- Use parameterized SQL queries.
- Validate and normalize input on the server.
- Protect routes by authentication and role.
- Enforce resource ownership checks.
- Keep secrets in environment variables; never commit `.env`.
- Configure CORS, security headers, and sensible rate limiting.
- Do not trust frontend-calculated price, permissions, availability, or payment state.

### Reliability
- Use transactions for multi-step operations.
- Handle database and API errors without leaking secrets or stack traces.
- Ensure a reservation/session/payment cannot be duplicated by repeated requests.
- Use appropriate foreign keys and indexes.

### Performance
- Lazy-load the 3D scene where possible.
- Reduce heavy 3D effects on mobile and low-power devices.
- Avoid layout shifts and animation leaks.
- Paginate large tables where appropriate.

### Accessibility and responsive behavior
- Keyboard-accessible navigation and controls.
- Visible focus states and labelled inputs.
- Status not communicated by color alone.
- Desktop, tablet, and mobile layouts.
- Reduced-motion alternatives.

## 10. Acceptance Criteria

The project is considered ready for demonstration when:
- All required pages are implemented and share one design system.
- Customer and admin access are separated and protected.
- A customer can register/login, manage a vehicle, discover slots, and create/view a reservation.
- The system rejects overlapping reservations for the same slot.
- Admin can manage lots/slots and record session entry/exit.
- Fee calculations use server-side saved pricing.
- Demo payments never claim to charge real money.
- MySQL relationships, constraints, indexes, and reporting queries work.
- Landing-page scroll animation and theme switch work, with reduced-motion/mobile fallback.
- Important workflows have been tested and known limitations are documented.
- No fake live metrics, unsupported links, or real payment claims are present.

## 11. Delivery Artifacts

- Source code for frontend and backend.
- MySQL schema, seed data, and required views/procedures/triggers if included in scope.
- `.env.example` with variable names only and no secrets.
- API documentation / endpoint list.
- ER diagram and architecture notes.
- Test checklist and evidence for key workflows.
- Project README with setup instructions and demo credentials handled safely.
- Screenshots from approved Stitch designs and final UI where useful.
