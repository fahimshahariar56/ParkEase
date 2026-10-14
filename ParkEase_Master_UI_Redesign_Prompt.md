# ParkEase — Part 1: Project Audit, Design Research & Design System

Act as a senior product designer, frontend architect, design-systems engineer, and UI/UX researcher.

Your task is to audit the existing ParkEase Smart Parking Slot Management System, establish a consistent premium visual direction, and implement the foundational design system.

This is a new Antigravity account. Do not depend on previous chat history. The repository and its documentation are the source of truth.

## 1. Execution Scope

Execute ONLY Part 1.

Complete:

* Project and Git audit.
* Documentation review.
* Route and component mapping.
* Design tool and skill verification.
* UI/UX design proposal.
* Shared design tokens and foundational components.
* Actual design specification update.

Do NOT begin the comprehensive page-by-page redesign, implement new public pages, build the 3D car experience, or start unrelated business logic.

Do not start future phases automatically.

## 2. Mandatory Project Audit

Before editing anything:

1. Inspect `git status` and the current Git diff.
2. Identify and preserve all existing user changes.
3. Never reset, discard, overwrite, or clean up unrelated user work.
4. Read:

   * `PRD.md`
   * `ARCHITECTURE.md`
   * `RULES.md`
   * `PHASE.md`
   * The actual design document: `design.md` or `DESIGN.md`
   * Relevant `stitch-design/` assets, if present.
5. Inspect the frontend structure, including:

   * React and Vite configuration.
   * Tailwind configuration.
   * Package scripts and dependencies.
   * Routes and route guards.
   * Shared layouts and components.
   * Theme handling.
   * Authentication context.
   * API utilities.
   * Forms, tables, buttons, cards, navigation, and loading states.
6. Inspect relevant backend contracts in read-only mode.
7. Identify existing functionality, dead links, inconsistent styling, loading behavior, and responsive issues.

Do not assume that a feature exists simply because it is mentioned in the documentation.

Create a concise route inventory containing:

* Route path.
* User role.
* Page purpose.
* Existing functionality.
* Shared layout.
* Identified visual issues.
* Missing destinations or broken navigation.

## 3. Verify UI/UX Pro Max

Determine whether the UI/UX Pro Max skill is genuinely available to the current Antigravity environment.

If available:

* Read its actual `SKILL.md`.
* Follow its design-system generation and search guidance.
* Use its typography, color, UX-pattern, accessibility, and responsive recommendations.
* Execute its supported workflow when the required runtime is available.

If unavailable:

* State the exact limitation.
* Check whether a compatible local alternative exists.
* Do not claim that the skill was executed if it was merely inspected or unavailable.

## 4. Verify 21st.dev

Check the actual `@21st-dev/cli` integration.

Verify:

* Whether the official CLI is installed.
* Installed version.
* Authentication state, without exposing credentials.
* Supported component discovery and generation workflow.
* Compatibility with the existing React + Vite + Tailwind architecture.

Search for relevant components before deciding to build complex components from scratch.

If components are available:

* Inspect the source code.
* Check accessibility and keyboard behavior.
* Review dependencies.
* Check styling compatibility.
* Integrate only components that genuinely improve ParkEase.

Do not replace the project's existing architecture just to use an external component.

If the CLI is unavailable, use a compatible local workflow and report the limitation accurately.

## 5. Visual Direction

Establish a premium, restrained automotive-tech SaaS identity.

The primary palette must be monochrome:

* Near-black: `#08090B`
* Dark surface: `#101114`
* Elevated surface: `#17191D`
* Dark border: `#292B30`
* Dark primary text: `#F5F5F5`
* Light background: `#FAFAFA`
* Light surface: `#FFFFFF`
* Light primary text: `#111113`
* Light border: `#E4E4E7`

Use accent colors only for meaningful actions, selection, and semantic status.

Avoid:

* Green-dominant interfaces.
* Excessive gradients.
* Neon glow.
* Random floating blobs.
* Excessive glassmorphism.
* Oversized generic AI landing-page headings.
* Unnecessary rounded cards.
* Excessive decorative animation.

