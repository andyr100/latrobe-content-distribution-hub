# La Trobe Content Distribution Hub — Codex Package

This package reconstructs the detailed requirements agreed through the earlier clarification discussion. It is not a renamed LaTrobeRSS package and it is not a generic content-management application.

## Correct product interpretation

The application is a **frontend-only prototype of a university RSS publishing and content-distribution server**.

A lecturer or administrator selects a mock user, creates an internal post, chooses one or more subject channels, confirms publication, and the interface simulates publishing that content to subject RSS feeds for later display in an LMS.

The same user can subscribe to mock external RSS sources, review aggregated articles, and republish a selected external article to subject channels using the exact same reusable publishing workflow.

## Source-of-truth order

1. Formal Assessment 1 instructions and rubric
2. `01_CODEX_MASTER_PROMPT.md`
3. `02_CONFIRMED_REQUIREMENTS.md`
4. Backlog and engineering documents in this package
5. Existing project code

Never silently simplify, reinterpret or remove a requirement.

## Package files

- `01_CODEX_MASTER_PROMPT.md` — complete implementation prompt recovered from the detailed discussion
- `02_CONFIRMED_REQUIREMENTS.md` — consolidated product decisions and exclusions
- `03_REQUIREMENTS_TRACEABILITY.md` — mapping from assessment requirements to implementation evidence
- `04_PRODUCT_BACKLOG.md` — detailed backlog with acceptance criteria
- `05_ARCHITECTURE_AND_COMPONENTS.md` — framework, state, folders and reusable components
- `06_UI_UX_AND_ACCESSIBILITY.md` — visual system and responsive/accessibility rules
- `07_MOCK_DATA_SPECIFICATION.md` — users, channels, classifications, feeds and synthetic content
- `08_GIT_MILESTONES.md` — mandatory chronological branch/commit lifecycle
- `09_TESTING_SUBMISSION_AND_VIDEO.md` — validation, README, video and submission checks

## Non-negotiable boundaries

- created from `npx create-next-app .`
- Next.js App Router
- React and TypeScript
- frontend only
- no database
- no real authentication
- no API routes for backend behaviour
- no live RSS parsing
- no LMS connection
- all posting, channel management and feed subscriptions are simulations
- browser storage only for permitted preferences and mock state
- genuine Git history produced while features are implemented
