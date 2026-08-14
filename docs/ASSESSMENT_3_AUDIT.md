# Assessment 3 repository audit

Audit date: 14 August 2026  
Baseline: `main` at `347dbdd` (`assessment-2-final`)

## Existing foundation

- The repository is a continuation of a create-next-app project and contains three Next.js 16.3.0 App Router applications using React 19.2.4 and TypeScript.
- The API already uses Sequelize 6.37 with SQLite, versioned migrations, idempotent seed data, transactions, indexes, and a named Docker volume.
- The existing `Feed` model is the canonical subject-channel/RSS-feed entity. Assessment 3 will extend it and will not add a duplicate `Channel` model.
- Posts, users, feed relationships, CRUD routes, combined and channel RSS routes, `/health`, `/count`, `/stats`, the standalone RSS client, and Docker health checks already work.
- The frontend already provides a responsive, accessible shell, keyboard-aware navigation and modals, light/dark themes, database-backed content, and a compact Assessment 2 dashboard.
- Isolated API tests already use a temporary SQLite database and clean it up after execution.

## Required extensions

- Replace the single-counter-only analytics design with persistent `RequestLog`, `FeedStatusEvent`, and `Alert` records while keeping `RequestCounter` and `/count` compatible.
- Instrument successful, empty, missing, and failed RSS requests with client ID, endpoint, status, duration, source, user agent, feed association, and timestamp.
- Give the standalone RSS client a stable local-storage client ID and forward it through its server-side proxy.
- Add database-aggregated summary, per-feed, per-client, time-series, feed-status, alert, and recent-activity APIs with bounded filters.
- Extend the main dashboard with operational KPIs and accessible visual summaries, and add a focused Reports navigation destination.
- Add deterministic Assessment 3 simulation and metrics-only reset scripts without touching users, posts, feeds, or their relationships.
- Add Playwright server CRUD and browser RSS-client use cases, a parameterised JMeter plan and staged runner guidance, and reproducible Lighthouse documentation/evidence locations.
- Update Docker, CI, OpenAPI, README, assessment labels, and video talking points for Assessment 3. Add OpenTelemetry only if it remains compatible and proportionate after the assessed features are complete.

## Corrections and conflicts

- `RequestCounter` is useful for Assessment 2 compatibility but cannot provide per-feed, per-client, unique-client, or historical reporting. It will remain as a compatibility projection while new reporting reads `RequestLog`.
- The current RSS client proxy does not forward client identity, and API CORS does not allow `X-Client-Id`.
- The current dashboard reports publishing totals rather than operational health and usage.
- The current EC2 override keeps the RSS client private; a final-viewing deployment must explicitly publish it if the assessor needs direct access.
- The root `npm run verify` baseline stops at formatting because four pre-existing files fail Prettier: `frontend/app/about/page.tsx`, `frontend/components/settings/SettingsWorkspace.tsx`, `docker-compose.yml`, and `README.md`.
- Locked dependency installation reports audit findings in the API and frontend dependency trees. No blind `npm audit fix --force` will be used because it could introduce breaking upgrades.

## Compatibility and risk controls

- Migration `003` will only add operational tables and indexes; it will not rebuild or reset core Assessment 2 data.
- Existing RSS URLs and response XML remain unchanged. Instrumentation failures must not turn an otherwise valid RSS response into a failure.
- `/count` will retain `{ requestCount }` and continue measuring successful RSS responses.
- Metrics queries will aggregate in SQLite and use indexed timestamps/client/feed fields instead of loading an unbounded request history into React.
- Playwright records will use unique values and reliable cleanup against an isolated database/service configuration.
- Generated Playwright, Lighthouse, and JMeter output will be ignored unless intentionally retained as concise evidence.

## Verified baseline

- `npm run lint`: passed for frontend, API, and RSS client.
- `npm run test`: 7/7 API tests passed.
- `npm run build`: all three Next.js production builds passed.
- `docker compose up --build -d`: passed with all application images built.
- `scripts/smoke-test.ps1`: frontend, API health, feeds, RSS, RSS client, and SQLite restart persistence passed.
- `npm run format:check`: failed only on the four pre-existing files listed above.

## Implementation order

1. Operational models, migration, compatibility counter, simulation, and reset tooling.
2. RSS request instrumentation and stable client identity.
3. Aggregated metrics, feed-status, alert, and reporting APIs with tests.
4. Dashboard and Reports UI, navigation, accessible summaries, and live refresh.
5. Playwright, JMeter, Lighthouse workflow, and test documentation.
6. Optional compatible OpenTelemetry Compose profile, then full Docker and quality verification.
7. README, OpenAPI, video guidance, and final evidence checklist.
