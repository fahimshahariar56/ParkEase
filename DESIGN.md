# ParkEase — Premium UI/UX Design Specification

> **Product:** ParkEase — Smart Parking Slot Management System  
> **Document:** `DESIGN.md`
> **Purpose:** Single source of truth for UI design, visual identity, layouts, interactions, responsive behavior, and motion implementation.

---

## 1. Product Vision

Design ParkEase as a carefully art-directed, premium automotive-tech SaaS product. The visual identity is primarily **black, white, charcoal, and cool neutral gray**, with a restrained dark mood, refined contrast, tactile surfaces, and purposeful motion. The product should feel as considered as a high-quality developer tool or modern mobility brand—not like a generic AI-generated landing page.

**Design keywords:** monochrome, premium, minimal, editorial, precise, tactile, quietly cinematic, trustworthy, accessible, responsive.

**Avoid:** generic dashboard templates, excessive glassmorphism, random gradients, neon overload, cluttered layouts, pill-shaped controls everywhere, redundant cards, fake data presented as live data, and animation without a functional purpose.

### Design-direction precedence
This updated specification supersedes earlier conflicting color, typography, button-shape, and visual-texture guidance in this document. Keep existing product functionality and architecture. Use the actual repository and current `PHASE.md` as the source of truth for functional scope.

### Part 1 shared foundation

The current shared foundation is implemented in `frontend/src/styles/tokens.css`, `frontend/src/styles/globals.css`, and `frontend/src/components/ui/`. It uses semantic CSS variables with Tailwind mappings, a shared canvas-based constellation grid behind routed content, dark as the default theme with a saved light/dark choice, and reusable button, input, card, badge, dialog, toast, skeleton, empty, and error primitives. Motion-based shared interactions must honor `prefers-reduced-motion`.

`ConstellationGrid` is mounted once beside the router and reads the active theme tokens. It draws a low-contrast particle grid and local neighbor connections on a DPR-aware canvas with a 30fps desktop animation cap. The landing page uses the highest density/intensity; authentication and admin routes use reduced settings. Its fixed canvas has `pointer-events: none` and `aria-hidden`, so it cannot block controls or keyboard use. Mouse movement gently repels and highlights nearby particles; fast movement adds a short, restrained ripple. Motion pauses when the document is hidden. Coarse-pointer and reduced-motion environments render a sparse static grid without cursor interaction. If canvas context creation is unavailable, the semantic page background remains usable.

The landing footer's `PARKEASE` halftone is drawn within a responsive canvas inset: the fitted word uses at most 88% of the canvas width, with a reserved bottom baseline and additional footer-content padding so no outer glyphs are clipped. Public, customer, and admin page changes use Motion for React at their shared layout outlets; the standalone admin login has its own transition. The router remains inside a stable app wrapper to prevent overlapping route transitions during protected-route redirects. Transitions use a 240ms opacity/vertical movement and respect reduced-motion preferences.

### Core user journeys

1. Visitor lands on the website, understands the product, and clicks **Find Parking**.
2. Customer signs in or registers, finds an available slot, selects a vehicle and time, and confirms a reservation.
3. Customer opens their profile to manage personal information and vehicles and review reservations.
4. Admin signs in and manages parking lots, slots, reservations, parking sessions, pricing, customers, and reports.

---

## 2. Required Pages and Information Architecture

The following seven screen types are required. Landing, Admin Dashboard, and Customer Parking are the three primary product experiences.

| Page | Route suggestion | Purpose |
|---|---|---|
| 1. Landing Page | `/` | Product introduction, cinematic 3D hero, features, and CTA |
| 2. Admin Dashboard | `/admin` | Parking operations and system overview |
| 3. Customer Parking / Find Parking | `/parking` | Search availability and reserve a slot |
| 4. Customer Profile | `/profile` | Profile, vehicles, and reservation history |
| 5. Login | `/login` | Secure sign-in for customer and admin |
| 6. Registration | `/register` | Customer account creation |
| 7. Reservation Confirmation / Details | `/reservations/:id` | Reservation summary and demo-payment status |

Use shared components and layouts. Keep Admin and Customer navigation clearly separated. Hide admin-only navigation from customers and protect admin routes according to the authenticated role.

