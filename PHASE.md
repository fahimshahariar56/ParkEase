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

# ParkEase — Day 25: Premium Realistic 3D Car Scene Upgrade

Act as a senior Three.js / React Three Fiber engineer, automotive 3D artist, and premium automotive UI/UX designer.

## Objective

The existing ParkEase project already contains a 3D car scene. **Do not build an entirely new scene from scratch. Inspect and upgrade the existing implementation** into a premium, realistic, interactive automotive experience suitable for a modern smart parking SaaS platform.

The result should feel like a real luxury car parked inside a premium parking facility—not a cartoon, low-poly model, or basic 3D demo.

### 1. Upgrade the Existing Car Model

Transform the existing car visual into a highly realistic, white, Rolls-Royce-inspired luxury sedan.

Visual requirements:

* Elegant white luxury-car body with realistic proportions.
* Premium glossy white automotive paint with physically believable reflections.
* Detailed front grille, headlights, rear lights, side mirrors, windows, doors, door handles, and body panels.
* Realistic black tires, detailed alloy rims, and visible wheel arches.
* Metallic chrome accents and premium automotive trim.
* Realistic glass reflections and subtle interior visibility.
* Properly modeled wheel geometry and tire proportions.
* Natural highlights and shadows across the body.
* Luxury automotive photography quality.

The car should resemble a real premium sedan rather than a simplified 3D object.

**Asset strategy:**

1. Inspect the existing model, scene, assets, and rendering setup first.
2. If a suitable GLB/GLTF model already exists, improve its materials, lighting, camera, and environment before replacing it.
3. If the current model cannot deliver the required realism, use a suitable, legally usable, optimized 3D luxury-sedan asset.
4. Prefer GLB/GLTF assets with PBR materials and optimized geometry.
5. If external assets cannot be used, improve the existing model as much as possible without introducing fake realism through excessive effects.
6. Do not invent a complex replacement model using primitive shapes and claim it is photorealistic.
7. Avoid unauthorized logos, badges, or trademarked branding. The vehicle should be Rolls-Royce-inspired without falsely presenting itself as an official branded asset.

### 2. Make the Car Fully Interactive

The car must respond naturally to mouse and touch interactions.

**Mouse interaction:**

* Drag horizontally to rotate the car around its vertical axis.
* Allow the user to inspect the front, sides, rear, and other angles.
* Support smooth 360-degree rotation.
* Vertical dragging should provide limited, controlled orbit movement when appropriate.
* Add subtle inertia so rotation feels smooth and premium.
* Use damping to avoid abrupt movement.
* Prevent the camera from flipping upside down.
* Add sensible minimum and maximum camera distances.
* Keep the car centered and visible throughout the interaction.

**Hover interaction:**

* Add a subtle visual response when the cursor enters the car scene.
* Use restrained lighting or reflection changes rather than exaggerated neon effects.
* Display an appropriate grab/grabbing cursor while interacting.

**Touch interaction:**

* Support drag-to-rotate on mobile and tablets.
* Avoid blocking normal page scrolling unnecessarily.
* Ensure the interaction remains usable on smaller screens.

Use the existing camera-control solution where practical. If needed, use `OrbitControls` or an appropriate React Three Fiber-compatible alternative.

### 3. Build a Realistic Parking Environment

The car should visibly sit inside a premium parking area.

Improve the environment with:

* A realistic parking-floor surface.
* Subtle parking bay markings.
* Accurate contact shadows beneath the tires.
* Ambient occlusion where supported.
* Soft directional lighting.
* Reflections on the glossy white paint.
* A tasteful modern parking-facility background.
* Proper floor-to-tire contact so the vehicle never appears to float.
* A restrained background that keeps attention on the car.

The environment should visually communicate that this is a car parked inside ParkEase's smart parking system.

Keep the scene sophisticated, minimal, and consistent with the existing website's design system.

Do not add excessive props, bright neon colors, or distracting environmental details.

### 4. Add a Premium Under-Wheel Boost Animation

Create a refined animated effect beneath the car's wheels.

The animation should communicate smart parking technology becoming active.

Requirements:

* Add a subtle, circular energy ring, radial light pattern, or controlled floor illumination beneath the wheels.
* Animate the effect smoothly with a restrained pulse.
* Allow the illumination to spread gently across the parking floor.
* Add subtle particles or scanning lines only if they improve the overall result.
* Coordinate the effect with the lighting and shadows.
* Keep the tires grounded and visually connected to the floor.
* Avoid making the car look like it is flying or floating.
* Do not use excessive bloom, oversized neon rings, or aggressive sci-fi effects.

The animation should feel like a premium automotive-tech interface.

**Interaction behavior:**

