# ParkEase — Master Prompt for Full Website UI/UX Redesign

Act as a senior product designer, creative frontend engineer, design-systems specialist, 3D web experience designer, and motion-design engineer. Redesign the existing ParkEase Smart Parking Slot Management System into a premium, minimal, polished, memorable automotive-tech SaaS product.

This is a NEW Antigravity account. Do not depend on previous chat history. The existing repository and its documentation are the source of truth.

## 1. Project audit — mandatory before editing

Inspect the current Git status/diff first and preserve all existing user changes. Read:
- `PRD.md`
- `ARCHITECTURE.md`
- `RULES.md`
- `PHASE.md`
- the actual design specification filename (`design.md` or `DESIGN.md`)
- relevant `stitch-design/` assets, if present
- frontend routes, layouts, components, styles, Tailwind config, package scripts, dependencies, API utilities, authentication context, and relevant backend contracts (read-only unless a visual bug requires a minimal frontend-only fix).

Map every actual route and link. Identify existing functionality, loading states, design inconsistencies, broken/dead navigation, profile layout shifting, and current dependency/tool availability. Do not assume a feature exists just because it is described in a document.

The user explicitly authorizes a one-off, comprehensive **visual UI/UX redesign pass across the existing customer, public, and admin interfaces**, including the requested landing-page presentation, shared design system, pointer-reactive background texture, and profile layout-jump investigation. This authorization does not authorize unrelated backend features, Day 23 reporting/business logic, database changes, authentication rewrites, or removal of phase safeguards. Read `RULES.md` and `PHASE.md`; if either explicitly forbids a particular future-day implementation (for example, the full 3D car/GSAP scene), implement the non-conflicting authorized visual work and clearly list that blocked item rather than silently violating project rules. Do not ask for confirmation for routine, reversible frontend styling decisions. Pause only for destructive changes, paid assets/services, or major architecture decisions.

## 2. Verify design tools and skills — do not pretend

### UI/UX Pro Max
- Verify that the skill is genuinely accessible to this Antigravity agent.
- Read its `SKILL.md` and use its design-system generation/search guidance, typography pairing, color system, UX patterns, and responsive/accessibility checks where available.
- If its script requires Python or another missing runtime, check for an available compatible runtime/alternate supported workflow. Do not claim the skill was executed if it was only read or unavailable.

### 21st.dev
- Verify the actual `@21st-dev/cli` command, installed version, authentication state, and supported Antigravity-compatible component workflow. Do not substitute an unrelated package name and conclude the official CLI is unavailable.
- Search for high-quality relevant components before implementing complex components from scratch. Prefer components suitable for the current React + Vite + Tailwind setup.
- Inspect generated component code, accessibility, dependency impact, and styling before integrating. Do not add a component just because it exists; maintain the ParkEase visual system.
- Skills installed for Claude, Cursor, or Codex are not automatically available in Antigravity. Verify each integration independently.
- If a tool is unavailable, use a compatible local alternative and state the exact limitation in the final report.

## 3. Read and follow the updated `design.md`

Treat `design.md` as the visual source of truth after the audit. If the repo uses `DESIGN.md` capitalization, identify the real filename and update the correct document without creating conflicting duplicate specs. Update the repository's actual design document with the decisions made during the redesign. Keep it consistent with the implementation.

## 4. Core art direction — monochrome, premium, dark mood

The primary visual identity must be **black + white + charcoal + cool neutral gray**, with a refined dark mood. Light mode should be clean white with crisp black text, not a generic color inversion. Use accent color only where meaningful (primary action, selected state, semantic status); do not return to a green-dominant UI.

- Dark base: near-black `#08090B`; surfaces around `#101114` and `#17191D`; subtle borders around `#292B30`; primary text around `#F5F5F5`.
- Light base: `#FAFAFA` / white surfaces; primary text `#111113`; subtle borders `#E4E4E7`.
- Keep whitespace, alignment, typography, contrast, and component consistency intentional.
- Avoid generic AI landing-page patterns, huge headings, too many cards, excessive gradients, neon, decorative glassmorphism, random floating blobs, and excessive rounded containers.
- Use subtle fine-grid, dot-grid, noise, or micro-grid texture inspired by premium developer websites such as Vercel. It must be understated and behind content.

### Cursor-reactive texture
- On capable desktop devices, create a subtle wave/ripple/displacement response in the background texture as the cursor moves. It should feel tactile and refined, not like a glowing spotlight or neon trail.
- Prefer lightweight CSS/SVG/canvas or an already-available suitable solution. Do not add heavy WebGL just for the texture.
- Decorative layers must never intercept pointer events or block text selection/navigation.
- Optimize event updates, avoid excessive re-renders, and disable/reduce on touch devices, reduced-motion settings, and low-power contexts.
- Ensure text contrast and interaction remain unaffected.

## 5. Typography — use a purposeful mix

