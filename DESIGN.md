# ParkEase — Premium UI/UX Design Specification

> **Product:** ParkEase — Smart Parking Slot Management System  
> **Document:** `design.md`  
> **Purpose:** Single source of truth for UI design, visual identity, layouts, interactions, responsive behavior, and motion implementation.

---

## 1. Product Vision

Design ParkEase as a premium, modern smart-parking SaaS product. The experience should combine a cinematic, scroll-driven landing page with a practical, data-rich admin dashboard and a simple customer parking flow.

**Design keywords:** premium, minimal, futuristic, trustworthy, precise, smooth, accessible, responsive.

**Avoid:** generic dashboard templates, excessive glassmorphism, random gradients, neon overload, cluttered layouts, unnecessary animation, fake data presented as live data, and inconsistent components.

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

**Public landing navigation**
- ParkEase logo
- Features
- How It Works
- About / Benefits
- Theme toggle
- Sign In
- Primary CTA: **Find Parking**

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

### Primary palette

Use **Midnight Navy + Emerald + Cool Neutrals** as the signature ParkEase identity. The palette should feel calm, high-end, technical, and trustworthy. Emerald is an accent, not a background for every component.

| Token | Hex | Usage |
|---|---|---|
| `color.bg.dark` | `#0B1220` | Main dark-theme background |
| `color.surface.dark` | `#111C2E` | Cards, sidebar, panels |
| `color.surface.raised` | `#172338` | Elevated cards, hover surfaces |
| `color.border.dark` | `#263449` | Subtle dark-theme borders |
| `color.text.dark` | `#F8FAFC` | Primary text on dark backgrounds |
| `color.text.muted.dark` | `#A3B1C6` | Secondary text on dark backgrounds |
| `color.brand` | `#10B981` | Primary action and brand accent |
| `color.brand.hover` | `#059669` | Hover/pressed accent |
| `color.brand.soft` | `#D1FAE5` | Soft highlight / selected state |
| `color.bg.light` | `#F8FAFC` | Main light-theme background |
| `color.surface.light` | `#FFFFFF` | Cards, forms, panels |
| `color.surface.subtle` | `#F1F5F9` | Secondary light-theme surfaces |
| `color.border.light` | `#E2E8F0` | Light-theme borders |
| `color.text.light` | `#0F172A` | Main light-theme text |
| `color.text.muted.light` | `#64748B` | Secondary light-theme text |
| `color.warning` | `#F59E0B` | Pending / attention |
| `color.error` | `#EF4444` | Errors / occupied state if product rules define it |
| `color.info` | `#3B82F6` | Informational states |

### Semantic status colors

Status must always include a readable label or icon—not color alone.

- **Available:** emerald / green
- **Reserved / Pending:** amber
- **Occupied / Unavailable:** red or muted red
- **Maintenance:** slate / gray
- **Confirmed / Completed:** emerald or blue-green
- **Cancelled / Failed:** red
- **Informational:** blue

Do not use the same status color for different meanings. If an occupied slot should not imply an error, use a restrained red/muted-red treatment.

### Color rules

- Use emerald for primary CTAs, selected controls, focus accents, active navigation, and positive states.
- Use neutral surfaces for most UI. Reserve gradients and glow for the hero and a few meaningful highlights.
- Maintain readable contrast in both themes.
- Do not make every card green or add glow to every button.
- Use subtle borders and restrained shadows instead of heavy outlines.
- Both themes must be intentionally designed. Do not simply invert colors.

---

## 4. Typography

**Primary font: JetBrains Mono.**

Use JetBrains Mono consistently for headings, navigation, buttons, labels, data tables, and body text as requested. Load the font locally or through the project's approved font-loading approach, and provide a sensible monospace fallback.

Suggested hierarchy:
- Display / hero heading: 48–72px desktop; 36–44px mobile, bold, tight line-height
- Page heading: 28–36px
- Section heading: 20–24px
- Card heading: 16–18px
- Body: 14–16px, line-height around 1.6
- Labels / metadata: 12–13px
- Dashboard KPI numbers: 28–36px with tabular numerals where available

Use a limited set of weights and maintain comfortable line lengths. Since monospace fonts can be harder to read in long paragraphs, avoid overly small body text, keep paragraphs short, and use generous line-height.

---

## 5. Layout, Spacing, and Component Shape

Use a consistent spacing scale based on 4px: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96`.

- Main content max width: approximately 1200–1440px where appropriate.
- Desktop dashboard sidebar: approximately 240–264px.
- Page content padding: 24–32px desktop; 16–20px mobile.
- Card radius: 16–20px.
- Button and input radius: 10–12px.
- Pill radius: fully rounded only for badges, tags, or intentionally pill-shaped controls.
- Use consistent icon sizes, alignment, and vertical rhythm.
- Avoid excessive nested cards and too many dividers.
- Use Lucide React icons with consistent stroke weight.

### Core component library

Build reusable components for:
- Primary, secondary, outline, ghost, danger, and icon buttons
- Inputs, password fields, selects, checkboxes, radio controls, and search
- Cards, metric cards, badges, tooltips, tabs, and breadcrumbs
- Dialogs, dropdown menus, popovers, and toasts
- Data tables, table filters, pagination, and empty states
- Sidebar, top navigation, mobile navigation, and theme toggle
- Parking-slot cards and slot-status indicators
- Reservation summary and simulated-payment status
- Skeleton loaders, error states, and confirmation panels

Every interactive control must have default, hover, focus-visible, active, disabled, loading, and error states where relevant.

---

## 6. Page 1 — Landing Page

### Goal

Create a high-impact, premium first impression and guide users to **Find Parking** or **Sign In**. The landing page should feel cinematic without sacrificing readability or performance.

### Header

- ParkEase wordmark / logo at the left
- Feature links in the center or right
- Animated dark/light theme toggle
- Sign In as a secondary action
- **Find Parking** as the primary emerald CTA
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
6. Benefits section
7. Final CTA: **Find Your Parking Spot**
8. Footer with relevant links and project information

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
- Smooth icon and thumb transition
- Theme changes all surfaces, typography, borders, charts, inputs, dialogs, and tables
- No flash of the wrong theme on initial render if persistence is implemented
- Persist preference using the project's approved theme mechanism
- Respect system theme when no saved preference exists, if supported
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
- Full-width primary actions where useful
- Touch-friendly controls and slot cards
- Forms must fit the viewport without horizontal scrolling
- Simplify or disable expensive 3D effects
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
- [ ] JetBrains Mono is used as the requested primary font.
- [ ] Buttons and UI interactions have polished but restrained animation.
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
- A cinematic landing page with one memorable scroll-linked 3D car.
- A clean, efficient premium admin dashboard.
- A customer-first parking reservation journey.
- A consistent Midnight Navy / Emerald visual identity.
- JetBrains Mono typography.
- Elegant Motion for React micro-interactions.
- Smooth GSAP + ScrollTrigger storytelling.
- A useful, lightweight Three.js scene.
- Fully designed dark and light themes.

**Priority order:** usability and consistency first, visual polish second, cinematic effects third. Every effect must support the product instead of distracting from it.
