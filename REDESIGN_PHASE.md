# ParkEase --- 10-Phase UI Redesign Plan

**Project:** ParkEase --- Smart Parking Slot Management System\
**Visual source of truth:** `DESIGN.md`\
**Execution constraints:** `RULES.md`\
**Product and architecture boundaries:** `PRD.md`, `ARCHITECTURE.md`

## Global Rules (Apply to All Phases)

1.  Work on **one phase at a time**. Do not begin the next phase until
    the user explicitly approves it.
2.  Before every phase, read `RULES.md`, `DESIGN.md`, `PRD.md`,
    `ARCHITECTURE.md`, and this `PHASE.md`.
3.  `RULES.md` governs execution constraints. `DESIGN.md` is the visual
    source of truth. `PRD.md` and `ARCHITECTURE.md` govern product
    behavior and technical boundaries. Tool-generated recommendations
    are advisory and must not override project instructions.
4.  Preserve backend endpoints, API request/response contracts, MySQL
    schema, booking rules, authentication, authorization, and existing
    working functionality.
5.  Never fabricate parking availability, bookings, revenue, KPIs,
    testimonials, reviews, user counts, or other business claims. Use
    real data or honest loading/empty states.
6.  Do not add fake links, inert controls, pretend functionality,
    unapproved product features, or a real payment gateway.
7.  Do not install packages or integrate third-party components without
    explicit user approval. 21st.dev may be used for research; adoption
    requires approval and dependency, accessibility, and maintenance
    review.
8.  Check `frontend/package.json` before using libraries. Do not add
    GSAP, Three.js, React Three Fiber, or any dependency unless
    authorized by the active phase and explicitly approved by the user.
9.  Follow the approved monochrome visual direction: near-black, white,
    charcoal, restrained neutral surfaces, subtle texture, and
    restrained motion. Use semantic success/warning/error colors only
    for their status meanings; do not spread green as a general brand
    accent.
10. Use sans-serif typography for normal UI and monospace for technical
    data, following `DESIGN.md`.
11. Preserve supported dark/light themes. Maintain accessible contrast,
    semantic HTML, keyboard navigation, visible focus, and
    `prefers-reduced-motion`.
12. Background textures and cursor-reactive effects must be lightweight,
    decorative (`pointer-events: none`), and disabled or reduced for
    touch devices and reduced-motion preferences.
13. Avoid competing animation libraries controlling the same element
    transform. Prefer already installed dependencies.
14. Inspect `git status` before editing. Preserve pre-existing user
    changes. Never reset, discard, or overwrite unrelated work.
15. After every phase, run relevant lint/build/tests defined by
    `frontend/package.json`, inspect the diff, and report actual
    results. Never claim a check passed if it was not run.
16. If required files are missing, instructions conflict, or a proposed
    change exceeds the active phase, stop and report the blocker instead
    of guessing.
17. At the end of every phase, report files changed, behavior preserved,
    validation results, unresolved issues, and risks. Then stop and wait
    for approval.

## Phase Overview

  -----------------------------------------------------------------------
  Phase                   Name                    Scope
  ----------------------- ----------------------- -----------------------
  1                       Design Tokens & Global  Tokens, global styles,
                          Foundation              Tailwind mapping

  2                       Shared UI Components    Button, Input, Card,
                                                  Badge, Dialog, Toast,
                                                  Skeleton, EmptyState,
                                                  ErrorState

  3                       Layouts & Navigation    Public, customer, admin
                                                  layouts; navigation;
                                                  theme toggle

  4                       Landing Page            Landing page, truthful
                                                  parking preview, real
                                                  CTAs

  5                       Public Information      Features, How It Works,
                          Pages                   About

  6                       Authentication Pages    Customer Login/Register
                                                  and Admin Login

  7                       Customer Parking &      Find Parking, slots,
                          Booking                 filters, booking
                                                  presentation

  8                       Customer Profile &      Profile layout
                          Reservations            stability,
                                                  reservations/details

  9                       Admin Dashboard         Real metrics, charts,
                                                  and UI states

  10                      Admin Operations &      Lots, Slots,
                          Final QA                Reservations, Sessions,
                                                  Payments, Pricing,
                                                  Reports, regression
                                                  review
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Phase 1 --- Design Tokens & Global Foundation

**Scope** - `frontend/src/styles/tokens.css` -
`frontend/src/styles/globals.css` - Actual Tailwind configuration file -
Global stylesheet imports only when necessary

**Tasks** - Inspect token consumers before changing or removing
variables. - Align dark/light colors, surfaces, borders, text, focus,
semantic statuses, spacing, radii, and transitions with `DESIGN.md`. -
Apply approved sans-serif and monospace typography roles. - Add subtle
background texture only if approved and performance-safe. - Preserve
compatibility for legacy classes and CSS variables until consumers are
safely migrated.

