# La Trobe Content Distribution Hub

This repository contains the complete Cloud Based Applications Assessment 2 submission. It extends the Assessment 1 interface into a backend-driven content distribution system: a publishing frontend creates and manages posts through a REST API, Sequelize persists them in SQLite, the API publishes RSS 2.0 XML, and a separate RSS Client receives and displays those feeds as a mock LMS.

The three applications import their API envelopes and DTOs from the local `@latrobe/api-contract` package in `shared/`. This keeps browser clients and API responses aligned with one TypeScript source of truth; `docs/openapi.yaml` is the machine-readable HTTP contract.

## Assessment requirements covered

| Requirement                  | Evidence in this submission                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database schema and ORM      | Sequelize models and migrations represent users/authors, posts, publication dates, body content, images, links, feeds and many-to-many post/feed assignments. Data persists in a named SQLite volume. |
| CRUD API                     | Posts can be created, listed/read, updated and deleted through predictable JSON endpoints. Validation and transactions prevent partial or invalid records.                                            |
| RSS Server and Client        | The API generates combined and channel-specific RSS 2.0 XML. A separate Next.js RSS Client parses and displays a selected feed.                                                                       |
| Operational endpoints        | `/health` checks the API and database, `/count` reports successful RSS requests, and `/stats` reports database-driven usage totals.                                                                   |
| Docker                       | Four independently running Compose services provide reproducible frontend, API, RSS Client and SQLite-volume operation with health checks.                                                            |
| Frontend/backend integration | Publishing, post management, dashboard statistics, channel pages and the read-only database inspector all use API/database data.                                                                      |
| Code quality and GitHub      | Modular TypeScript, shared DTOs, migrations, automated tests, lint/build checks, GitHub Actions, feature branches and documented setup.                                                               |

## Technology

- Next.js 16.3.0, React 19.2.4 and TypeScript
- Sequelize 6 with SQLite
- Node.js 20.19.5 Docker images
- Docker Compose
- Node's built-in test runner and GitHub Actions

## Architecture

| Compose service | Responsibility                                                         | Technology                                | Local port |
| --------------- | ---------------------------------------------------------------------- | ----------------------------------------- | ---------: |
| `frontend`      | Publishing UI, dashboard, post reader and read-only database inspector | Next.js, React, TypeScript                |       3000 |
| `api`           | REST API, RSS Server, validation, migrations and SQLite ownership      | Next.js Route Handlers, Sequelize, SQLite |       4000 |
| `rss-client`    | Separate mock LMS that parses and displays RSS                         | Next.js, React, TypeScript                |       5000 |
| `sqlite`        | Lightweight holder for the named SQLite volume                         | BusyBox                                   |          — |

These are four services in one Docker Compose stack, not four services in one container. Each service runs in its own container on the private Compose network. Only the API mounts the database at `/app/data/content-hub.sqlite`; the RSS Client never accesses SQLite directly.

```mermaid
flowchart LR
  Browser -->|JSON CRUD| Frontend[Frontend :3000]
  Frontend -->|REST| API[API and RSS Server :4000]
  RSSClient[RSS Client :5000] -->|RSS XML on selection / optional 15-second refresh| API
  API -->|Sequelize| SQLite[(SQLite named volume)]
```

## Repository structure

```text
latrobe-content-distribution-hub/
├── frontend/                 # Publishing/admin Next.js application
│   ├── app/                  # Dashboard, posts, channels, database and About pages
│   ├── components/           # Reusable interface and workflow components
│   └── Dockerfile
├── api/                      # REST API and RSS Server Next.js application
│   ├── app/                  # JSON, operational and RSS route handlers
│   ├── migrations/           # Versioned Sequelize schema changes
│   ├── models/               # User, Post, Feed, PostFeed and RequestCounter
│   ├── services/             # Post and RSS business logic
│   ├── tests/                # Isolated API/RSS integration tests
│   └── Dockerfile
├── rss-client/               # Separate mock LMS Next.js application
├── shared/                   # Shared API response and DTO TypeScript contract
├── docs/openapi.yaml         # Machine-readable API contract
├── scripts/smoke-test.ps1    # Docker health and persistence smoke test
├── docker-compose.yml        # Local four-service stack
└── docker-compose.ec2.override.yml
```

## Application pages