Use generous whitespace, deliberate alignment, crisp typography, subtle borders, and strong visual hierarchy.

## 6. Typography

Use UI/UX Pro Max recommendations when genuinely available.

Choose:

* One modern sans-serif for body text, navigation, forms, buttons, and most headings.
* One monospace font for technical IDs, slot numbers, timestamps, and selected metadata.

Consider Geist Sans or Inter for the primary interface and Geist Mono or JetBrains Mono for technical details, depending on actual compatibility and design guidance.

Do not use a monospace font everywhere.

Use the existing approved font-loading approach where practical. Avoid unnecessary dependencies and font-related layout shifts.

Document the chosen font pair and the reasons behind the choice.

## 7. Shared Design System

Inspect existing components before creating replacements.

Establish reusable tokens and primitives for:

* Colors and semantic status colors.
* Typography.
* Spacing.
* Borders and radii.
* Shadows.
* Focus states.
* Transition timing.
* Buttons.
* Inputs.
* Cards.
* Badges.
* Tables.
* Navigation.
* Dropdowns.
* Dialogs.
* Loading skeletons.
* Empty, success, and error states.

Buttons should generally have a 6–9px radius rather than pill-shaped styling.

Support primary, secondary, outline, ghost, danger, and icon-button variants.

Use restrained 140–220ms transitions where appropriate.

Provide visible keyboard focus and respect `prefers-reduced-motion`.

Keep the design system consistent with the existing Tailwind setup.

Do not create unnecessary duplicate components.

## 8. Background Texture Proposal

Design an understated fine-grid, dot-grid, noise, or micro-grid background inspired by premium developer websites.

The texture must:

* Remain behind the content.
* Preserve readability and contrast.
* Never intercept pointer events.
* Avoid excessive visual noise.
* Support both dark and light themes.

Investigate a lightweight cursor-reactive ripple or displacement effect using CSS, SVG, or canvas.

For this part, establish the implementation strategy and any minimal shared styling needed. Defer the complete interactive effect to Part 2.

Disable or simplify decorative effects on touch devices and when reduced motion is requested.

Do not add heavy WebGL solely for a background texture.

## 9. Design Proposal

After completing the audit, prepare a concise proposal covering:

1. Existing application architecture.
2. Actual public, customer, and admin routes.
3. Current visual inconsistencies.
4. Selected font pairing.
5. Dark and light color systems.
6. Background texture approach.
7. Shared component architecture.
8. Theme-handling strategy.
9. Profile page layout-jump investigation plan.
10. Scroll animation and 3D implementation constraints.
11. UI/UX Pro Max availability and actual usage.
12. 21st.dev availability and actual usage.
13. Exact files expected to change.

Do not stop after presenting the proposal. Continue with the authorized, reversible foundational design-system implementation.

## 10. Update the Design Specification

Update the actual design document identified during the audit.

If the repository uses `design.md`, update that file. If it uses `DESIGN.md`, update that file.

Do not create conflicting duplicate documents.

Document:

* Design philosophy.
* Color palette.
* Typography.
* Component rules.
* Button system.
* Surface and border treatment.
* Spacing.
* Theme behavior.
* Accessibility requirements.
* Motion principles.
* Texture principles.
* Responsive rules.

Ensure the specification reflects the actual implementation.

## 11. Guardrails

Preserve:

* React + Vite + Tailwind.
* Node.js/Express/MySQL integration.
* Existing API contracts.
* Authentication and role authorization.
* Current business logic.
* Existing working features.

Do not:

* Change the database schema.
* Rewrite authentication.
* Replace MySQL.
* Implement unrelated backend features.
* Start Day 23 reporting or business logic.
* Download paid assets.
* Add unnecessary dependencies.
* Delete working code without justification.

Read `RULES.md` and `PHASE.md` before deciding what is authorized.

## 12. Validation

Run the available checks relevant to the changes.

Inspect the final Git diff.

Report:

* Audit findings.
* Actual routes discovered.
* Design decisions.
* Shared files created or changed.
* UI/UX Pro Max verification.
* 21st.dev verification.
* Dependencies added, if any.
* Commands executed and their actual outcomes.
* Issues that remain.

