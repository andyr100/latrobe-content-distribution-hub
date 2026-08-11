# Assessment 2 video talking points

Target: **4 minutes 30 seconds**, with 30 seconds spare. Keep every browser tab open and the demo post text copied before recording.

## Before recording

Run:

```powershell
npm run verify
docker compose up --build -d
docker compose ps
```

Prepare these tabs:

1. Frontend dashboard — http://localhost:3000
2. Posts — http://localhost:3000/posts
3. Database inspector — http://localhost:3000/database
4. RSS Client — http://localhost:5000
5. Health — http://localhost:4000/health
6. Count — http://localhost:4000/count
7. Combined RSS — http://localhost:4000/rss
8. GitHub Actions and commit history

Select **CSIT News** in the RSS Client and leave auto refresh on. Use a short demo post assigned to CSIT News.

## 0:00–0:20 — Introduction

Say:

“This is my Assessment 2 Content Distribution Hub. It extends my Assessment 1 frontend with a REST API, Sequelize ORM, persistent SQLite database, RSS Server, separate RSS Client and Docker deployment.”

## 0:20–0:50 — Docker proof

Show `docker compose ps`.

Say:

“Docker Compose runs four services in four containers: the frontend on port 3000, API on 4000, RSS Client on 5000, and a SQLite volume holder. All services are healthy.”

Briefly run:

```powershell
docker compose exec api sh
pwd
node -v
exit
```

Say:

“This proves the backend is running inside its container. Local ports remain 3000, 4000 and 5000; the optional EC2 override maps the frontend to port 80 and API to 4080.”

## 0:50–1:20 — Database and ORM

Open the Database inspector and switch between `Users`, `Posts`, `Feeds`, `PostFeeds`, `RequestCounters` and `SchemaMigrations`.

Say:

“Sequelize migrations create the SQLite schema. A User authors Posts, and Posts belong to one or more Feeds through PostFeeds. Posts store the date, body, optional image and optional link. Foreign keys, indexes and transactions protect the data. The interface calls feeds Channels. This page is read-only and shows the real SQLite tables.”

## 1:20–1:40 — API operations

Show `/health`, `/count`, then briefly `/rss`.

Say:

“Health confirms the API and database are connected. Count stores successful RSS requests. The RSS endpoint returns the five newest posts as RSS 2.0 XML. A channel-specific endpoint such as `/rss/CSITNEWS` filters that XML.”

## 1:40–3:05 — Create, persist and send RSS

On the Posts page, create a post with a title, body, author and **CSIT News** Channel.

Say while saving:

“The frontend sends JSON to the API. The API validates it and saves the post and Channel relationship in one SQLite transaction.”

Open the Database inspector. Show the new row in `Posts`, then its relationship in `PostFeeds`.

Return to the RSS Client. The selected feed should update on its next 15-second countdown.

Say:

“The RSS Client is a completely separate Next.js application acting as a mock LMS. It requests and parses RSS XML; it does not access SQLite. Auto refresh can be switched on or off and defaults from an environment variable. The new database post has now travelled from the frontend, through the API and RSS Server, into the RSS Client.”

Refresh `/count` and point out that it increased.

## 3:05–3:35 — Complete CRUD

Return to Posts. Edit the demo title and save it, then delete the demo post.

Say:

“The same API supports create, read, update and delete. Updates replace the selected feed relationships transactionally. Deleting the post also cascades its PostFeed rows.”

Briefly refresh the Database inspector to show the demo row is gone.

## 3:35–4:00 — Persistence

Run:

```powershell
docker compose restart api
```

Refresh `/health`, `/count`, or the Posts page after it becomes healthy.

Say:

“Restarting the API container does not remove posts or the request count because SQLite is stored in a named Docker volume. I only use `docker compose down -v` when deliberately resetting all data.”

## 4:00–4:30 — Code quality and GitHub

Show the repository, commits and successful Actions run.

Say:

“The repository separates the frontend, API and RSS Client, with shared TypeScript contracts, reusable services, versioned migrations and an OpenAPI document. Seven isolated tests cover CRUD, validation, rollback, RSS XML, filtering, counting and cascade deletion. GitHub Actions runs formatting, lint, tests and all three production builds. The completed work is on main, with feature branches, pull requests, several commits and no node_modules or database files tracked.”

Finish:

“This demonstrates the complete Assessment 2 workflow: Docker, API CRUD, Sequelize and SQLite persistence, operational monitoring, and RSS Server delivery to a separate RSS Client.”

## Recording rules

- Do not read every JSON or XML field; point to the important evidence.
- Do not explain styling or Assessment 3 features.
- Keep the RSS Client selected before starting so its 15-second wait happens while you explain.
- If a restart is slow, continue explaining persistence instead of waiting silently.
- Do not say the four services are in one container; they are four containers in one Compose stack.