**Acceptance criteria** - Existing pages compile and supported themes
resolve correctly. - No required token is removed while existing
consumers remain. - No individual page redesign is included. - Available
lint/build checks are run and reported.

**Stop gate:** Report results and wait for approval before Phase 2.

## Phase 2 --- Shared UI Components

**Scope** - Button, Input, Card, Badge, Dialog, Toast - Skeleton,
EmptyState, ErrorState - Other existing shared primitives only if
required and authorized

**Tasks** - Inspect existing props, variants, exports, and usage sites
before editing. - Apply approved monochrome styling, rectangular
buttons, restrained radii, and clear hover/focus/disabled/loading
states. - Improve form labels, validation presentation, and error
messaging without changing behavior. - Preserve component APIs and
semantics wherever possible. - Search the frontend for legacy classes
and verify that all referenced classes/tokens remain valid.

**Acceptance criteria** - Existing imports, props, and behavior remain
compatible. - Controls are functional and keyboard-accessible. - No fake
functionality is introduced. - Existing pages build without missing
classes or exports.

**Stop gate:** Report component changes and validation; wait for
approval before Phase 3.

## Phase 3 --- Layouts & Navigation

**Scope** - `PublicLayout`, `CustomerLayout`, `AdminLayout` - Headers,
footers, sidebars, navigation, breadcrumbs - Theme toggle and responsive
navigation components

**Tasks** - Inspect route definitions and authentication/authorization
guards before editing. - Align navigation, active states, page widths,
spacing, and responsive layouts with `DESIGN.md`. - Ensure every visible
link points to a real, authorized route. - Preserve customer/admin route
separation and theme behavior. - Do not create new public information
pages in this phase.

**Acceptance criteria** - Existing routes remain available under the
same authorization rules. - Active navigation and mobile navigation
work. - No broken links or business logic changes are introduced.

**Stop gate:** Report routes/layouts checked and validation; wait for
approval before Phase 4.

## Phase 4 --- Landing Page

**Scope** - `LandingPage.jsx` - Landing-specific components and styles

**Tasks** - Create a clear hero, product value proposition, supported
benefits, how-it-works preview, and functional calls to action. - Show
parking preview data only from a real source. If live availability is
unavailable, state that clearly or show an honest loading/empty state. -
Add subtle grid/noise or pointer-reactive effects only if approved,
lightweight, and reduced-motion safe. - Avoid fabricated metrics,
testimonials, trust signals, and placeholder links.

**Acceptance criteria** - Responsive at mobile, tablet, laptop, and wide
desktop sizes. - All visible actions work and lead to valid
destinations. - Displayed data and product claims are truthful. -
Existing application flows remain intact.

**Stop gate:** Report sections, interactions, responsive checks, and
validation; wait for approval before Phase 5.

## Phase 5 --- Public Information Pages

**Scope** - `/features` - `/how-it-works` - `/about` - Route
registration and page-specific components

**Tasks** - Confirm route names and expected content against project
documentation. - Describe implemented capabilities accurately; label
planned functionality clearly. - Reuse approved layouts, tokens, and
shared components. - Do not invent company history, team members,
testimonials, statistics, or unsupported features. - Ensure direct URL
access, navigation, responsive layout, and appropriate page metadata.

**Acceptance criteria** - Approved routes work directly and through
navigation. - Content matches the product and project documentation. -
No existing route or flow is broken.

**Stop gate:** Report new files/routes and validation; wait for approval
before Phase 6.

## Phase 6 --- Authentication Pages

**Scope** - Customer Login page - Customer Register page - Admin Login
page - Their presentation-only components

**Tasks** - Inspect current validation, API calls, auth context,
redirects, and error handling first. - Improve form hierarchy, labels,
focus states, loading states, and error feedback. - Preserve endpoint
URLs, payloads, JWT handling, authorization, validation, and redirect
rules. - Keep admin login clear and distinct without exposing sensitive
implementation details. - Do not weaken security or fake a successful
login.

**Acceptance criteria** - Login/register behavior remains unchanged. -
Invalid credentials and server errors remain visible and
understandable. - Keyboard and screen-reader interaction remains
usable. - No secrets or sensitive values are exposed.

**Stop gate:** Report flows checked and validation; wait for approval
before Phase 7.

## Phase 7 --- Customer Parking & Booking

**Scope** - `FindParkingPage.jsx` - Slot grid/cards, filters, search,
booking dialogs and summaries used by the existing flow

