# RULES — AI Coding Agent Rules

## Read First

Before changing code, read these files in order:

1. `PRD.md`
2. `ARCHITECTURE.md`
3. `RULES.md`
4. `PHASE.md`
5. `DESIGN.md`
6. Relevant approved files in `stitch-design/`

If a required file does not exist, report the blocker briefly instead of inventing its contents. Treat the documentation as the project's source of truth.

## Absolute Day Rule

- The project is divided into 30 explicit days in `PHASE.md`.
- “Day 1” means Day 1 only. “Day 2” means Day 2 only.
- Never execute a future day automatically.
- “Continue”, “keep going”, “finish it”, or similar wording is not permission to execute a later day.
- If the requested day is unclear, ask one concise question.
- Complete only the requested day's scope, then STOP and wait for the next explicit day command.
- Do not silently combine days to save time.

## Communication Rules

- Be extremely concise.
- Do not repeat information already documented in `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `PHASE.md`, or this file.
- Do not narrate every action or list every file inspected.
- Do not provide tutorials unless explicitly requested.
- Do not discuss future phases unless explicitly asked.
- If requirements are clear, start working immediately.
- Ask a question only when missing information prevents safe or correct implementation.

### Default Completion Format

DONE

Changed:
- [brief item]
- [brief item]

Test:
- [brief result]

Blockers:
- None

Then STOP.

### When Blocked

Use only:

BLOCKED:
[One short sentence stating exactly what is needed.]

## Coding Rules

- Inspect existing code before editing.
- Preserve working functionality and existing API contracts.
- Do not rewrite unrelated files or architecture.
- Reuse components, utilities, and established project patterns.
- Avoid unnecessary dependencies.
- Keep animation/3D implementation isolated and clean up animation resources on unmount.
- Validate inputs on both client and server where appropriate; the server remains authoritative.
- Use parameterized SQL. Never concatenate untrusted input into SQL.
- Handle loading, success, empty, validation, and error states.
- Test meaningful changes and fix obvious regressions before reporting completion.
- Do not claim tests passed unless they were actually run.

## Design Rules

- `DESIGN.md` and approved exports in `stitch-design/` are the visual source of truth.
- Do not replace approved design with a generic template.
- Use JetBrains Mono as the primary font.
- Maintain the approved Midnight Navy / Emerald / Cool Neutral color system and intentional dark/light themes.
- Use GSAP + ScrollTrigger for landing-page scroll choreography, Motion for React for UI interactions, and Three.js only for justified 3D visuals.
- Do not let GSAP and Motion animate the same element transform simultaneously.
- Avoid excessive glass, gradients, glow, rounded cards, and random animation.
- Respect `prefers-reduced-motion`; simplify heavy 3D effects on mobile.
- Keep all controls keyboard accessible with visible focus states and readable contrast.
- Do not fabricate live data or make non-functional buttons appear functional.

## Accuracy Rules

Never invent achievements, employers, clients, certifications, awards, project results, users, revenue, testimonials, live availability, or links. Clearly label seed/demo data. Demo payment must never be presented as a real transaction.

## Images and Assets

- Reuse existing approved project assets where available.
- Do not replace an existing user's face/profile photo with an AI-generated face.
- Do not use copyrighted third-party assets as if they belong to ParkEase.
- Prefer optimized, licensed, or project-owned assets; provide fallbacks for missing 3D assets.

## Security Rules

- Never hard-code passwords, API secrets, tokens, or private keys.
- Never commit `.env` or real credentials.
- Keep `.env.example` limited to variable names and safe placeholders.
- Never expose password hashes, tokens, or sensitive user data in logs or API responses.
- Public registration creates customer accounts only; never permit self-registration as admin.
- Enforce authentication, role permissions, and resource ownership on the backend.
- Do not collect real card numbers, CVV, PIN, OTP, or mobile banking credentials.
- Do not integrate a real payment gateway. Payments are simulated only.

## Performance Rules

- Prefer GPU-friendly animation properties.
- Respect `prefers-reduced-motion`.
- Lazy-load heavy 3D scenes where possible.
- Simplify or disable expensive textures, particles, and effects on mobile.
- Avoid animation leaks, unnecessary rerenders, layout shifts, and oversized assets.

## Stop Condition

Complete only the explicitly requested day/task. Verify the work, provide the short completion report, and wait.