### Global navigation

**Public navigation**
- ParkEase logo
- Features → dedicated `/features` page
- How It Works → dedicated `/how-it-works` page
- About → dedicated `/about` page
- Theme toggle
- Sign In → `/login`
- Primary CTA: **Find Parking** → `/parking` or the existing intended auth-aware route
- On mobile, use a left-side overlay drawer consistent with the admin navigation pattern; trap focus, close on Escape/backdrop/navigation, and restore focus to the menu trigger.

The landing page ends with a theme-aware halftone **PARKEASE** wordmark footer. It uses the existing Inter/JetBrains Mono stacks, monochrome theme tokens, accessible real route links, and a lightweight canvas that becomes static under reduced motion or coarse-pointer input.

Every visible navigation link must lead to a real, intentional destination. If a link is presented as a page link, implement a dedicated route and meaningful page content. Do not leave dead anchors, `href="#"`, or multiple links pointing to the same generic page just to appear complete. Audit the current router before adding routes, reuse shared layouts, and preserve existing route behavior. For routes that require authentication, redirect to the appropriate login page and preserve a safe return path where supported.

**Customer navigation**
- Overview
- Find Parking
- My Reservations
- My Vehicles
- Profile
- Theme toggle
- Sign Out

**Admin sidebar**
- Overview
- Parking Lots
- Parking Slots
- Reservations
- Entry / Exit
- Customers
- Pricing Rules
- Reports
- Settings / Sign Out

Navigation should remain easy to understand on desktop and collapse into an accessible mobile menu on small screens.

---

## 3. Visual Identity and Color System

### Art direction: monochrome first

Build the core visual system from white, black, charcoal, and neutral gray. The dark theme is the signature mood; the light theme is a crisp white-and-black counterpart, not a simple inversion. Use brand color only for meaningful status, selected states, and a small number of primary actions. Keep the UI mostly monochrome.

| Token | Hex | Usage |
|---|---|---|
| `color.bg.dark` | `#08090B` | Main dark-theme background |
| `color.surface.dark` | `#101114` | Cards, navigation, panels |
| `color.surface.raised.dark` | `#17191D` | Raised surfaces and active hover states |
| `color.border.dark` | `#292B30` | Low-contrast borders and separators |
| `color.text.dark` | `#F5F5F5` | Primary text on dark backgrounds |
| `color.text.muted.dark` | `#A1A1AA` | Secondary text on dark backgrounds |
| `color.bg.light` | `#FAFAFA` | Main light-theme background |
| `color.surface.light` | `#FFFFFF` | Forms, cards, panels |
| `color.surface.subtle.light` | `#F1F1F2` | Secondary light surfaces |
| `color.border.light` | `#E4E4E7` | Light-theme borders |
| `color.text.light` | `#111113` | Main text on light backgrounds |
| `color.text.muted.light` | `#62626B` | Secondary text on light backgrounds |
| `color.accent` | `#D4FF4F` | Optional restrained acid-lime accent, only if it fits existing brand assets; do not spread it across the UI |
| `color.success` | `#16A34A` | Positive state, paired with a readable label |
| `color.warning` | `#D97706` | Pending / attention |
| `color.error` | `#DC2626` | Errors / unavailable state |
| `color.info` | `#2563EB` | Informational state |

If existing project assets or established semantic tokens require a different accent, preserve them and explain the decision. Do not introduce an accent merely for decoration. Emerald may remain as a semantic success color, but must not dominate the overall brand palette.

### Semantic status colors

Status must always include a readable label or icon—not color alone.
- Available: subtle green/success indicator and text label
- Reserved / Pending: restrained amber indicator
- Occupied / Unavailable: muted red or neutral disabled treatment
- Maintenance: gray/slate
- Confirmed / Completed: green/success
- Cancelled / Failed: red/error
- Informational: blue/info

### Constellation Grid background

`frontend/src/components/ui/constellation-grid.jsx` provides one shared, decorative canvas mounted beside the router. It draws muted particles and short local neighbor connections using the active `--color-text` and `--color-text-muted` theme tokens; it replaces the prior static CSS dot grid. Route-level density and intensity are strongest on the landing page and restrained on authentication and admin routes.