Use UI/UX Pro Max to choose and justify the font pairing. Do not use JetBrains Mono as the font for every part of the website.
- Use one highly readable modern sans-serif (e.g. Geist Sans or Inter, depending on actual skill guidance and project compatibility) for body copy, navigation, forms, buttons, and most headings.
- Use a mono font (e.g. Geist Mono or JetBrains Mono) selectively for slot IDs, timestamps, technical labels, IDs, and data where it improves scanability.
- Use a display style only if the skill's recommendation supports it; do not mix many similar font families.
- Load fonts using the existing approved project approach, with fallbacks. Avoid unnecessary font packages and layout shifts during font loading.
- Establish hierarchy with font size, weight, line-height, tracking, and spacing. Keep body copy comfortable and readable.

## 6. Premium rectangular buttons and components

Create a coherent design system and reusable primitives before styling every page independently.
- Premium rectangular/square-corner buttons; typical radius 6–9px, not pill-shaped by default.
- Clear primary, secondary, outline, ghost, danger, and icon-button variants.
- Hover: refined background/text/border color change, subtle icon movement or 1–2px lift where appropriate. No exaggerated bounce, excessive glow, or button size changes.
- Active/pressed states must feel tactile and must not cause layout shift.
- Keep most transitions around 140–220ms and respect `prefers-reduced-motion`.
- Inputs, tables, dropdowns, dialogs, tabs, badges, cards, sidebars, nav, toasts, loading skeletons, and empty/error/success states must share the same visual language.
- Use badges/pills only where they communicate status or compact metadata.
- Ensure visible keyboard focus and accessible contrast.

## 7. Redesign the full existing website consistently

Audit actual routes first. Redesign all relevant public, customer, and admin pages that exist in the repository. Preserve existing business logic, API integrations, authentication, role authorization, and data contracts.

### Landing page
- Make it more premium, content-rich, and product-specific, while keeping the layout clear and editorial.
- Include an elegant responsive navigation, meaningful hero copy, primary CTA, product explanation, how-it-works steps, feature sections, a parking-slot preview, benefits, final CTA, and professional footer.
- Every visible navigation link must lead to a meaningful destination. Links like Features, How It Works, and About should have their own dedicated pages (`/features`, `/how-it-works`, `/about`) if they are shown as page links and do not already have equivalent routes. Reuse existing routes rather than creating duplicates. Never leave `href="#"`, dead anchors, or links that all lead to the same generic page.
- Keep copy grounded in actual ParkEase functionality. Do not invent customer counts, testimonials, integrations, live availability, or unsupported claims.
- Add a small parking-slot preview. Use real API data when a public API supports it. If using sample data for a visual preview, clearly label it as a demo/illustration and never imply it is live availability.
- Add a **Show more** action. If the visitor is unauthenticated, clicking it must route to `/login` and preserve a safe return path if the current router supports that. Do not expose protected data or allow unauthenticated reservations.
- Use the requested monochrome textured visual identity and restrained interactions.

### 3D car and scroll motion
- First inspect existing dependencies, current `PHASE.md`, assets, performance budget, and any suitable licensed project-owned asset.
- If authorized by the current rules/scope, build a lightweight premium car/parking visual using React Three Fiber + Drei and GSAP + ScrollTrigger for scroll-linked scale/position/rotation and a transition from studio car to parking-slot environment.
- Use a verified, appropriately licensed asset if available; otherwise use a restrained lightweight procedural/simplified vehicle. Do not download large or paid assets without approval.
- Use Motion for React for component interactions; do not let Motion and GSAP animate the same transform simultaneously.
- Include loading/poster fallback, graceful WebGL failure fallback, reduced-motion support, and mobile/low-power simplification. Do not obscure text or navigation.
- Avoid scroll hijacking, excessive pinned sections, expensive reflections, or animations that hide content. If phase rules prohibit full 3D/GSAP work right now, implement the non-conflicting UI and document the 3D work as blocked by scope.

### Customer parking and reservations
- Polish the search/filter interface, slot grid/cards, availability states, selected state, reservation summary, and details/history pages that actually exist.
- Make available, reserved, occupied, and maintenance states distinguishable through labels/icons as well as color.
- Keep filters limited to those supported by backend data/contracts.
- Provide loading, empty, invalid date/time, conflict, API error, and confirmation states.
- Preserve availability rules and reservation conflict handling; never simulate successful API actions.

### Login and registration
- Minimal, polished, responsive forms with consistent typography, proper validation, password visibility, disabled/loading states, and helpful error feedback.
- Preserve real backend authentication. Do not fake successful login, add unsupported social login/password reset, or change JWT/auth architecture.
- Preserve strict Admin/Customer role separation and existing route behavior.

### Customer profile — fix the page jump
The profile page currently visibly jumps/shifts when opened. Diagnose and fix the root cause, not merely hide it with CSS.
- Inspect React route/layout mounting, unstable keys, conditional layout rendering, nested layouts, authentication/profile loading, duplicate effects, scroll restoration, font loading, and asynchronous content height changes.
- Keep shared customer navigation/layout mounted across related routes where compatible with the current architecture.
- Use loading skeletons that match final geometry and reserve image/avatar dimensions to reduce cumulative layout shift.
- Prevent a late data response from changing the whole page structure unexpectedly.
- Avoid arbitrary fixed positioning or fixed heights unless justified.
- Test direct URL load, internal navigation, refresh, and delayed API response on `/profile` and adjacent customer routes.
- Preserve profile/vehicle/reservation features already supported by the backend.