| URL                              | Purpose                                                                  |
| -------------------------------- | ------------------------------------------------------------------------ |
| `http://localhost:3000`          | Dashboard with database-driven post, feed and RSS-request statistics     |
| `http://localhost:3000/posts`    | Create, filter, edit and delete posts and assign one or more Channels    |
| `http://localhost:3000/channels` | Read-only fixed Channel catalogue and related posts                      |
| `http://localhost:3000/database` | Read-only table inspector used to demonstrate actual SQLite persistence  |
| `http://localhost:3000/workflow` | Explanation of the publishing-to-RSS workflow                            |
| `http://localhost:3000/settings` | Application preferences and Git commit information                       |
| `http://localhost:3000/about`    | Project scope, service ports and assessment-video embed                  |
| `http://localhost:5000`          | Separate RSS Client/mock LMS with channel selection and refresh controls |

## Database schema

Versioned Sequelize migrations create the schema. Startup applies only migrations that have not previously been recorded in `SchemaMigrations`, then the idempotent seed adds the four demo users, eight fixed feeds, sample posts, relationships and request counter. Production startup does not use `sequelize.sync()`.

```mermaid
erDiagram
  USER ||--o{ POST : authors
  POST ||--o{ POST_FEED : assigned_to
  FEED ||--o{ POST_FEED : contains
  USER {
    string id PK
    string name
    string email UK
    string role
  }
  POST {
    integer id PK
    string title
    text body
    string authorId FK
    datetime publishedAt
    string imageUrl
    string externalLink
  }
  FEED {
    string id PK
    string code UK
    string title
    string description
    string slug UK
  }
  POST_FEED {
    integer postId PK,FK
    string feedId PK,FK
  }
  REQUEST_COUNTER {
    string key PK
    integer count
  }
```

Foreign keys protect author and feed relationships. Join rows cascade when a post is deleted. Indexes cover publication dates, authors, feed codes/slugs and join-table lookup keys. The first migration also upgrades an earlier installation to the explicit `Feed`/`PostFeed` schema and removes the obsolete classification column without requiring the Docker volume to be deleted.

The UI calls feeds **Channels** because that is clearer to a publisher. The database calls them feeds because each record explicitly represents an RSS feed.

## API contract

JSON success responses use:

```json
{ "success": true, "data": {}, "meta": {} }
```

JSON errors use:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

| Method   | Endpoint                                                  | Purpose                                                         | Success |
| -------- | --------------------------------------------------------- | --------------------------------------------------------------- | ------: |
| `GET`    | `/api/posts?page=1&pageSize=20&search=&authorId=&feedId=` | Paginated post list and filters                                 |     200 |
| `POST`   | `/api/posts`                                              | Create a post and feed relationships transactionally            |     201 |
| `GET`    | `/api/posts/:id`                                          | Read one post                                                   |     200 |
| `PATCH`  | `/api/posts/:id`                                          | Update content, author, publication date or feed relationships  |     200 |
| `DELETE` | `/api/posts/:id`                                          | Delete a post and cascade its join rows                         |     200 |
| `GET`    | `/api/feeds`                                              | Read the fixed feed catalogue                                   |     200 |
| `GET`    | `/api/users`                                              | Read demo authors                                               |     200 |
| `GET`    | `/health`                                                 | API and database health                                         | 200/503 |
| `GET`    | `/count`                                                  | Successful RSS request count                                    |     200 |
| `GET`    | `/stats`                                                  | Post/feed totals, latest post, per-feed totals and RSS requests |     200 |
| `GET`    | `/rss`                                                    | Five newest unique posts as RSS 2.0 XML                         |     200 |
| `GET`    | `/rss/:channelCode`                                       | All posts for one channel as RSS 2.0 XML                        | 200/404 |

The fixed feed catalogue is intentionally read-only. Posts provide the assessment's complete create, read, update and delete workflow.

Example create payload:

```json
{
  "title": "Industry placement applications open",
  "body": "Applications close Friday.",
  "authorId": "administrator",
  "feedIds": ["internships", "csit-news"],
  "publishedAt": "2026-08-10T01:00:00.000Z",
  "imageUrl": null,
  "externalLink": "https://example.com/apply"
}
```

Invalid JSON, malformed pagination, empty content, unknown authors, unknown feeds, invalid dates and non-HTTP URLs return predictable 400 responses. Missing posts or channels return 404. CORS is deliberately non-credentialed and permissive for this authentication-free assessment demonstration.

Compatibility aliases `/api/topics` and `/api/rss/topics/:channelCode` remain temporarily available for older assessment links, but all current applications use `/api/feeds` and `/rss/:channelCode`.

The machine-readable OpenAPI contract is in [`docs/openapi.yaml`](docs/openapi.yaml).