- Cap desktop animation at 30fps; use a DPR-aware canvas capped at 2x and connect only nearby grid neighbors.
- On desktop mouse movement, gently repel and highlight nearby particles; fast movement adds a short, muted ripple. Keep the effect monochrome and behind content.
- Set `pointer-events: none` and `aria-hidden`; never intercept controls, keyboard focus, scrolling, text selection, or navigation.
- Pause while the document is hidden. Coarse-pointer and `prefers-reduced-motion` environments use a sparse static grid with no cursor interaction.
- If a 2D canvas context is unavailable, retain the normal themed page background and full application functionality.
- Do not add WebGL, large cursor-following blobs, neon glow, or unnecessary dependencies.

### Color rules
- Black/white/gray should dominate the design.
- Accent colors are for meaning and focus—not decoration.
- Use thin borders, tonal surfaces, and restrained shadows instead of heavy outlines.
- Design dark and light modes intentionally and check contrast in both.
- Avoid large gradient backgrounds, bright neon, and glowing edges on every component.

---

## 4. Typography

Use a purposeful two-font system:
- **Inter** is the primary face for body copy, navigation, forms, buttons, and headings. UI/UX Pro Max's “Modern Dark Cinema” pairing identifies Inter as suitable for premium, technical, dark utility products; it also matches the existing Tailwind and CSS tokens.
- **JetBrains Mono** is reserved for slot IDs, timestamps, reservation identifiers, code, and selected data labels. It is already part of the project and avoids turning the whole interface into monospace.
- Load both families from the existing Google Fonts setup with `display=swap`, and retain the system fallbacks in `tokens.css`. Do not add a display face or font package without a concrete need.

Suggested hierarchy:
- Display / hero heading: 52–76px desktop; 38–48px mobile, medium/semibold rather than automatically extra-bold
- Page heading: 28–36px
- Section heading: 20–28px
- Card heading: 16–18px
- Body: 14–16px, line-height around 1.55–1.7
- Labels / metadata: 12–13px
- Dashboard KPI numbers: 28–36px, tabular numerals where available

Keep line lengths comfortable, avoid overly tight tracking on body text, and use weight/size/spacing—not color alone—to establish hierarchy.

---

## 5. Layout, Spacing, and Component Shape