Do not claim a build, test, or integration succeeded unless it was actually verified.

## Completion Boundary

Part 1 is complete when the audit is documented, the design direction is established, the foundational shared system is implemented, and the actual design specification is updated.

Stop after Part 1. Do not start Part 2 or Part 3.



# ParkEase — Part 2: Complete Website UI/UX Redesign

Act as a senior product designer, creative frontend engineer, and design-systems specialist.

Your task is to implement a cohesive, production-quality visual redesign of the existing ParkEase Smart Parking Slot Management System.

Part 1 established the design system and documented the audit. Use the actual repository, the current Git state, `RULES.md`, `PHASE.md`, and the updated `design.md` or `DESIGN.md` as the source of truth.

If Part 1 was not completed in this environment, perform a brief safety and documentation check before proceeding. Do not assume undocumented work exists.

## 1. Execution Scope

Execute ONLY Part 2.

Complete:

* Landing-page redesign.
* Dedicated public pages where required.
* Customer interface redesign.
* Login and registration redesign.
* Admin interface redesign.
* Cursor-reactive background texture.
* Profile page layout-jump investigation and fix.
* Shared component integration.
* Responsive and accessibility improvements.

Do not implement unrelated backend features, database changes, new reporting logic, or phase-prohibited 3D work.

Do not start Part 3 automatically.

## 2. Protect Existing Work

Before editing:

1. Run `git status`.
2. Inspect the current diff.
3. Identify user-owned changes.
4. Preserve all unrelated work.
5. Inspect the updated design specification.
6. Recheck `RULES.md` and `PHASE.md`.

Reuse the established design tokens and shared primitives.

Avoid unnecessary dependency changes and do not rewrite the application.

## 3. Landing Page

Build a premium, content-rich, responsive automotive-tech landing page.

Include:

* Elegant navigation.
* Clear, product-specific hero copy.
* Primary and secondary CTAs.
* Product explanation.
* How-it-works steps.
* Feature sections.
* Parking-slot preview.
* Practical benefits.
* Final CTA.
* Professional footer.

Keep the layout editorial, structured, and memorable.

Avoid generic AI landing-page layouts, excessive cards, giant headings, neon gradients, and unnecessary decoration.

### Navigation and Routes

Inspect the actual route inventory before editing.

Every visible navigation item must have a meaningful destination.

If the landing page includes Features, How It Works, or About as page links and no equivalent routes exist, create dedicated routes:

* `/features`
* `/how-it-works`
* `/about`

Reuse existing equivalent routes instead of creating duplicates.

Never use:

* `href="#"`.
* Dead anchors.
* Misleading buttons.
* Links that all lead to the same generic page.

Ensure internal navigation works with the current router.

### Parking Preview

Add a small, attractive parking-slot preview.

Use real API data if an appropriate public endpoint already exists and supports the use case.

Otherwise:

* Clearly label sample data as a demo or illustration.
* Never imply sample availability is live.
* Do not expose protected customer information.

Include a **Show more** action.

When an unauthenticated visitor clicks Show more:

* Navigate to `/login`.
* Preserve a safe return path if the existing router supports it.
* Validate the return destination before redirecting.
* Never expose protected data or bypass reservation authorization.

Do not invent customer counts, testimonials, integrations, or live availability claims.

## 4. Shared Visual Language

Apply the Part 1 design system consistently.

Use the monochrome visual identity:

* Near-black backgrounds.
* Charcoal surfaces.
* White and cool-gray text.
* Subtle borders.
* Clean white light mode.
* Limited semantic accents.

Use the established font pairing.

Keep buttons rectangular and tactile, generally with a 6–9px radius.

Maintain consistent styling for:

* Navigation.
* Forms.
* Inputs.
* Cards.
* Tables.
* Dropdowns.
* Dialogs.
* Tabs.
* Badges.
* Sidebars.
* Toasts.
* Loading skeletons.
* Empty states.
* Error states.
* Success states.

Do not redesign each page independently.

## 5. Cursor-Reactive Background

Implement the approved lightweight pointer-reactive background texture.