* The floor effect may activate gently when the scene loads.
* Hovering over or interacting with the car may trigger a slightly stronger pulse.
* The animation should remain subtle during idle periods.
* Respect `prefers-reduced-motion` and provide a static visual alternative.

### 5. Improve Camera and Composition

Create a premium automotive showcase composition.

* Use a cinematic three-quarter front view as the initial camera position.
* Keep the full car visible without clipping the wheels, roof, or bumpers.
* Maintain appropriate proportions and perspective.
* Use a perspective camera only if it improves the automotive presentation.
* Keep the vehicle's visual center balanced within the available hero section.
* Prevent the car from overlapping important text, buttons, or navigation.
* Ensure the composition adapts to the existing landing-page layout.
* Make the car visually prominent without overwhelming the page.

The initial camera angle should immediately showcase the front grille, headlights, side profile, and premium bodywork.

### 6. Upgrade Lighting and Materials

Use realistic PBR rendering techniques.

Where appropriate:

* Use physically correct lighting and material settings.
* Configure environment reflections for the white paint and metallic trim.
* Improve shadow softness and contact shadows.
* Tune roughness and metalness separately for paint, chrome, glass, rubber, and alloy wheels.
* Avoid pure-white clipping that removes body details.
* Preserve realistic contrast between the white body, dark tires, glass, and metallic components.
* Use tone mapping and color-space settings appropriate for the existing rendering pipeline.

Do not add expensive post-processing effects without measuring their impact.

### 7. Performance and Responsive Behavior

The 3D scene must remain practical for a real production website.

Requirements:

* Reuse the existing Three.js / React Three Fiber architecture.
* Avoid unnecessary dependencies.
* Optimize geometry, materials, textures, and draw calls.
* Use optimized GLB/GLTF assets where possible.
* Prevent unnecessary React re-renders during pointer movement and animation.
* Clean up event listeners, animation resources, and GPU resources where appropriate.
* Avoid memory leaks.
* Provide a meaningful loading state.
* Provide a graceful fallback if WebGL or the 3D asset fails.
* Test the scene on desktop, tablet, and mobile layouts.
* Reduce unnecessary rendering work when the scene is not visible, where practical.
* Respect reduced-motion preferences.
* Keep text, buttons, and navigation responsive and usable while the 3D scene loads.

Do not sacrifice the website's basic functionality for visual effects.

### 8. Preserve the Existing Project

Before implementation:

1. Inspect the current repository structure.
2. Locate the existing Day 25 3D car scene and its related components.
3. Read `ANIMTION.md` and follow its applicable animation requirements.
4. Review `DESIGN.md` and the existing design tokens and approved visual references.
5. Identify the current Three.js / React Three Fiber / Drei setup.
6. Review existing camera controls, car assets, lighting, and animations.
7. Identify the relevant phase restrictions and avoid changing unrelated features.

Then upgrade the existing scene in place.

Do not:

* Replace the entire landing page.
* Rewrite unrelated components.
* Change authentication, reservations, payments, or database logic.
* Remove existing working animations without a clear reason.
* Introduce placeholder buttons or nonfunctional interactions.
* Modify unrelated files just to simplify the implementation.

Preserve the current architecture and existing working functionality.

### 9. Acceptance Criteria

Consider Day 25 complete only when:

* [ ] The existing car scene has been upgraded rather than unnecessarily recreated.
* [ ] The car has a premium white luxury-sedan appearance.
* [ ] Materials, lighting, reflections, and shadows look convincing.
* [ ] The car appears properly parked on the parking surface.
* [ ] Users can rotate the car by dragging with a mouse.
* [ ] Touch-based rotation works on mobile.
* [ ] Camera movement is smooth and properly constrained.
* [ ] An animated boost/light effect appears beneath the wheels.
* [ ] The boost effect is subtle and does not make the car appear to float.
* [ ] The scene integrates with the existing ParkEase landing page.
* [ ] Loading and fallback states work.
* [ ] Desktop and mobile performance have been checked.
* [ ] Reduced-motion preferences are respected.
* [ ] Existing routes and unrelated features remain functional.
* [ ] No new console errors or avoidable rendering problems remain.

### Final Instruction

Prioritize **realistic automotive visuals, natural mouse interaction, convincing floor contact, premium lighting, and polished animation** over unnecessary visual effects.

Implement the changes in the existing codebase, run the available checks, and verify the actual rendered result.

At completion, provide a concise summary of:

1. What was changed.
2. Which components and assets were modified.
3. How car rotation and the under-wheel animation work.
4. Performance and responsive checks performed.
5. Any remaining limitations or compromises.

Do not claim photorealistic quality unless the actual model and rendered result justify that description.


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