Use a consistent spacing scale based on 4px: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96`.

- Main content max width: approximately 1200–1440px where appropriate.
- Desktop dashboard sidebar: approximately 232–256px.
- Page content padding: 24–32px desktop; 16–20px mobile.
- Use a clear grid and consistent alignment; do not wrap every section in a card.
- Prefer square or subtly rounded geometry over pill-shaped UI.
- Cards and panels: 8–14px radius where needed; some large editorial panels may use 16px if the design calls for it.
- Buttons and inputs: compact rectangular shape, typically 6–9px radius. Avoid fully rounded pill buttons except for small status badges or where an existing component convention is necessary.
- Tables and dashboard surfaces should use crisp edges, thin borders, subtle tonal changes, and restrained shadowing.
- Use consistent icon sizes and Lucide React icons if already installed or compatible.

### Premium square button system

Create a consistent set of rectangular buttons with clear hierarchy: primary, secondary, outline, ghost, danger, and icon-only. Buttons should feel tactile and deliberate. Icon-only controls require an accessible name.

- Default: high-contrast solid or outlined surface, precise border, clear label.
- Hover: short color/surface transition, slight border contrast shift, optional subtle 1–2px lift or icon movement; no large bounce or glow.
- Active: subtle pressed state with no layout shift.
- Focus: obvious keyboard focus ring with sufficient contrast.
- Disabled/loading: visibly distinct and non-interactive; preserve layout width to avoid jitter.
- Keep animation fast (roughly 140–220ms for most controls) and honor reduced-motion preferences.
- Never change a button's dimensions on hover.

### Core component library

Build/reuse consistent components for:
- Rectangular primary, secondary, outline, ghost, danger, and icon buttons
- Inputs, password fields, selects, checkboxes, radio controls, and search
- Cards/panels, badges, tooltips, tabs, breadcrumbs, and section headers
- Dialogs, dropdown menus, popovers, and toasts
- Data tables, filters, pagination, and empty states
- Sidebar, top navigation, mobile navigation, and theme toggle
- Parking-slot cards and slot-status indicators
- Reservation summary and simulated-payment status
- Skeleton loaders, error states, and confirmation panels

Every interactive control must have appropriate default, hover, focus-visible, active, disabled, loading, and error states.

### Implemented shared primitives

The existing UI exports `Button`, `Input`, `Card`, `Badge`, `Dialog`, `ToastProvider`, `Skeleton`, `CardSkeleton`, `Spinner`, `EmptyState`, and `ErrorState`. Buttons use 7px corners and include an icon-only variant; inputs use 6px corners; cards use a restrained 10px radius; pill geometry is reserved for status badges. Table styling is provided by the `.park-table` CSS utility. Native `<select>` controls remain the dropdown primitive; no separate custom menu component is currently implemented.

The token layer defines dark/light surfaces, text, semantic status colors, spacing, radii, shadows, and transition timing. Tailwind utilities consume these variables. The focus ring is visible, and shared Motion components disable or collapse their animation when reduced motion is requested.

---

## 6. Page 1 — Landing Page

### Goal

Create a high-impact, premium first impression and guide users to **Find Parking** or **Sign In**. The landing page should feel cinematic without sacrificing readability or performance.

### Header

- ParkEase wordmark / logo at the left
- Feature links in the center or right
- Animated dark/light theme toggle
- Sign In as a secondary action
- **Find Parking** as the primary high-contrast monochrome CTA; use accent color only if the established design system requires it
- Transparent or subtly blurred background at the top; use a readable solid/raised surface after scrolling if needed
- Responsive mobile menu with keyboard support

### Hero composition

- Headline: **“Your Space. Your Time. Smarter Parking.”**
- Short supporting copy explaining quick parking discovery and reservations
- Primary CTA: **Find Parking**
- Secondary CTA: **Explore How It Works**
- A central, premium 3D car / smart-parking scene
- Small supporting UI labels, such as “Smart Slot Discovery” or “Effortless Reservations,” without inventing live availability figures
- Strong hierarchy, generous negative space, and a clear focal point

### Scroll-triggered 3D car animation

The same 3D car object should evolve through the landing-page story rather than being replaced by unrelated decorative images.

1. **Hero start:** car is large and visually dominant, with a clean studio/parking-garage environment.
2. **Scroll begins:** the car gradually scales down, rotates subtly, and shifts position. Camera movement should support the motion.
3. **Feature section:** car moves toward one side while feature content reveals in a staggered sequence.
4. **Parking section:** scene transitions toward a simplified parking bay / slot visualization.
5. **Final CTA:** car settles into a balanced composition and the CTA becomes the focus.

Animation characteristics:
- Smooth continuous scale, position, rotation, and camera transitions.
- Use scroll progress as the driver; avoid abrupt jumps.
- Pin a section only if it materially improves the narrative. Do not hijack normal scrolling.
- Use easing and carefully planned start/end states.
- Do not let the car obscure headings, buttons, or accessibility controls.
- Support `prefers-reduced-motion`; provide a static hero fallback.
- Lazy-load the 3D scene and provide a poster/fallback while loading.
- On mobile or low-power devices, reduce geometry, effects, and motion or use a high-quality static/2.5D alternative.
- Keep the scene lightweight and avoid excessive particle effects or expensive real-time reflections.

### Landing sections

1. Hero with 3D car
2. Trust / product-value strip (avoid fabricated customer counts or claims)
3. Feature cards: Find Slots, Easy Reservations, Manage Vehicles, Track Sessions
4. How It Works: Discover → Select → Reserve → Park
5. Parking experience / slot-state preview
6. Benefits / product principles section
7. Parking slot preview: show only real API-backed data when available. If a public preview is needed before authentication, use clearly identified sample/demo preview data that cannot be mistaken for live availability. Show a small set of slots and a **Show more** action; when unauthenticated users click it, route them to `/login` with a safe return path. Do not imply a reservation can be completed without authentication.
8. Final CTA: **Find Your Parking Spot**
9. Footer with relevant links and project information

### Standalone marketing pages

Create dedicated pages for each public navigation item that is currently shown as a link but has no meaningful destination. At minimum, if those links are present in the actual design, provide `/features`, `/how-it-works`, and `/about`. Use the same shared public shell, typography, texture, and motion language. Keep the content accurate to existing functionality; do not invent integrations, customer counts, testimonials, availability, or unsupported features. If the existing router already has equivalent routes, improve and reuse them instead of duplicating.

Use GSAP + ScrollTrigger for the scroll-linked 3D choreography. Use Motion for React for buttons, menus, theme toggle, cards, and lightweight UI transitions. Avoid having both animation libraries control the same element.

---

## 7. Page 2 — Admin Dashboard

### Goal

A professional operations dashboard that prioritizes clarity, quick scanning, and efficient management. Match the same dark/light visual identity as the landing page.

### Layout

- Persistent left sidebar on desktop
- Compact top bar with page title, search if useful, notifications if implemented, theme toggle, and admin profile menu
- Main content area with responsive grid
- Sidebar collapses on tablet/mobile
- Use consistent section headings and clear action placement

### Overview content

Create metric cards for:
- Total parking slots
- Available slots
- Active parking sessions
- Current reservations
- Demo Revenue

Do not hardcode invented real-time metrics. Use actual API values or clearly identified seed/demo data. Label simulated earnings **“Demo Revenue”**, never simply “Revenue” if the value is simulated.

### Charts and activity

- Slot occupancy trend
- Reservation trend
- Demo-payment summary
- Recent reservations / parking activity
- Useful date filters and legends
- Clear no-data, loading, and error states

Charts must remain readable in both themes. Use accessible labels and avoid excessive colors.

### Admin modules

- **Parking Lots:** list, create, edit, view lot details
- **Parking Slots:** slot number, lot, type, and status
- **Reservations:** search, filters, status, time, customer, vehicle
- **Entry / Exit:** start and complete parking sessions
- **Customers:** searchable customer list and details
- **Pricing Rules:** hourly rates and active rules
- **Reports:** occupancy, reservations, sessions, and demo-payment reports
- **Settings:** only show settings that are actually supported

### Tables and forms

- Clear column labels and consistent row height
- Search and filters placed where expected
- Pagination for longer lists
- Confirm destructive actions
- Use dialogs or dedicated forms for create/edit operations
- Validate required fields and show helpful inline errors
- Keep actions discoverable but avoid multiple bright buttons per row

---

## 8. Page 3 — Customer Parking / Find Parking

### Goal

Make it easy for a customer to find a suitable slot and reserve it with confidence.

### Page layout

- Customer header / navigation
- Heading: **“Find Your Parking Spot”**
- Filters: parking lot/location, vehicle type, date, start time, end time, and slot availability as supported by the backend
- Clear list/grid of available slots
- Optional simplified lot layout if it can be represented accurately
- Selected-slot summary panel
- Primary CTA: **Reserve Slot**

### Slot card states

Each slot should show:
- Slot number
- Parking lot
- Slot type
- Availability / reservation status
- Price basis if supplied by the backend
- A clear selection state

Use visual states for available, reserved, occupied, and maintenance. Do not allow unavailable slots to be selected.

### Reservation flow

1. Customer chooses a time range and filters.
2. The system displays eligible slots.
3. Customer selects a slot and one of their vehicles.
4. A summary shows lot, slot, vehicle, reservation time, and applicable pricing.
5. Customer confirms the reservation.
6. Show a clear success screen and link to reservation details.

Availability must be based on backend data and reservation-time overlap logic—not merely a slot's current status. Handle conflicts gracefully if another user reserves the slot first.

### Empty and error states

- No slots available for the selected period
- Invalid date/time range
- Session expired / not signed in
- Reservation conflict
- Network/API error
- Loading skeletons

Provide a useful next action in every state.

---

## 9. Page 4 — Customer Profile

### Goal

Provide a clean, secure place to manage customer details, vehicles, and parking activity.

### Profile overview

- Profile avatar or initials
- Name, email, and phone where available
- Edit profile action
- Account creation date only if provided by the backend
- Clear form validation and save/cancel actions

### Vehicle management

- List registered vehicles
- Vehicle plate number and vehicle type
- Add, edit, and remove vehicle actions as supported
- Confirmation before removing a vehicle that is in use
- Empty state prompting the customer to add a vehicle

### Reservations and sessions

- Upcoming reservations
- Active parking session
- Past reservations
- Status badges and reservation details
- Links to view details or cancel where permitted

Never expose another customer's personal information or reservations. Customer-facing API requests must be authorized on the backend.


### Profile route stability and layout-jump prevention

The existing customer profile page has been reported to visibly jump/shift when opened. Treat this as a functional UX defect and diagnose the cause instead of masking it with animation.

- Inspect route transitions, nested layouts, React keys, conditional layout rendering, authentication/profile loading states, data-fetch effects, and scroll restoration.
- Keep the shared customer shell/sidebar/header mounted when navigating between customer routes where the current architecture supports it.
- Avoid remounting the whole application or changing layout dimensions after profile data loads.
- Reserve space for avatars, loading placeholders, and asynchronously loaded profile/vehicle sections to reduce cumulative layout shift.
- Keep loading, error, and loaded states structurally consistent; use skeletons that match the final geometry.
- Check for duplicate effects, unstable keys, content-driven sidebar resizing, late font swaps, and transitions that animate the page container itself.
- Preserve the intended route scroll position; do not force scroll-to-top on every nested customer navigation unless the route design requires it.
- Do not apply arbitrary `position: fixed`, fixed heights, or CSS hacks without identifying the cause.

Root cause found in `CustomerProfilePage`: the first render showed cached profile content because `isProfileLoading` began as `false`, then the mount effect switched to a skeleton. The profile request also called `login()` with its response while the fetch callback depended on the auth `user`; replacing that user object could run the effect again. Vehicle loading similarly depended on the fetched vehicle count and could repeat after the first response. The page now starts in loading state with a profile-shaped skeleton, keeps GET results local instead of rewriting auth state, and makes both fetch callbacks depend only on the token. A failed profile request keeps cached account details when available and shows an explicit retryable error. The shared customer layout remains mounted; protected-route redirects are handled without an app-wide presence transition that can repeatedly render a redirecting route.
- Verify direct navigation, internal navigation, refresh, and slow API response behavior on `/profile` and adjacent customer routes.

---

## 10. Page 5 — Login

### Visual layout

Use a premium, minimal split layout on desktop:
- One side: ParkEase brand, short welcome message, subtle parking visual or abstract 3D accent
- Other side: focused sign-in form on a clean surface
- On mobile, use a single-column layout
- Include theme toggle without distracting from the form

### Form elements

- Email
- Password with show/hide control
- Sign In button with loading state
- Link to Register
- Clear validation and server-error feedback

Do not add a fake social-login button or unsupported “forgot password” flow. If password reset is not implemented, do not imply that it works.

Admin and customer access must be role-aware. Do not allow public registration to create admin accounts.

---

## 11. Page 6 — Registration

### Form elements

- Full name
- Email
- Phone if required by the backend
- Password
- Confirm password if appropriate
- Clear validation messages
- Create Account button with loading state
- Link to Login

Keep the form short and friendly. Explain password requirements near the field. Show success only after the server confirms account creation. Registration creates a customer account only; admin accounts must be provisioned securely.

---

## 12. Page 7 — Reservation Details / Simulated Payment

### Reservation summary

Show:
- Reservation identifier
- Parking lot and slot
- Vehicle
- Start/end time
- Reservation status
- Pricing basis and estimated amount when available

### Simulated payment

This project uses **demo-only payment**. There must be no real payment gateway, no card processing, no real bKash/Nagad transaction, and no claim that real money was charged.

- Clearly display: **“DEMO PAYMENT — NO REAL MONEY CHARGED”**
- Use demo payment options only if the backend supports them
- Show pending, paid, failed, or refunded demo states according to actual API data
- Disable duplicate payment attempts when already marked paid
- Display confirmation only after the backend confirms the demo-payment result
- Call the related report **Demo Revenue**

Do not request or store actual card numbers, CVV, PIN, OTP, or mobile banking credentials.

---

## 13. Dark / Light Theme

Provide a polished animated sun/moon toggle in the public header and authenticated dashboard header.

Requirements:
- Brief icon transition; disable it when reduced motion is requested
- Theme changes all surfaces, typography, borders, charts, inputs, dialogs, and tables
- Dark is the default; persist the selected `dark` or `light` value under `parkease-theme`
- Apply the root `dark`/`light` class and `data-theme` before paint through the client theme provider
- Set the matching browser `color-scheme` so native controls follow the selected theme
- Ensure contrast and focus visibility in both modes
- Avoid animating the entire page in a way that causes flashing

Use Motion for React for the toggle interaction. The theme change should feel smooth and quick, not theatrical or slow.

---

## 14. Motion Design Rules

### Motion for React

Use for:
- Buttons and press feedback
- Navigation indicators
- Dialogs and dropdowns
- Card hover states
- Slot selection
- Theme toggle
- Small page and content transitions
- Loading and feedback states where appropriate

### GSAP + ScrollTrigger

Use for:
- Landing-page scroll choreography
- 3D car scale/position/rotation timeline
- Section reveal sequences
- Scroll-linked camera movement if compatible with the 3D implementation

### Three.js / React Three Fiber

Use for:
- Landing-page car and parking-garage visualization
- Carefully controlled camera, lighting, and materials
- Optional simplified parking-space scene

### Animation constraints

- Never let GSAP and Motion control the same transform on the same element at the same time.
- Clean up ScrollTriggers, event listeners, animation timelines, and render resources when components unmount.
- Keep dashboard interactions fast; most micro-interactions should be brief.
- Avoid scroll hijacking, excessive parallax, and unnecessary cursor-following effects.
- Respect reduced-motion preferences.
- Ensure buttons and forms remain usable if animations fail or are disabled.
- The shared cursor-reactive constellation background must remain subtle, neighbor-connected, and capped at 30fps; pause it when the document is hidden and disable continuous motion and pointer interaction for coarse pointers and `prefers-reduced-motion`.
- Do not let pointer effects follow the cursor over form controls in a way that harms readability or interaction.

---

## 15. Responsive Behavior

### Desktop
- Full landing hero composition and 3D scene
- Full admin sidebar and multi-column metrics
- Spacious parking-slot grid and booking summary

### Tablet
- Collapsible sidebar
- Reduced dashboard columns
- Smaller 3D scene and simplified feature layout

### Mobile
- Single-column page layout
- Mobile navigation menu
- Public mobile navigation opens as an admin-style side drawer rather than an expanding header dropdown.
- Full-width primary actions where useful
- Touch-friendly controls and slot cards
- Forms must fit the viewport without horizontal scrolling
- Simplify or disable expensive 3D effects; render the constellation grid statically on touch devices
- Ensure the theme toggle, forms, tables, and dialogs remain usable

Design and test at narrow mobile, standard mobile, tablet, and wide desktop sizes.

---

## 16. Accessibility and Usability

- Maintain readable contrast in both themes.
- Use semantic headings and properly labelled form controls.
- All controls must be keyboard accessible.
- Use visible `focus-visible` states.
- Do not communicate slot status by color alone.
- Provide useful error text and validation feedback.
- Respect reduced-motion settings.
- Keep touch targets comfortably sized.
- Do not hide essential content behind hover-only interactions.
- Ensure animations never block navigation or form submission.

---

## 17. Data Integrity and Functional UI Rules

- Use actual backend/API data for reservations, slots, pricing, users, and dashboard metrics.
- If seed data is shown, identify it as demo/seed data.
- Do not invent availability, payment results, customer counts, or revenue.
- Preserve authentication and role-based access control.
- The frontend must not be treated as the authority for pricing, slot availability, or payment status.
- Display API errors gracefully and allow safe retries where appropriate.
- Do not delete payment history through ordinary UI actions.
- Use confirmation dialogs for important or destructive actions.

---

## 18. Suggested Frontend Implementation Notes

Recommended tools, subject to the existing project setup:
- React + Vite
- Tailwind CSS
- React Router
- Motion for React
- GSAP + ScrollTrigger
- Three.js / React Three Fiber for the 3D hero
- Lucide React
- A suitable chart library if charts are needed
- Existing API client and authentication context

Keep the design system modular. Suggested structure:

```text
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
    AdminLayout.jsx
    CustomerLayout.jsx
  pages/
    LandingPage.jsx
    AdminDashboard.jsx
    FindParkingPage.jsx
    CustomerProfilePage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    ReservationDetailsPage.jsx
  routes/
  services/
  hooks/
  context/
  styles/
    tokens.css
    globals.css