## RSS behaviour

- `http://localhost:4000/rss` returns exactly the five newest posts.
- `http://localhost:4000/rss/FRONTIERLLMS` returns only that channel.
- Successful combined and channel RSS responses increment the persistent `/count` value.
- RSS titles, descriptions, authors, dates, GUIDs, links and optional images are XML-escaped consistently.
- Each item links to the readable frontend page at `http://localhost:3000/posts/:id`.
- The standalone client loads a selected channel automatically. Its switch can pause or resume the 15-second refresh, with a spinner and countdown while enabled. `NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED=true` controls the switch's default state at build time.

## Run with Docker

### Prerequisites

- Docker Desktop with Docker Compose v2
- Git
- Node.js 20 only when running checks or applications outside Docker

From a fresh clone, optionally copy `.env.example` to `.env`, then start the complete stack:

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

The `.env` file is optional because Compose supplies safe local defaults. It supports these presentation settings:

```env
# Initial state of the RSS Client auto-refresh switch
NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED=true

# Locally served recording displayed on the About page
NEXT_PUBLIC_ASSESSMENT_VIDEO_URL=/video/assessment-demo.mp4
```

These values are compiled into their browser applications. Run `docker compose up --build -d` after changing them. The RSS Client switch still pauses or resumes refresh immediately; reloading restores its environment-configured default.

Expected URLs:

- Frontend: http://localhost:3000
- API: http://localhost:4000
- RSS Client: http://localhost:5000
- Health: http://localhost:4000/health
- Request count: http://localhost:4000/count
- Statistics: http://localhost:4000/stats

To deliberately remove all demonstration data and test a fresh migration/seed:

```bash
docker compose down -v
docker compose up --build -d
```

Do not use `down -v` for a normal restart. This preserves the named SQLite volume:

```bash
docker compose restart api
```

On Windows, the repeatable smoke test checks all three ports, health, RSS XML and persistence across an API restart:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
```

## Local development and quality checks

```bash
npm ci
npm ci --prefix api
npm ci --prefix frontend
npm ci --prefix rss-client
npm run verify
```

`npm run verify` checks formatting, lints all three applications, runs isolated API/RSS tests and creates all three production builds. Tests use a temporary SQLite database and never modify Docker demonstration data. GitHub Actions runs the same quality gates on feature branches and pull requests.

Start applications without Docker in separate terminals:

```bash
npm run dev:api
npm run dev:frontend
npm run dev:rss-client
```

Migrations and the idempotent seed can also be run explicitly:

```bash
npm --prefix api run db:migrate
npm --prefix api run db:seed
```

## EC2 port override

Local development intentionally keeps `3000:3000`, `4000:4000` and `5000:5000`. The course diagram is represented by a separate override:

```bash
cp ec2.env.example ec2.env
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml up --build -d
```

| Service    | Container port |      EC2 host port |
| ---------- | -------------: | -----------------: |
| Frontend   |           3000 |                 80 |
| API        |           3000 |               4080 |
| RSS Client |           5000 | private by default |

Allow inbound TCP 80 and 4080 in the EC2 security group. Port 5000 is optional. The browser-facing frontend uses the public API URL from `ec2.env`, while the RSS Client proxy reaches `http://api:3000` on Docker's private network.

## Assessment video

The final demonstration should be no longer than five minutes. A direct recording sequence is provided in [`talkingpoints.md`](talkingpoints.md). It shows:

1. the four healthy Docker services and an API container shell;
2. the Sequelize/SQLite schema and real table rows;
3. `/health`, `/count` and `/stats`;
4. a post being created in the frontend and stored in SQLite;
5. that post arriving automatically in the separate RSS Client;
6. update/delete behaviour and persistent storage after an API restart; and
7. GitHub branches, commits, tests and successful Actions checks.

The local recording is expected at `frontend/public/video/assessment-demo.mp4` and is configured as `/video/assessment-demo.mp4` through `NEXT_PUBLIC_ASSESSMENT_VIDEO_URL`. Docker mounts that directory read-only into the frontend container, so the large MP4 remains outside Git and outside the Docker image. Replace the local file and rebuild the frontend after changing the environment path. External YouTube/embed URLs remain supported if needed later.

## Submission workflow

Assessment work is developed on feature branches and reviewed by automated checks before merging to `main`. The final submission is tagged `assessment-2-final`. Generated dependencies, Next.js output, environment secrets, local SQLite files and video files are excluded from Git.