Requirements:

* Fine-grid, micro-grid, or similarly understated texture.
* Subtle ripple or displacement response to desktop cursor movement.
* No glowing spotlight or neon trail.
* No pointer-event interception.
* No interference with text selection or navigation.
* Throttled or frame-scheduled updates.
* Cleanup of event listeners.
* No unnecessary React re-renders.
* Reduced-motion support.
* Touch-device fallback.
* Graceful behavior on low-power devices.

Prefer CSS, SVG, or lightweight canvas.

Do not introduce heavy WebGL for this effect.

Keep the effect subtle enough that content remains the primary focus.

## 6. Customer Interface

Redesign every relevant customer route that actually exists.

Inspect and polish:

* Customer dashboard.
* Parking-lot discovery.
* Search and filters.
* Parking-slot grid.
* Slot details.
* Reservation flow.
* Reservation summary.
* Reservation history.
* Reservation details.
* Profile.
* Vehicle management.
* Other existing customer features.

Do not assume every listed feature exists. Use the real route inventory and backend contracts.

### Parking States

Make available, reserved, occupied, and maintenance states distinguishable through text labels or icons as well as color.

Keep filters limited to fields supported by the backend.

Provide appropriate:

* Loading states.
* Empty states.
* Invalid date/time feedback.
* Reservation conflict feedback.
* API error handling.
* Confirmation states.

Never simulate a successful API reservation.

Preserve all existing reservation rules and conflict handling.

## 7. Login and Registration

Redesign the actual authentication pages.

Include:

* Clear hierarchy.
* Accessible form labels.
* Responsive layout.
* Consistent typography.
* Appropriate password visibility controls.
* Validation messages.
* Disabled states.
* Loading feedback.
* Helpful error messages.
* Keyboard focus indicators.

Preserve real backend authentication.

Do not:

* Fake successful login.
* Add unsupported social login.
* Add unsupported password-reset behavior.
* Rewrite JWT handling.
* Change the authentication architecture.
* Weaken route protection.

Maintain strict Admin/Customer separation.

## 8. Profile Page Layout-Jump Investigation

Investigate the actual root cause of the profile page jumping or shifting when opened.

Inspect:

* Route and layout mounting.
* Shared customer layout persistence.
* Unstable React keys.
* Conditional rendering.
* Nested layouts.
* Authentication loading.
* Profile API responses.
* Duplicate effects.
* Scroll restoration.
* Font loading.
* Avatar/image dimensions.
* Asynchronous content changes.
* CSS transitions affecting geometry.

Do not merely hide the issue with arbitrary CSS.

### Fix Requirements

Where compatible with the existing architecture:

* Keep shared customer navigation and layout mounted across related routes.
* Use loading skeletons that match final content geometry.
* Reserve image and avatar dimensions.
* Prevent late responses from unexpectedly replacing the entire page structure.
* Avoid unnecessary layout-affecting transitions.
* Avoid arbitrary fixed positioning and unjustified fixed heights.

Preserve all existing profile, vehicle, and reservation features.

Test:

1. Direct navigation to `/profile`.
2. Internal navigation to `/profile`.
3. Refresh on `/profile`.
4. Navigation between adjacent customer routes.
5. Delayed profile API responses.
6. Authentication loading and failure states.

Record the root cause and the actual fix. If the environment cannot reproduce the issue, explain what was inspected and what remains unverified.

## 9. Admin Interface

Redesign the admin pages that actually exist.

Potential areas include:

* Admin login.
* Dashboard.
* Sidebar and topbar.
* Tables and filters.
* Forms.
* Pricing.
* Parking lots.
* Parking slots.
* Reservations.
* Sessions.
* Customers.
* Reports.

Only implement visual changes to actual existing features.

Use:

* Professional information hierarchy.
* Consistent monochrome surfaces.
* Clear table actions.
* Responsive layouts.
* Concise labels.
* Appropriate empty and loading states.
* Clear error feedback.
* Accessible menus and dialogs.

Use real API metrics only.

Label demo or seed data clearly.