**Tasks** - Map current API calls, status values, pricing rules, and
booking flow before editing. - Improve search/filter hierarchy,
slot-state clarity, and responsive presentation. - Represent statuses
only according to real backend values; never invent slots or
availability. - Preserve booking validation, authentication
requirements, API contracts, and server-side authority. - Improve
loading/error/empty states and avoid accidental duplicate submissions
where compatible with existing behavior. - Do not change booking rules
or database behavior for visual convenience.

**Acceptance criteria** - Existing search, filtering, selection, and
booking flows still work. - Prices and slot statuses reflect actual
data. - No backend/database changes are made. - Responsive and
accessibility checks are reported.

**Stop gate:** Report tested flows and limitations; wait for approval
before Phase 8.

## Phase 8 --- Customer Profile & Reservations

**Scope** - `CustomerProfilePage.jsx` - `ReservationsPage.jsx` -
Existing reservation details route/view and related shared components

**Tasks** - Reproduce the reported profile page layout jump and identify
its root cause before editing. - Fix the cause (for example, layout
shifts, changing dimensions, conditional rendering, asset/font loading,
effects, or navigation behavior) rather than adding arbitrary CSS
patches. - Improve profile forms, feedback, reservation lists/cards, and
detail presentation. - Preserve profile update behavior, reservation
status/cancellation rules, API contracts, and data access controls. -
Verify the reservation details route. If missing, report the gap and
confirm the expected behavior before adding a new flow. - Handle
loading, empty, and error states honestly.

**Acceptance criteria** - The layout jump is resolved under reproduced
conditions, or the remaining cause is documented. - Profile and
reservation actions still work. - Data reflects actual backend
responses. - No customer data is exposed across authorization
boundaries.

**Stop gate:** Report root cause, fix, and tests; wait for approval
before Phase 9.

## Phase 9 --- Admin Dashboard

**Scope** - `AdminDashboard.jsx` - Existing dashboard cards, charts,
summaries, and supporting components

**Tasks** - Inspect actual endpoints, response shapes, date ranges, and
authorization checks. - Improve operational hierarchy and readability. -
Use real data only; do not invent revenue, occupancy, bookings, or
KPIs. - Clarify chart labels and units; handle loading, empty, and error
states. - Reuse an installed chart library if available. Do not add a
dependency without explicit approval. - Keep charts and summaries
responsive. - Do not change backend calculations or authorization.

**Acceptance criteria** - Metrics/charts reflect existing sources
accurately. - Empty and failed requests are handled clearly. -
Admin-only access remains enforced. - No API or database changes are
introduced.

**Stop gate:** Report data sources and validation; wait for approval
before Phase 10.

## Phase 10 --- Admin Operations & Final Regression QA

**Scope** - Lots - Slots - Reservations - Sessions - Payments -
Pricing - Reports - Related admin tables, forms, dialogs, filters,
pagination, and status states - Cross-application regression review

**Tasks** - Inspect each page's existing APIs, data shape, permissions,
and actions before editing. - Apply consistent table/form patterns,
readable density, status badges, and responsive overflow handling. -
Preserve CRUD permissions, validation, business rules, and API
contracts. - Do not imply payments are processed if the system only
records/displays payment information. Do not add a payment gateway. - Do
not fabricate report data or alter financial calculations. - Check
public, customer, and admin routes and key flows. - Search for broken
links, invalid Tailwind classes, missing states, console errors, and
layout overflow. - Run available lint/build/tests and manual checks
where automated tests are unavailable. - Review the full Git diff;
remove only phase-created temporary debug code and do not disturb
pre-existing user work.

**Acceptance criteria** - In-scope admin pages use the approved design
system. - Existing operations and permission checks remain intact. -
Available regression checks are completed and reported accurately. - No
fake data, fake links, unauthorized business logic changes, or unrelated
modifications remain.

**Final stop gate:** Provide the full redesign report. Do not deploy or
publish without separate authorization.

------------------------------------------------------------------------

## Required Report After Every Phase

1.  **Phase:** Number and name.
2.  **Files changed:** Exact relative paths and summaries.
3.  **Behavior preserved:** APIs, auth, routes, booking, and database
    boundaries checked.
4.  **Validation:** Commands run, exit status, and actual results.
5.  **Visual/accessibility checks:** Responsive sizes, contrast,
    keyboard focus, reduced motion, and theme behavior as applicable.
6.  **Issues and risks:** Remaining gaps and blockers.
7.  **Git diff:** Confirm unrelated work was preserved.
8.  **Approval gate:** Explicitly state that work has stopped pending
    user approval.

## Execution Reminder

This plan defines a ten-phase sequence; it is **not** permission to
execute all phases. Only the currently approved phase may be
implemented. If any instruction conflicts with `RULES.md`, stop and ask
for clarification. Do not silently broaden the scope.