```

Adapt file names to the existing codebase instead of duplicating existing architecture.

---

## 19. Quality Checklist

Before considering the design complete, verify:

- [ ] All seven page types exist and share a consistent design system.
- [ ] Landing page has a clear **Find Parking** CTA.
- [ ] The 3D car responds smoothly to scroll and has a reduced-motion/mobile fallback.
- [ ] Dark and light themes both look intentionally designed.
- [ ] Typography uses a deliberate modern sans-serif + mono pairing selected with UI/UX Pro Max guidance.
- [ ] Rectangular buttons and UI interactions have polished, restrained hover/active animation without layout shifts.
- [ ] The black/white visual system and subtle cursor-reactive texture work without reducing readability.
- [ ] Public navigation links lead to real dedicated pages.
- [ ] The landing slot preview has a clear auth gate for Show more.
- [ ] The customer profile route has been checked for and does not exhibit avoidable layout jumping.
- [ ] Admin and customer navigation are clearly separated.
- [ ] Slot states and reservation conflicts are understandable.
- [ ] Customer profile shows only that customer's own data.
- [ ] Demo payment clearly states no real money is charged.
- [ ] No unsupported buttons or fake links are shown as functional.
- [ ] Loading, empty, success, and error states are designed.
- [ ] Responsive layouts work without horizontal overflow.
- [ ] Keyboard navigation, focus states, contrast, and reduced motion are supported.
- [ ] Existing API contracts and working functionality are preserved.
- [ ] 3D assets and animations do not make the site unnecessarily slow.

---

## 20. Final Art Direction

The final ParkEase experience should combine:
- A premium monochrome identity built from black, white, charcoal, and cool neutrals.
- A dark, developer-tool-inspired mood with a subtle Vercel-like background texture and restrained pointer-reactive wave/ripple.
- A landing page with meaningful product content, dedicated pages for visible public navigation links, and an auth-gated parking-slot preview.
- Rectangular premium buttons with precise animated hover/active states and no layout jitter.
- A mixed typography system chosen through UI/UX Pro Max guidance: a readable modern sans-serif for most content and a mono face reserved for technical details.
- A consistent, polished Admin UI as well as customer-facing pages.
- A stable customer profile route without visible page jumping or layout shift.
- A cinematic but lightweight 3D car scene and scroll-linked story when authorized by the current project scope.
- Accessible Motion for React micro-interactions and GSAP + ScrollTrigger choreography without transform conflicts.
- Fully considered dark and light themes.

**Priority order:** functional clarity and layout stability first, design consistency second, visual polish third, cinematic effects fourth. Every effect must support the product rather than compete with it.

### Tool and component discovery policy

- Inspect whether UI/UX Pro Max is actually available to the current coding agent. Read its installed skill instructions and use its design-system/search guidance where available. Do not claim it was used if it could not be accessed or executed.
- Verify the actual 21st.dev CLI package, installed version, login status, and supported component workflow. Search for suitable components before creating complex ones from scratch. Do not assume skills installed for Claude/Cursor/Codex automatically work in Antigravity.
- Reuse compatible, accessible components from 21st.dev only when they fit the design and project stack; audit code, dependencies, and accessibility before integration. Do not copy components blindly or add unnecessary dependencies.
- If either tool is unavailable, use a safe, compatible fallback and clearly report the limitation.
- Use the existing repository, current `PHASE.md`, and `RULES.md` as the source of truth. A UI redesign authorization does not authorize unrelated backend/database changes or future-day functional work. If a proposed 3D/GSAP task is outside the currently authorized phase, present the implementation plan and wait for approval unless the user explicitly authorizes that visual scope.