If simulated payment or revenue is already displayed, clearly explain that no real money is charged and use **Demo Revenue** for simulated totals.

Do not implement new report or business logic.

Preserve admin authorization and backend contracts.

## 10. Dedicated Public Pages

Create dedicated public routes only where needed.

For example:

* `/features`
* `/how-it-works`
* `/about`

Each page must:

* Use the shared design system.
* Have unique, relevant content.
* Include working navigation.
* Explain only verified ParkEase functionality.
* Work on mobile and desktop.
* Include appropriate metadata where the existing project supports it.

Do not create duplicate routes or invent unsupported capabilities.

## 11. Responsive and Accessibility Requirements

Test the available workflow at:

* Narrow mobile.
* Standard mobile.
* Tablet.
* Laptop.
* Wide desktop.

Verify:

* No horizontal overflow.
* Usable touch targets.
* Responsive navigation.
* Accessible forms.
* Usable tables.
* Keyboard-operable dialogs.
* Visible focus indicators.
* Semantic HTML.
* Adequate contrast.
* Reduced-motion behavior.

Hover must not be the only way to discover or operate a feature.

## 12. Guardrails

Preserve:

* React + Vite + Tailwind.
* Existing Express/MySQL integration.
* API contracts.
* Authentication and authorization.
* Existing business logic.
* Working user features.

Do not change:

* Database schema.
* Backend business logic.
* Authentication architecture.
* API contracts.
* Environment secrets.

Do not implement phase-prohibited 3D work.

If `RULES.md` or `PHASE.md` explicitly prohibits a requested item, complete the non-conflicting work and document the blocked item.

Do not download paid assets or introduce unnecessary dependencies.

## 13. Validation

Run the available:

* Frontend lint.
* Build.
* Tests.
* Route checks.
* Type checks, if configured.

Verify internal links, responsive behavior, authentication redirects, and API integration wherever the environment supports testing.

Check reduced-motion behavior and pointer-texture fallbacks.

Use browser automation only if an actual browser workflow is available.

Inspect the final Git diff and ensure no unrelated changes were introduced.

## Completion Report

Report:

1. Pages redesigned.
2. New routes added.
3. Shared components reused or created.
4. Cursor-reactive texture implementation.
5. Profile page root cause and fix.
6. Authentication and reservation behavior preserved.
7. Files changed.
8. Dependencies added and reasons.
9. Actual build, lint, and test outcomes.
10. Remaining visual or functional issues.

Do not claim that unexecuted tests passed.

Stop after Part 2. Do not start Part 3.




# ParkEase — Part 3: Motion Engineering, Scroll Animation & Final QA

Act as a senior motion-design engineer, React animation specialist, frontend performance engineer, and QA engineer.

Your task is to finish the authorized motion work for the existing ParkEase Smart Parking Slot Management System and perform a thorough final validation.

Use the actual repository, current Git state, updated design specification, `RULES.md`, and `PHASE.md` as the source of truth.

## 1. Execution Scope

Execute ONLY Part 3.

Complete:

* Motion-system audit.
* Authorized component animations.
* Scroll-triggered landing-page animations.
* 3D car scene only if explicitly permitted.
* Reduced-motion behavior.
* Animation cleanup.
* Performance and accessibility checks.
* Final frontend validation.
* Final implementation report.

Do not start new features unrelated to the redesign.

## 2. Mandatory Preflight

Before editing:

1. Run `git status`.
2. Inspect the current diff.
3. Preserve all existing user changes.
4. Read `RULES.md` and `PHASE.md`.
5. Read the updated `design.md` or `DESIGN.md`.
6. Inspect the actual implementation completed in earlier parts.
7. Review installed animation and 3D dependencies.
8. Identify existing animation utilities and duplicated animation behavior.

Do not assume Motion, GSAP, ScrollTrigger, React Three Fiber, or Drei is installed.

Check actual package versions and compatibility before using them.

## 3. Phase Rules Take Priority

Determine whether the current project rules permit:

* GSAP + ScrollTrigger.
* React Three Fiber.
* Drei.
* A 3D car scene.
* Scroll-linked vehicle movement.
* Additional animation dependencies.

