# PHASE — ParkEase 30-Day Implementation Plan

## Execution Contract

- Execute only the explicitly requested `Day N`.
- Read `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASE.md`, `DESIGN.md`, and relevant `stitch-design/` files before changing code.
- Do not start future days automatically.
- Complete the requested day's deliverables, run relevant checks, report briefly, and STOP.
- Adapt tasks to the existing repository; do not recreate working functionality unnecessarily.
- If a task depends on a missing decision or unavailable asset, state a concise blocker.

---

## Phase 1 — Project Audit and Foundations

### Day 1 — Repository Audit and Baseline
- Inspect the existing repository, scripts, dependencies, routes, API contracts, and database assets.
- Read project documentation and approved Stitch designs.
- Identify existing functionality, blockers, and the smallest safe implementation path.
- Run available baseline checks without unrelated edits.
- **Deliverable:** concise audit notes and verified baseline.

### Day 2 — Requirements and Route Map
- Confirm page/role map against PRD and current code.
- Map public, customer, and admin routes.
- Identify required UI states and backend dependencies.
- **Deliverable:** route/access map and scoped task checklist.

### Day 3 — Design Tokens and Typography
- Implement approved color tokens, JetBrains Mono, spacing, borders, radii, and global styles.
- Ensure dark/light theme token foundations.
- **Deliverable:** reusable visual foundation without redesigning approved concepts.

### Day 4 — Shared UI Components
- Implement/reuse buttons, inputs, cards, badges, dialogs, toasts, loading, empty, and error states.
- Add keyboard focus and disabled/loading states.
- **Deliverable:** consistent reusable component primitives.

### Day 5 — App Layouts and Navigation
- Set up or refine public, customer, and admin layouts.
- Add responsive navigation, role-aware links, and theme toggle.
- **Deliverable:** shared layouts and navigation skeleton.

## Phase 2 — Authentication and Customer Foundation

### Day 6 — Backend and Database Configuration
- Verify environment handling, MySQL connection pool, error handling, and health check.
- Ensure `.env` is not tracked; align `.env.example` with actual variables.
- **Deliverable:** safe backend/database foundation.

### Day 7 — Authentication API
- Implement or verify customer registration, login, current-user endpoint, password hashing, and safe responses.
- Prevent public admin registration.
- **Deliverable:** tested authentication endpoints.

### Day 8 — Authentication and Role Protection
- Add/verify authentication middleware, role checks, ownership patterns, and frontend route guards.
- **Deliverable:** protected customer/admin access.

### Day 9 — Login and Registration UI
- Implement polished, responsive login/register screens from DESIGN.md and Stitch.
- Add validation, loading, server errors, and success handling.
- **Deliverable:** working auth screens integrated with the API.

### Day 10 — Customer Profile and Vehicles
- Implement profile and vehicle management API/UI within existing schema.
- Enforce ownership and prevent unsafe vehicle deletion.
- **Deliverable:** customer can manage their own profile and vehicles.

## Phase 3 — Parking Data and Reservations

### Day 11 — Parking Lots and Slots API
- Implement/verify lot and slot listing and admin CRUD.
- Add validation, role protection, and safe error handling.
- **Deliverable:** tested parking inventory endpoints.

### Day 12 — Parking Availability Logic
- Implement availability filtering by supported lot, slot type, and time range.
- Account for reservation overlap, active sessions, slot status, and compatibility.
- **Deliverable:** correct availability query/service with test cases.

### Day 13 — Reservation Creation and Cancellation
- Implement transactional reservation creation, conflict recheck/locking, ownership, and cancellation rules.
- **Deliverable:** conflict-safe reservation endpoints.

### Day 14 — Customer Find Parking UI
- Build parking filters, slot grid/cards, slot selection, responsive states, and API integration.
- **Deliverable:** customer can discover and select an eligible slot.

### Day 15 — Reservation Flow and Details
- Connect vehicle selection, reservation summary, confirmation, reservation details, and history.
- Handle conflicts and API errors.
- **Deliverable:** complete customer reservation journey.

