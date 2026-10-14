# Manus AI Prompt: ParkEase Technical Documentation PDF

## Your role and objective

Act as a senior software architect, backend engineer, database analyst, API documentation specialist, and technical educator. Analyze the **actual ParkEase repository available at `E:\ParkEase`** and create one polished, accurate, highly detailed technical-documentation PDF for the university project team.

The PDF must teach how the running implementation works internally, especially its MySQL schema, SQL queries, REST API, authentication and authorization, reservation rules, and end-to-end data flow. It is not a marketing brochure and must not merely restate the README or planning documents.

**Do not modify the repository, application source, database, configuration, or documentation. Do not install packages or execute database writes. Your deliverable is the PDF only.** If you cannot access the source repository, say so and do not invent implementation details.

## Source-of-truth rules and safety

1. Inspect the real executable source, SQL DDL, route registration, tests, and frontend callers. Planning documents and README are useful navigation aids, not proof that a feature exists.
2. Read the project documentation first: `RULES.md`, `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `PHASE.md`, `REDESIGN_PHASE.md`, `README.md`, `ANIMATION.md`, and `ROUTE_MAP.md` when present. Then verify every material claim against source.
3. The actual code and canonical schema are authoritative for current behavior. Identify and explain discrepancies between implementation and documentation rather than silently choosing a planned behavior.
4. Use evidence labels consistently:
   - **Verified** — directly demonstrated by executable source, schema, or test.
   - **Partially verified** — some details are supported, but others are not.
   - **Planned** — appears in a plan/specification only.
   - **Not implemented** — source evidence establishes that it is absent.
   - **Not verified** — the available evidence is insufficient.
5. Give a source path and, where practical, a verified function/class/route/schema symbol for each important claim. Add line references only after checking them; never fabricate line numbers.
6. Never disclose, reproduce, or infer secret values, credentials, tokens, personal records, or private production information. You may describe environment-variable **names and purposes**, but never values.
7. Do not quote `.env`, `.env.production`, credential-bearing configuration, live logs, or personal data. Do not reproduce data rows from `parkease_backup.sql`; if you inspect it for schema comparison, use only relevant DDL and avoid sensitive contents. Use fictional values in examples, explicitly marked **Example — fictional data**.
8. Do not connect to a production database or execute SQL that changes data or schema. Reading source files and schema definitions is sufficient. Do not present a source-based conclusion as a live-database verification.
9. Do not invent API fields, HTTP status codes, constraints, table relationships, indexes, error responses, performance figures, test coverage, row counts, or integrations. Where evidence is missing, say so.
10. Describe concerns neutrally and traceably. Distinguish an observed behavior, a potential risk, and a confirmed vulnerability; do not overstate.

## Verified ParkEase orientation (starting map, not a substitute for inspection)

The project currently documents and implements a full-stack smart-parking demo. Confirm all details against the current files before publication.

- **Frontend:** React 19, React Router 7, Vite 8, Tailwind CSS. Application entry: `frontend/src/main.jsx`; route/provider composition: `frontend/src/App.jsx`. The centralized HTTP client is `frontend/src/lib/api.js`; auth state is in `frontend/src/context/AuthContext.jsx`.
- **Backend:** Node.js ES modules, Express 4, `mysql2/promise`, `bcryptjs`, and `jsonwebtoken`. Server startup and graceful pool shutdown: `backend/src/server.js`; environment validation: `backend/src/config/env.js`; database pool: `backend/src/config/database.js`; Express/middleware setup: `backend/src/app.js`.
- **Database:** MySQL 8+ / InnoDB. Treat `database/schema.sql` as the canonical schema; compare `database/init.sql` and `database/production_missing_tables.sql` carefully because they are alternative/additive SQL scripts, not an automated migration history. `database/reports_demonstration.sql` includes optional synthetic report evidence/data; never apply it. The repository also has `parkease_backup.sql`; avoid exposing any data from it.
- **The canonical schema is expected to contain eight core tables:** `users`, `vehicles`, `parking_lots`, `parking_slots`, `pricing_rules`, `reservations`, `parking_sessions`, and `payments`. Inspect the actual DDL for every column/type/default/nullability/key/index/action; do not rely on this table-name list as proof of detailed constraints.
- **Backend module roots:** `backend/src/modules/auth/`, `users/`, `vehicles/`, `parking/`, `reservations/`, `sessions/`, `payments/`, `pricing/`, and `reports/`. Each has route/controller/service/validation files where implemented. The root route index is `backend/src/routes/index.js`; authentication and role middleware are under `backend/src/middleware/`.
- **API base:** Frontend defaults to `/api/v1` (with `VITE_API_URL` override); Vite proxies `/api` to the local backend. Backend route registration also exposes unversioned aliases for module routes. Verify complete paths and middleware from route registration, not just module route files.
- **Frontend route/page map:** Inspect `frontend/src/App.jsx`, layout components, page components, and `frontend/src/lib/api.js`. Current route families include public landing/information/auth pages; customer parking, reservations, and profile; and admin operations/reports. A route or navigation label is not proof that the corresponding backend capability is complete.
- **Important implementation distinctions to verify and explain:** admin customer UI is a placeholder and no customer-directory list endpoint was found in the inspected route modules; payments are admin-only demo records, not customer payment processing or a gateway; the car scene is a procedural illustrative Three.js scene, not a photorealistic asset or live availability feed; there is no configured backend rate limiter; no password reset, account verification, token refresh/revocation, live payment gateway, or frontend unit/E2E test suite was found in the inspected source. Recheck these before describing them as current facts.
- **Motion/3D:** `frontend/src/components/scene/ParkingScene.jsx` uses Three.js directly with `OrbitControls`, not React Three Fiber/Drei. Static fallback: `ParkingScenePoster.jsx`. Read `ANIMATION.md` for documented behavior, then verify the current source.
- **Environment and deployment:** backend settings are loaded through `backend/src/config/env.js`; inspect only variable names and source logic. Vercel-specific files include `backend/api/index.js`, `backend/vercel.json`, and `frontend/vercel.json`. Do not assume another deployment target exists unless files confirm it.
- **Test evidence:** backend tests use Node's test runner in `backend/test/`; inspect relevant tests and identify what they actually assert. Frontend lint/build scripts are in `frontend/package.json`. Do not claim any test was executed by this documentation task unless you execute it; executing tests is optional and must not require external services or mutate a database.

## Investigation procedure

Work from repository structure to source evidence and trace the whole application:

1. Inventory root files/directories, manifests/scripts, frontend route tree, backend entry points, route registration, middleware, feature modules, schema/scripts, tests/fixtures, and deployment files.
2. Map every frontend page/component API call to its exact API-client method, HTTP method/path, backend router/handler, service function, SQL statement(s), affected tables, response shape, and UI state update.
3. Read all actual SQL from backend modules and any SQL scripts/functions relevant to runtime behavior. Search controllers, services, models/repositories, route handlers, helpers, transaction code, and reports. Capture query text and parameter order from source. Give each query a stable ID (for example `Q-PARK-AVAIL-01`) and maintain a complete query index.
4. Inspect validation, response/error helpers, authentication, role/ownership checks, CORS/security middleware, pool settings, transaction commit/rollback paths, and relevant tests.
5. Inspect frontend routes, public/customer/admin layouts, auth guards, API client/base URL, token persistence, data-fetch/state handling, loading/error/empty states, and actual component callers.
6. Trace core user actions across all layers. For each flow distinguish **request input**, **validated/normalized input**, **database read/write**, **server-calculated values**, **response fields**, and **frontend-rendered state**.
7. Compare implementation with `PRD.md`, `ARCHITECTURE.md`, `ROUTE_MAP.md`, `PHASE.md`, and the UI/redesign documentation. Call out proposed or planned behavior that is not implemented.
8. Base the final PDF only on inspected evidence. If a feature, schema detail, SQL effect, deployment setting, or test result cannot be verified, label the gap.

## Required database analysis

Database coverage is a primary deliverable; it must be unusually thorough and auditable.

### Database architecture

Explain the database engine/version only as far as verified; pool/connection setup; environment-variable usage without values; timezone/connection options; query execution and parameter binding; connection acquisition/release; database error handling; schema initialization/maintenance approach; transaction boundaries and rollback behavior. State clearly whether SQL scripts are migrations, seed/demo scripts, or one-time initialization. Do not conflate the canonical schema with backup or additive scripts.

### Complete table catalog

Document every actual table from the canonical DDL, not merely the expected eight. For each table provide:

- Exact name and business purpose.
- Every column with exact SQL type, nullability, default, and auto-generation behavior as declared.
- Primary key, every foreign key and referenced column, and `ON DELETE`/`ON UPDATE` action.
- Unique constraints, indexes, checks, enums, generated fields, and other constraints.
- Relationship/cardinality justified by keys and application behavior.
- Which runtime modules/query IDs read or write it and which API operations trigger those accesses.
- Business rules enforced by schema versus application code.
- Any mismatch between `schema.sql`, alternate SQL scripts, backup DDL, runtime SQL, or project documentation.

Use **“Not verified from source code”** for details that cannot be established. Do not assume a conventional constraint exists.

### ER diagrams

Include a Mermaid `erDiagram` or equivalent high-resolution vector diagram of all verified tables, showing PK/FK fields and relationship cardinalities derived from actual keys and verified business logic. Explain important relationships in Bangla. For readability, include both an overall view and smaller logical group diagrams if needed. Do not create relationships based solely on matching column names.

### SQL/query catalog

Search the entire backend and relevant SQL scripts for actual queries, not just functions named “query.” Include a complete inventory and detailed explanations of all business-critical queries; group repetitive low-level operations in an appendix without omitting them from the inventory.

For each important query record:

1. Stable query ID and functional module.
2. Exact file and enclosing function.
3. Calling endpoint or internal operation.
4. Readable, faithful SQL from the source (preserve predicates, joins, ordering, grouping, limits, and locking clauses; do not silently “improve” it).
5. Each bound value in positional order, its source (path/query/body/authenticated identity/internal calculation), and any normalization/conversion.
6. Whether values are bound through prepared/parameterized execution and which values, if any, are interpolated as SQL structure.
7. Tables read/inserted/updated/deleted and columns affected.
8. Join/filter/overlap/status/sort/aggregate/pagination/locking logic in easy natural Bangla with English technical terms.
9. Result shape and how the service/controller transforms or uses it.
10. How results reach the frontend, where verifiable.
11. Error and transaction behavior, including rollback/commit and relevant race/concurrency implications.
12. One clearly fictional example with small sample values and a plain-language walkthrough.

Prioritize authentication/registration, profile/vehicles, lots/slots, availability, reservation creation/cancel/status, session entry/exit, effective pricing, demo-payment creation, and reports/dashboard aggregates. Include all actual query variants that materially change behavior.

Investigate the implementation's exact reservation overlap rule, blocking statuses, active-session checks, UTC/timestamp conversion, validation limits, price snapshot, fee rounding/minimum, fallback pricing (if any), locking strategy, unique constraints, and what happens during simultaneous booking. Explain which protections are database-backed, transaction-backed, application-only, or absent/unverified. Do not call availability a guarantee if booking rechecks it separately.

## Complete API reference

Inspect every registered backend route, aliases, route-level middleware, validation schemas, controller/handler, service, SQL, and relevant tests. Produce:

1. A complete endpoint inventory table with method, full route path (both versioned path and alias if actually mounted), public/authenticated/role/ownership rules, handler/module, and main query IDs/tables.
2. A detailed section for every endpoint, including:
   - Method, exact path, full URL pattern relative to actual base path, purpose.
   - Authentication, required role, resource ownership, route middleware order.
   - Path/query/body parameters, relevant headers, validation and defaults.
   - Fictional request example; never use actual user/secret data.
   - Handler, service function, SQL/query IDs, tables read/written, and side effects.
   - Success HTTP status and exact response shape based on implementation/tests.
   - Actual error status/shape and conditions supported by source/tests.
   - Frontend page/component caller or “Not verified” if no caller exists.
3. A short explanation of global request flow: entry point → router → middleware → validation → controller/service → SQL/pool → response/error handler → API client → UI state.

Do not infer endpoint names from documentation suggestions. Check both module route definitions and root route registration; aliases must be documented accurately.

## Backend modules and actual workflows

For each implemented backend module, explain responsibility, source files, exposed routes, calls/dependencies, data entering, validation/authorization, business rules, SQL IDs/tables, returned/persisted data, and error/transaction behavior. Use chronological numbered steps rather than vague feature summaries.

Investigate and accurately classify:

- **Authentication:** registration, bcrypt hashing/verification, role-specific customer/admin login, JWT contents/lifetime/configuration (no secret values), `/me`, middleware token parsing, authorization, frontend persistence, logout behavior. Report token revocation/refresh or password recovery only if implemented.
- **Availability:** source query, filters/compatibility, slot operational status, reservation interval, active sessions, response, frontend display. Do not describe it as sensor-driven/live unless verified.
- **Reservation:** UI action → request → validation/ownership/vehicle checks → transaction/locks/conflict recheck → pricing/rate snapshot/calculation → insert/status → response → frontend rendering. Explain concurrency protection and residual gaps exactly as implemented.
- **Parking session:** admin entry, valid reservation/vehicle/slot association, duplicate active checks, timestamps, exit transitions, rate snapshot, fee calculation/rounding, related reservation update, errors and transactions.
- **Pricing:** effective rule selection, rule creation/deactivation, transaction and consistency rules, rate snapshots.
- **Payments:** actual simulated record flow, access permissions, session eligibility, duplicate protection, amount/reference/status, and the explicit absence of real gateway/money movement/refunds if confirmed.
- **Admin:** dashboard, lots/slots, reservation/status operations, sessions, pricing, payments, reports, customer management gaps/placeholder UI. Never mistake an admin page stub for implemented API behavior.
- **Error flow:** validation/database/service errors through shared middleware and HTTP response, development-only details if present, and actual frontend error states.
- Cover customer profile/vehicles and reporting as separate implemented modules.

If a requested business flow is missing or partial, label it plainly. In particular, distinguish a customer-visible payment page expectation from the actual backend permission/workflow.

## End-to-end data lineage

For every major implemented action, trace:

**User action → frontend route/component/function → API client → HTTP method/path/body/query/headers → router/middleware → controller/service → SQL query ID and bound values → database tables/columns → result transformation → HTTP response → frontend state update → rendered UI.**

Provide detailed lineage for at minimum register/login, parking search/availability, reservation creation and cancellation, profile/vehicle CRUD, admin lot/slot management, session entry/exit and fee calculation, pricing lookup/update, demo-payment creation, and each important report/dashboard view that exists.

For each map state where data originates; what is client-supplied versus server-derived; what is persisted; what is returned; how the UI consumes it; and where errors/conflicts can interrupt it. Use exact verified file/function/endpoint/query/table names.

## Frontend architecture and integration

Explain actual entry and route configuration; public/customer/admin route boundaries and guards; layouts/shared UI; API base URL/proxy; auth/token storage; state/data-fetch pattern; loading/empty/error behavior; and page/component-to-API mapping. Explain how database-backed fields are rendered, not just the visual design. Call out frontend pages without a backend counterpart and backend endpoints with no verified frontend caller.

Do not present design/roadmap pages as live pages. Mention the implemented Three.js scene only as illustrative UI behavior; it is not a database-backed parking sensor.

## Security and data integrity

Based on source evidence, explain:

- Password hashing and verification; safe user serialization.
- JWT authentication, customer/admin role separation, ownership checks.
- SQL parameterization and any dynamically assembled SQL structure.
- Request validation and allow-listed fields.
- CORS, security headers, rate limiting presence/absence, and relevant middleware.
- Environment secret handling without values.
- Schema keys/constraints, transactions, locking and race handling.
- Error responses/logging and potential sensitive-detail exposure.
- Browser token persistence and its implications, phrased as an implementation observation rather than an unsupported exploit claim.

Separate verified controls, limitations, and unverified items. Do not provide exploit instructions or claim a vulnerability unless source supports it. Never include secret values.

## Diagrams, matrices, and evidence

The PDF must be visually instructive, not text-only. Include clear captions and accompanying explanations for:

1. System architecture: browser/UI, API client, backend entry/router/middleware, modules/services, MySQL, and only verified external services.
2. Complete ER diagram and table/FK relationship overview.
3. Backend module dependency diagram (routes → controllers → services/query modules → database).
4. API request lifecycle flowchart including validation, auth, SQL success, and error paths.
5. Reservation creation sequence diagram, including availability recheck, transaction/lock, conflict outcome, insert, commit/rollback.
6. Authentication sequence diagram reflecting the actual customer/admin login and protected-request flow.
7. Data-lineage diagrams for the major flows above.
8. Query-to-table read/write matrix.
9. API-to-module/query matrix.
10. Frontend route/page/component → API endpoint → handler → query → table map.
11. Business-process flowcharts for availability, booking, session entry/exit, pricing, demo payment, and admin workflows that are actually implemented.
12. Optional additional graphs only when supported by source/tests.

Mermaid is preferred when legible. Ensure diagrams are rendered in the final PDF (not left as raw code), using vector diagrams or another readable rendering if necessary. Split wide diagrams/matrices into logical pages. Never invent traffic, latency, coverage percentages, performance benchmarks, or production data. Any illustrative numbers must be marked fictional.

## Language and teaching style

Write the PDF in **natural, accessible Bangla mixed with English technical terminology**:

- Explain in easy Bangla; retain clear technical terms in English (API, Controller, Middleware, SQL Query, JOIN, Foreign Key, Transaction, JWT, Request Body, Response).
- Preserve identifiers exactly: filenames, function names, table/column names, routes, SQL, enum/status values.
- Immediately explain difficult terms in plain Bangla.
- Assume basic programming knowledge, but explain how each component connects and why the step exists.
- Use a teaching tone suitable for the owner and a three-member university project team preparing for onboarding, debugging, future development, and project defense.
- Use numbered walkthroughs, comparison tables, small fictional examples, concise callouts, and diagrams.
- Do not let the Bangla paraphrase alter actual technical semantics.

## Suggested PDF organization

Adapt this structure to verified repository content; combine sections only when useful and explicitly state absent/unverified modules:

1. Cover and version/scope note
2. How to read this document and evidence labels
3. Project overview, roles, and actual scope
4. Executive architecture summary and technology stack
5. Repository structure and startup/configuration overview (variable names only)
6. System architecture diagram
7. Frontend routes, layouts, auth state, API client, and integration
8. Backend entry, middleware order, module responsibilities, and dependencies
9. Complete API inventory and endpoint reference
10. Database connection, schema lifecycle, pool, query execution, and transactions
11. Complete table-by-table data dictionary
12. ER diagrams and relationship explanations
13. SQL query inventory and detailed business-critical query walkthroughs
14. End-to-end data lineage maps
15. Authentication and authorization sequence
16. Parking availability and reservation lifecycle/concurrency
17. Sessions, fee calculations, pricing, and demo payments
18. Admin operations, dashboards, and reports
19. Error handling and data-integrity behavior
20. Security controls, limitations, and unverified areas
21. Tests and what they verify
22. Documentation-vs-code discrepancies and known limitations
23. Glossary
24. Appendices: file/source index, endpoint index, query index, table index, diagram index

## Visual and PDF quality requirements

Create a clean, professional, minimal university-project technical document:

- Clear hierarchy, consistent typography, page numbers, useful headers/footers, and a table of contents with page references where supported.
- Use a Unicode-capable Bangla font and verify that Bangla glyphs do not break or clip.
- Use monospace styling for SQL, paths, identifiers, routes, and code examples; syntax-highlight code where possible.
- Render diagrams at high resolution with readable labels, captions, and explanations.
- Keep SQL and its explanation together where practical. Use landscape pages only for genuinely wide diagrams/matrices.
- Prevent clipped text, broken glyphs, overlapping labels, overcrowded pages, and tiny table type.
- Split large tables/diagrams into manageable sections and repeat table headers where possible.
- Use restrained, accessible colors and consistent visual emphasis; prioritize legibility and completeness over decoration.

## Final accuracy checklist (must pass before delivery)

- Every documented route is registered in actual backend code; aliases are correct.
- Every documented response/status/validation/error claim is supported by handler, helper, or test evidence.
- The table list and all columns/constraints match canonical SQL DDL; discrepancies with other scripts are stated.
- Every important SQL query is faithfully transcribed and its actual bound parameter order/source is explained.
- Transaction and concurrency claims match the actual `beginTransaction` / lock / commit / rollback behavior.
- Every major UI-to-database-to-UI flow cites verified frontend and backend source.
- Planned versus implemented versus partial versus absent functionality is clearly distinguished.
- Demo payment is never represented as real payment or revenue; no real gateway is implied.
- No secrets, tokens, credential values, customer records, or real production data appear anywhere.
- Fictional examples are explicitly labeled as fictional.
- Every diagram renders correctly in the PDF and is explained in natural Bangla.

The reader should finish able to explain what happens after a user clicks an action; which endpoint is called; which middleware, handler, service, and query run; how each SQL clause and bound parameter works; which tables and columns change; what is calculated and returned; how the frontend updates; and which protections or limitations are genuinely present.

Do not fabricate missing evidence or substitute generic parking-system behavior for ParkEase. The final PDF must document **this repository's actual implementation**, including its gaps and inconsistencies. Do not generate a source-code patch or modify any project file.