If 3D or GSAP is prohibited by the current phase:

* Do not implement the prohibited work.
* Do not modify phase safeguards.
* Complete permitted component animations, accessibility, optimization, and validation.
* Record the blocked work and the exact rule responsible.

Do not silently bypass project rules.

## 4. Motion System

Use the project's existing Motion for React setup if available.

If it is missing, determine whether adding the appropriate Motion package is justified and compatible with the project.

Implement restrained interactions where useful:

* Button hover and pressed states.
* Navigation interactions.
* Dropdowns.
* Dialogs.
* Theme toggle.
* Parking-slot selection.
* Toasts.
* Loading-state transitions.
* Small component entrances.

Keep most transitions around 140–220ms where appropriate.

Use subtle movement rather than exaggerated bouncing or glowing.

Do not animate every element.

Avoid:

* Excessive stagger effects.
* Animating entire pages on every route change.
* Layout-affecting animations that cause page jumps.
* Scroll hijacking.
* Animations that hide content.
* Unnecessary motion on tables or dense admin interfaces.

Do not let multiple animation libraries control the same transform simultaneously.

Respect the established design system.

## 5. Scroll-Triggered Animations

Use scroll-triggered animation to reveal meaningful sections as the visitor scrolls.

Suitable examples:

* A feature section entering the viewport.
* A parking-slot preview revealing its content.
* A how-it-works sequence.
* A final call-to-action section.

Use restrained effects such as:

* Opacity transitions.
* Small vertical movement.
* Subtle scale changes.
* Carefully controlled sequential reveals.

Avoid animating every card independently without a clear reason.

Keep content visible and understandable if animation is disabled or fails.

Do not use scroll hijacking or force visitors through a fixed sequence of sections.

### GSAP Is Authorized

Use GSAP + ScrollTrigger only for the scroll storytelling that benefits from timeline-based control.

Requirements:

* Scope animations to the relevant component.
* Clean up timelines and ScrollTriggers.
* Avoid duplicate trigger registration.
* Prevent overlapping animations.
* Handle route changes correctly.
* Avoid excessive pinned sections.
* Keep scrolling natural.
* Ensure mobile performance.

Use the existing project setup where practical.

Do not use GSAP to animate transforms already controlled by Motion.

### If GSAP Is Not Authorized

Use the available Motion APIs or lightweight CSS/Intersection Observer patterns for permitted reveal animations.

Document the limitation accurately.

## 6. 3D Car and Parking Scene

Implement this section  existing dependencies, and project constraints explicitly allow it.

First inspect:

* Existing assets.
* Asset licensing.
* Installed dependencies.
* Performance constraints.
* Landing-page structure.
* Available loading and error-handling patterns.

If authorized, create a restrained automotive visual that supports the product story.

Possible progression:

1. A clean studio-style vehicle presentation.
2. Gradual movement or rotation during scroll.
3. A transition toward a parking-slot environment.
4. A final parked-car composition connected to ParkEase.

Use React Three Fiber + Drei and GSAP + ScrollTrigger only when justified and compatible.

### Asset Rules

Prefer appropriately licensed, project-owned assets.

If no suitable asset exists:

* Consider a lightweight procedural or simplified vehicle.
* Avoid large downloads.
* Do not use paid assets without approval.
* Do not use an unlicensed model.

### Performance and Accessibility

Provide:

* Loading fallback.
* Static poster or image fallback.
* Graceful WebGL failure handling.
* Reduced-motion support.
* Mobile simplification.
* Low-power simplification.
* Cleanup of WebGL resources.
* Responsive sizing.
* No obstruction of navigation or text.

Avoid:

* Expensive reflections.
* Unnecessary post-processing.
* Large textures.
* Excessive polygons.
* Multiple expensive 3D scenes.
* Forced scroll sequences.

If the scene negatively affects performance or accessibility, prefer the lightweight fallback.

## 7. Reduced-Motion and Input Support

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

* Disable unnecessary parallax.
* Avoid scroll-linked 3D movement.
* Minimize entrance animations.
* Preserve immediate access to all content.
* Keep state changes understandable.

On touch devices:

