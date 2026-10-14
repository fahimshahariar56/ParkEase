# ParkEase Animation Specification

This document inventories the animation behavior implemented in the repository and defines its ownership, fallbacks, and constraints. `DESIGN.md` remains the visual source of truth; `PHASE.md` controls which work is authorized.

## Principles

- Motion communicates state, hierarchy, or the parking story; it is not required to access content or operate controls.
- Keep UI feedback brief and restrained. Avoid scroll hijacking, hidden content, unnecessary layout movement, and animating dense dashboard data.
- Motion for React owns component interaction transforms. GSAP owns landing-page scroll choreography and Three.js scene-object storytelling. Do not have both libraries animate the same transform.
- Honor `prefers-reduced-motion`; preserve keyboard, touch, and static access to the same information.
- Clean up listeners, observers, animation contexts, renderer resources, and timelines when components unmount.

## Implemented animation inventory

### Landing-page scroll reveals

`frontend/src/pages/LandingPage.jsx` marks the facility preview, slot preview, features, how-it-works, and CTA sections with `data-scroll-reveal`. GSAP/ScrollTrigger reveals each marked section once with a short opacity and 12px vertical transition as it approaches the viewport. Animations are scoped to the landing page and reverted on cleanup. Reduced-motion preference skips the reveal setup; content remains visible.

### Parking-scene story and interaction

`frontend/src/components/scene/ParkingScene.jsx` uses Three.js directly (including Three's `OrbitControls`), not React Three Fiber or Drei. GSAP creates a scrubbed, unpinned timeline for the car's arrival, alignment, and parked composition as the scene moves through the viewport. The car rig shifts toward the center, straightens, scales subtly, and settles; the bay markings and restrained under-wheel rings respond during alignment. The camera does not pin or take control of document scrolling.

The illustrative WebGL scene also includes:

- A limited 360-degree camera orbit with damping, distance/polar-angle bounds, and no pan.
- Mouse and touch drag; `touch-action: pan-y` preserves vertical page scrolling.
- Arrow-key orbit control when the scene group has keyboard focus.
- Grab/grabbing cursor feedback and a restrained lighting/floor-ring response on hover or drag.
- A low-power WebGL renderer, capped device pixel ratio, and a render loop capped at 30fps only while visible and motion is allowed.
- A reduced-motion static scene state with user-initiated orbit still available; no scroll choreography or continuous ring pulse.
- A static SVG poster during loading and when WebGL2 is unavailable or scene initialization fails. The poster is an illustration, not a vehicle photograph.
- Scene, GPU resource, observer, listener, OrbitControls, and GSAP cleanup.

The scene is procedural and intentionally illustrative. It is not a photorealistic licensed car asset and does not imply live slot availability.

### Motion for React interactions

`motion/react` is used for:

- Shared button hover/press feedback (approximately 150ms) in `components/ui/Button.jsx`.
- Sun/moon button feedback and icon transition (approximately 150–180ms) in `components/navigation/ThemeToggle.jsx`.
- Dialog backdrop/panel entrance and exit, and close-button feedback, in `components/ui/Dialog.jsx`.
- Route content transitions (approximately 240ms) in `components/ui/RouteTransition.jsx`.
- Public, customer, and admin mobile navigation drawer/backdrop transitions, with focus handling and Escape-to-close, in the three layout components.
- Parking-slot/card selection feedback and small content-state transitions in `pages/FindParkingPage.jsx`.
- Small authentication/form transitions in login and registration views.
- Authentication error feedback and small form entrances in customer login, admin login, and registration; data-state/list transitions in admin lots, slots, reservations, sessions, pricing, payments, and reports, plus the customer profile loading state.
- Shared card press feedback and toast entrance/exit transitions.

These transitions honor reduced motion through Motion's preference hook. CSS also minimizes transitions and animation durations globally when reduced motion is requested.

### Constellation background

`components/ui/constellation-grid.jsx` draws the theme-aware particle/connection texture on a canvas. Desktop motion is capped at 30fps, pauses when the document is hidden, and uses pointer interaction only when a fine pointer and motion preference allow it. Coarse-pointer and reduced-motion configurations use a sparse, static texture. The canvas is decorative, `aria-hidden`, and does not intercept pointer input; the normal page background remains if canvas setup fails.

### Footer wordmark canvas

`components/ui/halftone-wordmark-footer.jsx` draws an interactive halftone wordmark with pointer displacement and a short ripple response. It is event-driven rather than continuously animated, caps active frames at 30fps, and avoids pointer-driven motion on coarse pointers or when reduced motion is enabled.

### CSS and loading feedback

`styles/globals.css` defines global reduced-motion overrides. Shared UI surfaces use short CSS color/border transitions; skeletons pulse, loading indicators spin, and buttons retain their layout while showing active/disabled/loading states.

## Reduced-motion contract

When `prefers-reduced-motion: reduce` is active:

1. Essential content remains immediately visible.
2. Landing section reveals and the GSAP car story are not created.
3. The car stays in its static centered composition; continuous ring pulsing/rendering stops. Direct orbit remains input-driven.
4. The constellation canvas is static and cursor-reactive behavior is disabled.
5. Motion component entrances and CSS transitions collapse or are skipped.

The implementation responds to preference changes while the scene is mounted and removes the media-query listener on cleanup.

## Visual and implementation references

- `DESIGN.md` — visual tokens, interaction style, accessibility, and responsive requirements.
- `frontend/src/pages/LandingPage.jsx` — landing-page section reveal setup.
- `frontend/src/components/scene/ParkingScene.jsx` — WebGL scene, OrbitControls, scroll story, reduced-motion behavior, and cleanup.
- `frontend/src/components/scene/ParkingScenePoster.jsx` — no-WebGL/static poster.
- `frontend/src/components/ui/constellation-grid.jsx` — decorative canvas texture.
- `frontend/src/components/ui/Button.jsx`, `Dialog.jsx`, `RouteTransition.jsx`, and `frontend/src/components/navigation/ThemeToggle.jsx` — shared Motion patterns.

## Known limits

- No automated visual-regression or browser E2E suite is configured; verify transitions, touch behavior, reduced motion, and WebGL fallback in a browser when changing this system.
- The scene's geometry is procedural and illustrative, not a high-detail asset. Do not describe it as photorealistic.
- WebGL2 is required for the interactive scene; unsupported browsers and initialization failures retain the static poster. Recovery after a WebGL context is lost after initialization is not implemented.
- Do not add GSAP timelines to UI transforms already owned by Motion, or add motion dependencies without a concrete need.
