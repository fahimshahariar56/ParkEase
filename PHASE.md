# PHASE — ParkEase 31-Day Implementation Plan

## Execution Contract

* Execute only the explicitly requested `Day N`.
* Read `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASE.md`, `DESIGN.md`, and relevant `stitch-design/` files before changing code.
* Do not start future days automatically.
* Complete the requested day's deliverables, run relevant checks, report briefly, and STOP.
* Adapt tasks to the existing repository; do not recreate working functionality unnecessarily.
* If a task depends on a missing decision or unavailable asset, state a concise blocker.

---

## Phase 1 — Project Audit and Foundations

### Day 1 — Repository Audit and Baseline

* Inspect the existing repository, scripts, dependencies, routes, API contracts, and database assets.
* Read project documentation and approved Stitch designs.
* Identify existing functionality, blockers, and the smallest safe implementation path.
* Run available baseline checks without unrelated edits.
* **Deliverable:** Concise audit notes and verified baseline.

### Day 2 — Requirements and Route Map

* Confirm page/role map against PRD and current code.
* Map public, customer, and admin routes.
* Identify required UI states and backend dependencies.
* **Deliverable:** Route/access map and scoped task checklist.

### Day 3 — Design Tokens and Typography

* Implement approved color tokens, JetBrains Mono, spacing, borders, radii, and global styles.
* Ensure dark/light theme token foundations.
* **Deliverable:** Reusable visual foundation without redesigning approved concepts.

### Day 4 — Shared UI Components

* Implement/reuse buttons, inputs, cards, badges, dialogs, toasts, loading, empty, and error states.
* Add keyboard focus and disabled/loading states.
* **Deliverable:** Consistent reusable component primitives.

### Day 5 — App Layouts and Navigation

* Set up or refine public, customer, and admin layouts.
* Add responsive navigation, role-aware links, and theme toggle.
* **Deliverable:** Shared layouts and navigation skeleton.

---

## Phase 2 — Authentication and Customer Foundation

### Day 6 — Backend and Database Configuration

* Verify environment handling, MySQL connection pool, error handling, and health check.
* Ensure `.env` is not tracked; align `.env.example` with actual variables.
* **Deliverable:** Safe backend/database foundation.

### Day 7 — Authentication API

* Implement or verify customer registration, login, current-user endpoint, password hashing, and safe responses.
* Prevent public admin registration.
* **Deliverable:** Tested authentication endpoints.

### Day 8 — Authentication and Role Protection

* Add/verify authentication middleware, role checks, ownership patterns, and frontend route guards.
* **Deliverable:** Protected customer/admin access.

### Day 9 — Login and Registration UI

* Implement polished, responsive login/register screens from `DESIGN.md` and Stitch.
* Add validation, loading, server errors, and success handling.
* **Deliverable:** Working auth screens integrated with the API.

### Day 10 — Customer Profile and Vehicles

* Implement profile and vehicle management API/UI within existing schema.
* Enforce ownership and prevent unsafe vehicle deletion.
* **Deliverable:** Customer can manage their own profile and vehicles.

---

## Phase 3 — Parking Data and Reservations

### Day 11 — Parking Lots and Slots API

* Implement/verify lot and slot listing and admin CRUD.
* Add validation, role protection, and safe error handling.
* **Deliverable:** Tested parking inventory endpoints.

### Day 12 — Parking Availability Logic

* Implement availability filtering by supported lot, slot type, and time range.
* Account for reservation overlap, active sessions, slot status, and compatibility.
* **Deliverable:** Correct availability query/service with test cases.

### Day 13 — Reservation Creation and Cancellation

* Implement transactional reservation creation, conflict recheck/locking, ownership, and cancellation rules.
* **Deliverable:** Conflict-safe reservation endpoints.

### Day 14 — Customer Find Parking UI

* Build parking filters, slot grid/cards, slot selection, responsive states, and API integration.
* **Deliverable:** Customer can discover and select an eligible slot.

### Day 15 — Reservation Flow and Details

* Connect vehicle selection, reservation summary, confirmation, reservation details, and history.
* Handle conflicts and API errors.
* **Deliverable:** Complete customer reservation journey.

---

## Phase 4 — Admin Authentication and Operations

### Day 16 — Admin Dashboard Overview

* Build dashboard layout and connect real/seed-labelled metrics.
* Add loading, empty, and error states.
* **Deliverable:** Functional admin overview.

### Day 17 — Separate Admin Login and Authentication

* Inspect the existing authentication architecture, frontend routes, backend authentication service, JWT middleware, and MySQL user schema before making changes.
* Implement a dedicated admin login page at `/admin/login`.
* Build a professional, responsive Admin Login UI consistent with `DESIGN.md` and approved Stitch designs.
* Support email/password validation, show/hide password, loading states, and generic authentication errors.
* Enforce strict role separation:

  * Only `ADMIN` accounts can authenticate through the admin login flow.
  * Only `CUSTOMER` accounts can authenticate through the customer login flow.
  * Customer credentials must not grant access through admin login.
  * Admin credentials must not authenticate through customer login.