### Admin panel
- Redesign the admin login, dashboard, sidebar, topbar, tables, filters, forms, pricing, lots, slots, reservations, sessions, customers, and reports pages that actually exist.
- Use a professional information hierarchy, consistent monochrome surfaces, concise labels, responsive tables, clear action menus, and useful loading/empty/error states.
- Use real API metrics only. Label demo/seed data clearly. Simulated payment must clearly say no real money is charged; use “Demo Revenue” for simulated totals.
- Keep Admin and Customer navigation separate and preserve backend authorization. Do not implement new report/business logic outside the authorized scope.

## 8. Motion system

Use Motion for React for buttons, navigation, dropdowns, dialogs, slot selection, theme toggle, and restrained page/component transitions. Use GSAP + ScrollTrigger only for authorized landing scroll storytelling and 3D scene progression.
- Do not animate every element.
- Avoid layout shift, scroll hijacking, excessive parallax, and animating the entire page container on every route.
- Clean up animation timelines, ScrollTriggers, listeners, and WebGL resources.
- Respect reduced motion and keep content accessible if animation fails or is disabled.
- Ensure hover is not the only way to discover or operate a feature.

## 9. Responsive and accessibility requirements

- Test narrow mobile, standard mobile, tablet, laptop, and wide desktop.
- Avoid horizontal overflow and maintain usable touch targets.
- Make navigation, forms, tables, dialogs, and parking slots usable on touch screens.
- Use semantic HTML, labelled inputs, keyboard navigation, visible focus, contrast, and reduced-motion support.
- Disable or simplify cursor texture and heavy 3D on touch/low-power devices.
- Avoid layout shifts from fonts, images, and loading states.

## 10. Implementation guardrails

- Preserve React + Vite + Tailwind architecture, Node.js/Express/MySQL integration, route contracts, and existing features.
- Do not change database schema, backend business logic, auth system, API contracts, or environment secrets for visual redesign.
- Do not replace MySQL or rewrite the app from scratch.
- Do not delete or overwrite working code without a justified, scoped reason. Inspect the Git diff before and after.
- Add dependencies only when genuinely required and compatible. Explain each dependency added.
- Do not hardcode customer, reservation, slot, or revenue data as live information.
- Do not use paid assets/services without approval.
- Update the actual design specification so it accurately documents the chosen palette, font pairing, texture, button system, route/page design, motion rules, profile stability requirements, and accessibility rules.

## 11. Workflow

### Phase A — Audit
Inspect docs, actual routes, shared components, dependencies, tool access, current Git changes, API dependencies, and profile jump. Identify existing routes versus missing destinations.

### Phase B — Design proposal
Use UI/UX Pro Max and 21st.dev where genuinely available. Write a concise proposal covering:
- chosen font pair and palette
- background texture technique
- button/component system
- pages/routes to redesign or add
- profile jump root-cause hypothesis and investigation plan
- 3D/motion strategy and fallbacks
- component sources and dependency changes
- exact files likely to change

Then proceed with reversible, in-scope frontend implementation without waiting for another user message. Pause only for destructive actions, paid services/assets, or major architecture decisions.

### Phase C — Shared system
Implement consistent tokens, fonts, backgrounds, buttons, navigation, theme handling, forms, cards, tables, status indicators, and feedback states.

### Phase D — Pages
Redesign all in-scope existing public/customer/admin pages, create dedicated pages for visible public links where missing, add the auth-gated slot preview, and fix the profile layout jump.

### Phase E — Motion / 3D
Implement only the motion/3D scope authorized by `RULES.md` and `PHASE.md`. Include fallbacks, performance safeguards, and reduced-motion behavior. Report anything blocked by phase constraints.

### Phase F — Validation
Run available frontend lint/build/tests. Verify actual routes, internal links, responsive layouts, profile navigation stability, API integration, auth redirects, console errors where a browser workflow is available, and reduced-motion/WebGL fallback behavior. Do not claim a test passed unless it was actually executed.

## 12. Final report

Report clearly:
1. Design direction and font pairing chosen
2. UI/UX Pro Max skill: exact usage or limitation
3. 21st.dev components used, or why none were appropriate/available
4. Pages/routes redesigned and new dedicated pages added
5. Cursor-reactive background implementation and fallbacks
6. 3D car / GSAP / Motion work actually implemented, and any phase-blocked items
7. Profile page jump: root cause found and fix applied
8. Files changed
9. Dependencies added and reasons
10. Build/lint/test results with actual commands and outcomes
11. Remaining issues and next steps

Start with the audit and design proposal. Deliver a cohesive, refined, functional ParkEase experience—not a pile of unrelated visual effects.