* Disable cursor-reactive effects.
* Simplify or remove unnecessary hover animations.
* Use appropriate tap interactions.
* Simplify 3D scenes when required.

Ensure keyboard users receive equivalent interaction feedback.

## 8. Performance Optimization

Inspect:

* Animation-related React re-renders.
* Event-listener cleanup.
* Scroll listener frequency.
* Canvas rendering.
* Lazy loading.
* Font-loading behavior.
* Image dimensions.
* Layout shifts.
* Unnecessary dependencies.
* Duplicate animations.

Prefer:

* Transform and opacity animations.
* Frame-scheduled pointer updates.
* Scoped animation hooks.
* Lazy loading for expensive scenes.
* Stable component dimensions.
* Appropriate cleanup.

Avoid:

* Animating width, height, top, and left continuously when transforms are sufficient.
* Unnecessary state updates during scrolling.
* Memory leaks.
* Duplicate animation timelines.
* Global animation listeners without cleanup.

Do not introduce complex optimization code without evidence that it is needed.

## 9. Final Functional QA

Test all actual routes identified during the audit.

### Public Interface

* Landing page.
* Features page, if present.
* How It Works page, if present.
* About page, if present.
* Login.
* Registration.

### Customer Interface

* Dashboard.
* Parking discovery.
* Slot selection.
* Reservation flow.
* Reservation history.
* Profile.
* Vehicle management.
* Other existing customer routes.

### Admin Interface

* Admin login.
* Dashboard.
* Parking lots.
* Slots.
* Reservations.
* Sessions.
* Customers.
* Pricing.
* Reports.
* Other existing admin routes.

Only test routes that actually exist.

Verify:

* Navigation links.
* Protected-route redirects.
* Role separation.
* API loading and error behavior.
* Reservation conflict handling.
* Empty states.
* Responsive layouts.
* Profile layout stability.
* Theme behavior.
* Keyboard accessibility.
* Reduced-motion behavior.
* Cursor-texture fallback.
* WebGL fallback, if implemented.

Never simulate a successful backend action to make a visual test appear to pass.

## 10. Build and Quality Checks

Run the actual available project scripts.

Check `package.json` before selecting commands.

Run relevant checks, such as:

* Frontend build.
* Lint.
* Tests.
* Type checking.
* Route or navigation checks.
* Available browser-based smoke tests.

Do not invent script names.

If a command fails:

1. Record the actual error.
2. Determine whether it is caused by your changes.
3. Fix in-scope issues where possible.
4. Re-run the affected check.
5. Report unresolved issues honestly.

Do not modify backend logic merely to make a frontend test pass.

Do not claim visual or browser testing occurred unless the appropriate workflow was actually executed.

## 11. Final Git Review

Inspect:

* `git status`.
* Final Git diff.
* Changed files.
* Dependency changes.
* Potential secrets or accidental environment changes.

Preserve unrelated user modifications.

Do not create a commit unless explicitly requested.

## 12. Final Report

Provide a clear report containing:

1. **Design direction:** final palette, font pairing, and design-system summary.
2. **UI/UX Pro Max:** actual usage or verified limitation.
3. **21st.dev:** components used or reason for not using them.
4. **Pages:** redesigned routes and new routes.
5. **Background texture:** implementation and fallback behavior.
6. **Motion:** component interactions and scroll-triggered animations actually implemented.
7. **3D car scene:** implementation details or the exact phase restriction preventing it.
8. **Profile jump:** root cause, fix, and tests actually performed.
9. **Files changed:** concise list grouped by purpose.
10. **Dependencies:** added, removed, or updated, with reasons.
11. **Validation:** actual commands, results, and failures.
12. **Accessibility and performance:** checks completed and limitations.
13. **Remaining issues:** concrete next steps, including anything blocked by project rules.

Clearly distinguish:

* Implemented.
* Tested and verified.
* Implemented but not fully verified.
* Blocked by project rules.
* Not implemented.

## Completion Boundary

Finish the authorized motion work and final validation.

Do not start unrelated features, alter phase safeguards, or rewrite the architecture.

Stop after the final report.
