# La Trobe Content Distribution Hub

A four-service Assessment 2 application. The React frontend publishes CSIT content, the API persists it in SQLite and serves RSS, and a standalone RSS Client presents the feeds as a mock LMS.

## Architecture

| Service | Role | Technology | Port |
|---|---|---|---:|
| `frontend` | Publishing UI | Next.js, React, TypeScript | 3000 |
| `api` | REST API and RSS Server | Next.js Route Handlers, Sequelize, SQLite | 4000 |
| `rss-client` | Standalone mock LMS RSS viewer | Next.js, React, TypeScript | 5000 |
| `sqlite` | Named-volume holder | BusyBox plus shared SQLite volume | — |

The API owns the SQLite volume. The RSS Client has no database mount or Sequelize dependency; it uses `GET /api/topics`, `GET /rss/:channelCode`, and `GET /count` from the browser.

## RSS feeds

The API serves first-party RSS 2.0 XML directly:

- `http://localhost:4000/rss` returns the five newest posts across all channels.
- `http://localhost:4000/rss/FRONTIERLLMS` returns posts assigned to one channel.

Every RSS item links to its public reader page at `http://localhost:3000/posts/:id`.
`GET /api/rss/topics/:topicCode` remains a compatibility alias during the assessment;
new clients should use `/rss` and `/rss/:channelCode`.

## Run locally

Install dependencies in each application:

```bash
cd api && npm ci
cd ../frontend && npm ci
cd ../rss-client && npm install
```

Run the services in separate terminals:

```bash
cd api && npm run dev
cd frontend && npm run dev
cd rss-client && npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- RSS Client: http://localhost:5000

## Docker

```bash
docker compose up --build -d
docker compose ps
```

Compose starts all four services. To reset the named SQLite volume and reseed data:

```bash
docker compose down -v
docker compose up --build -d
```

### EC2 deployment ports

The default Compose file is for local assessment use and remains on ports `3000`,
`4000`, and `5000`. For the EC2 layout shown in the course diagram, copy
`ec2.env.example` to `ec2.env`, replace `YOUR_EC2_HOST` with the EC2 public IPv4
address or public DNS name, then run:

```bash
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml up --build -d
```

This uses the same containers with these mappings:

| Service | Container port | EC2 host port |
|---|---:|---:|
| Frontend | 3000 | 80 |
| API | 3000 | 4080 |
| RSS Client | 5000 | Not publicly exposed |

The frontend is then available at `http://YOUR_EC2_HOST`; the API is available at
`http://YOUR_EC2_HOST:4080`. The frontend is built with that public API URL, while
the RSS Client continues to reach the API over Docker's private network at
`http://api:3000`.

Allow inbound TCP port `80` and `4080` in the EC2 security group. The API uses
non-credentialed permissive CORS (`Access-Control-Allow-Origin: *`), so browser
requests from the deployed frontend can access its JSON, RSS XML, and count routes.
Do not open port `5000` unless you explicitly want the standalone RSS Client to be
available publicly; add `"5000:5000"` to its `ports` list in the EC2 override if so.

## Verification

Run lint and production builds from the repository root:

```bash
npm run lint
npm run build
```

Open the standalone RSS Client at http://localhost:5000 and select a channel. Its feed loads automatically, refreshes every 15 seconds, and increments http://localhost:4000/count after each successful request.