* Enforce role restrictions on the backend, not only in React.
* Reuse existing bcrypt password verification, JWT generation, authentication state, and API utilities.
* Ensure protected admin routes redirect unauthenticated users to `/admin/login`.
* Verify that admin navigation links and route definitions consistently use `/admin`, correcting any existing route mismatch.
* Ensure direct navigation, refresh, logout, invalid tokens, and unauthorized API requests are handled correctly.
* Inspect the admin account setup process and existing environment variables without exposing secrets.
* Do not automatically create admin accounts on every server startup.
* **Deliverable:** Dedicated admin login integrated with the existing authentication system, with verified customer/admin separation.

### Day 18 — Admin Lot and Slot Management

* Implement lot/slot forms, tables, filters, validation, and confirmation dialogs.
* Integrate with existing parking inventory APIs.
* Enforce admin-only write operations.
* **Deliverable:** Admin can manage parking inventory.

### Day 19 — Reservation Management

* Add admin reservation list, filters, details, and permitted status actions.
* Integrate with existing reservation APIs.
* Preserve reservation ownership and business rules.
* **Deliverable:** Operational reservation management.

### Day 20 — Parking Entry and Exit Sessions

* Implement session entry/exit logic, timestamps, saved rate snapshots, server-side fee calculation, and duplicate-action prevention.
* Handle invalid transitions and conflicting session actions.
* **Deliverable:** Tested session lifecycle.

### Day 21 — Demo Payment Flow

* Implement simulated payment only, explicit no-real-money messaging, status validation, and duplicate-payment protection.
* Integrate with the existing reservation/session workflow.
* **Deliverable:** Working demo payment journey with no real gateway.

---

## Phase 5 — Reports and Premium Motion

### Day 22 — Pricing Rules

* Implement or verify pricing-rule management and effective-rate selection.
* Ensure reservations/sessions save the correct rate snapshot.
* Protect pricing administration with admin authorization.
* **Deliverable:** Validated pricing workflow.

### Day 23 — Reports and Database Demonstration

* Add occupancy, reservation, session, and demo-payment reports.
* Verify required joins, grouping, indexes, constraints, and any in-scope views/procedures/triggers.
* Ensure reports use actual database data or are clearly labelled when using seed/demo data.
* **Deliverable:** Reliable report screens and SQL evidence.

### Day 24 — Landing Page Structure

* Implement landing sections, CTA flow, responsive hero composition, and theme-aware visuals based on Stitch.
* **Deliverable:** Polished landing page without heavy animation tuning yet.

### Day 25 — 3D Car Scene

* Add a lightweight Three.js / React Three Fiber car/parking scene or suitable project-owned asset.
* Add loading and fallback states; test desktop/mobile performance.
* **Deliverable:** Working 3D hero visual.

### Day 26 — Scroll-Triggered Storytelling

* Implement GSAP + ScrollTrigger scale, position, subtle rotation, and scene progression.
* Ensure cleanup, no scroll hijacking, and reduced-motion fallback.
* **Deliverable:** Coherent scroll-linked car animation.

---

## Phase 6 — Polish, Verification, and Delivery

### Day 27 — Motion and Theme Polish

* Use Motion for React for buttons, dialogs, navigation, slot selection, and theme toggle.
* Ensure animation ownership does not conflict with GSAP.
* **Deliverable:** Consistent, restrained micro-interactions.

### Day 28 — Responsive and Accessibility Pass

* Test desktop/tablet/mobile layouts, keyboard navigation, focus states, contrast, labels, and reduced motion.
* Include the admin login page and admin dashboard in responsive and accessibility checks.
* **Deliverable:** Responsive/accessibility fixes.

### Day 29 — Security and Edge-Case Pass

* Test authorization, ownership, SQL parameterization, input validation, rate limiting, conflict handling, and secret hygiene.
* Verify admin/customer login separation and admin API authorization.
* Test role manipulation attempts, invalid/expired JWTs, and unauthorized direct API requests.
* **Deliverable:** Resolved high-priority issues and recorded limitations.

### Day 30 — End-to-End QA and Bug Fixes

* Test customer and admin workflows, reservation concurrency, session fees, demo payments, reports, and error states.
* Test the complete admin login → dashboard → logout journey.
* Test customer login and verify that customers cannot access admin pages or APIs.
* Fix reproducible issues in scope.
* **Deliverable:** Completed QA checklist and test results.

### Day 31 — Documentation and Final Demonstration

* Finalize setup instructions, environment example, API notes, ERD/schema scripts, demo workflow, and known limitations.
* Document the separate admin and customer login flows.
* Document admin account initialization/update steps without exposing actual credentials.
* Verify build and available automated tests.
* Prepare a concise presentation/demo checklist.
* **Deliverable:** Reproducible project handoff and demonstration-ready build.

---

## Definition of Done for Each Day

* Only that day's scope was executed.
* Existing unrelated functionality remains intact.
* Relevant checks/tests were actually run and results reported accurately.
* No secrets or real credentials were added.
* `DESIGN.md` and approved Stitch exports remain the visual source of truth.
* Any blocker is stated concisely.
* Agent stops after the completion report.