## Phase 4 — Admin Operations and Demo Payments

### Day 16 — Admin Dashboard Overview
- Build dashboard layout and connect real/seed-labelled metrics.
- Add loading, empty, and error states.
- **Deliverable:** functional admin overview.

### Day 17 — Admin Lot and Slot Management
- Implement lot/slot forms, tables, filters, validation, and confirmation dialogs.
- **Deliverable:** admin can manage parking inventory.

### Day 18 — Reservation Management
- Add admin reservation list, filters, details, and permitted status actions.
- **Deliverable:** operational reservation management.

### Day 19 — Parking Entry and Exit Sessions
- Implement session entry/exit logic, timestamps, saved rate snapshots, server-side fee calculation, and duplicate-action prevention.
- **Deliverable:** tested session lifecycle.

### Day 20 — Demo Payment Flow
- Implement simulated payment only, explicit no-real-money messaging, status validation, and duplicate-payment protection.
- **Deliverable:** working demo payment journey with no real gateway.

## Phase 5 — Reports and Premium Motion

### Day 21 — Pricing Rules
- Implement or verify pricing-rule management and effective-rate selection.
- Ensure reservations/sessions save the correct rate snapshot.
- **Deliverable:** validated pricing workflow.

### Day 22 — Reports and Database Demonstration
- Add occupancy, reservation, session, and demo-payment reports.
- Verify required joins, grouping, indexes, constraints, and any in-scope views/procedures/triggers.
- **Deliverable:** reliable report screens and SQL evidence.

### Day 23 — Landing Page Structure
- Implement landing sections, CTA flow, responsive hero composition, and theme-aware visuals based on Stitch.
- **Deliverable:** polished landing page without heavy animation tuning yet.

### Day 24 — 3D Car Scene
- Add a lightweight Three.js / React Three Fiber car/parking scene or suitable project-owned asset.
- Add loading and fallback states; test desktop/mobile performance.
- **Deliverable:** working 3D hero visual.

### Day 25 — Scroll-Triggered Storytelling
- Implement GSAP + ScrollTrigger scale, position, subtle rotation, and scene progression.
- Ensure cleanup, no scroll hijacking, and reduced-motion fallback.
- **Deliverable:** coherent scroll-linked car animation.

## Phase 6 — Polish, Verification, and Delivery

### Day 26 — Motion and Theme Polish
- Use Motion for React for buttons, dialogs, navigation, slot selection, and theme toggle.
- Ensure animation ownership does not conflict with GSAP.
- **Deliverable:** consistent, restrained micro-interactions.

### Day 27 — Responsive and Accessibility Pass
- Test desktop/tablet/mobile layouts, keyboard navigation, focus states, contrast, labels, and reduced motion.
- **Deliverable:** responsive/accessibility fixes.

### Day 28 — Security and Edge-Case Pass
- Test authorization, ownership, SQL parameterization, input validation, rate limiting, conflict handling, and secret hygiene.
- **Deliverable:** resolved high-priority issues and recorded limitations.

### Day 29 — End-to-End QA and Bug Fixes
- Test customer and admin workflows, reservation concurrency, session fees, demo payments, reports, and error states.
- Fix reproducible issues in scope.
- **Deliverable:** completed QA checklist and test results.

### Day 30 — Documentation and Final Demonstration
- Finalize setup instructions, environment example, API notes, ERD/schema scripts, demo workflow, and known limitations.
- Verify build and available automated tests.
- Prepare a concise presentation/demo checklist.
- **Deliverable:** reproducible project handoff and demonstration-ready build.

---

## Definition of Done for Each Day

- Only that day's scope was executed.
- Existing unrelated functionality remains intact.
- Relevant checks/tests were actually run and results reported accurately.
- No secrets or real credentials were added.
- DESIGN.md and approved Stitch exports remain the visual source of truth.
- Any blocker is stated concisely.
- Agent stops after the completion report.
