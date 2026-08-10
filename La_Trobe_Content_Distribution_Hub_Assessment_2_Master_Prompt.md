# La Trobe Content Distribution Hub
## Assessment 2 Master Build Prompt

## Role

You are the coding agent responsible for extending the existing **La Trobe Content Distribution Hub** from Assessment 1 into a complete Assessment 2 submission.

Work directly in the existing Next.js repository. Preserve the Assessment 1 frontend, visual design, responsive behaviour, accessibility, navigation and user workflows unless a change is required to support the backend.

Build a complete working university assignment, not a disconnected prototype.

---

# 1. Assessment objective

Assessment 1 created the frontend and simulated the application workflow.

Assessment 2 must add:

- a backend API
- database persistence
- an ORM-based database schema
- CRUD operations
- a real RSS Server output
- an RSS Client page
- `/health`
- `/count`
- Docker packaging and execution
- frontend-to-backend integration
- clear Git history and documentation

The final application must demonstrate this end-to-end flow:

```text
Lecturer creates a post
→ frontend sends an API request
→ backend validates the request
→ Sequelize saves the post in SQLite
→ post is linked to one or more subject channels
→ RSS Server generates the channel feed
→ RSS Client requests and displays the feed
→ request count increases
```

Do not implement Assessment 3 features such as advanced dashboards, alerts, analytics, reporting or rule-based interpretation.

---

# 2. Existing application

The existing application is called **La Trobe Content Distribution Hub**.

It currently contains:

- Dashboard
- Posts
- Channels
- Workflow
- About
- Settings
- mock user selection
- internal post creation
- external RSS article curation
- channel selection
- confirmation modals
- loading feedback
- toast notifications
- light and dark themes
- responsive sidebar and mobile hamburger navigation
- breadcrumbs
- frontend mock data and Local Storage

Preserve this structure and convert the important mocked actions into real database-backed behaviour.

Add a new navigation page:

- **RSS Client**

Label it clearly as:

**RSS Client — Mock LMS View**

This page represents how subject RSS content could appear inside an LMS.

---

# 3. Required technology

Use:

- Next.js App Router
- React
- TypeScript
- Next.js Route Handlers
- Sequelize ORM
- SQLite
- Docker
- ESLint
- Git and GitHub

Install the stable Sequelize version compatible with SQLite.

Expected packages:

```bash
npm install sequelize sqlite3
```

Do not introduce Flask, FastAPI, Express, PostgreSQL or another backend unless the existing assignment lab explicitly requires it.

Use one Next.js project containing both the frontend and backend.

---

# 4. Architecture

Use this architecture:

```text
React frontend
      ↓ fetch()
Next.js Route Handlers
      ↓
service/database layer
      ↓
Sequelize ORM
      ↓
SQLite database
```

RSS architecture:

```text
Database-backed posts
      ↓
RSS XML endpoint for each channel
      ↓
RSS Client page
      ↓
Mock LMS display
```

Rules:

- React presentation components must not call Sequelize directly.
- Database access must remain on the server.
- Keep API, database and UI code modular.
- Avoid duplicating business logic across route handlers.
- Reuse the existing frontend components where practical.

---

# 5. Database schema

Use a file-based SQLite database, not an in-memory database.

Suggested local location:

```text
./data/content-hub.sqlite
```

Suggested Docker location:

```text
/app/data/content-hub.sqlite
```

Use an environment variable:

```text
DATABASE_STORAGE=./data/content-hub.sqlite
```

## Required models

### User

Fields:

- `id`
- `name`
- `email`
- `role`
- `createdAt`
- `updatedAt`

Supported roles:

- Administrator
- Lecturer

The existing mock users should be seeded into the database.

### Post

Fields:

- `id`
- `title`
- `body`
- `classification`
- `authorId`
- `imageUrl`, nullable
- `externalLink`, nullable
- `publishedAt`
- `createdAt`
- `updatedAt`

A post belongs to one user and may be published to multiple channels.

### Channel

Fields:

- `id`
- `code`
- `name`
- `semester`
- `active`
- `createdAt`
- `updatedAt`

The channel code must be unique.

### PostChannel

Join table for the many-to-many relationship between posts and channels.

Fields:

- `postId`
- `channelId`
- `createdAt`
- `updatedAt`

Prevent duplicate post/channel combinations.

### ExternalFeed

Fields:

- `id`
- `name`
- `feedUrl`
- `description`, nullable
- `active`
- `createdAt`
- `updatedAt`

### ExternalArticle

Fields:

- `id`
- `externalFeedId`
- `title`
- `summary`
- `link`
- `imageUrl`, nullable
- `classification`
- `publishedAt`
- `createdAt`
- `updatedAt`

### RequestCounter or RequestLog

Persist the number of RSS Client requests.

A simple option is:

```text
RequestCounter
- id
- key
- count
- updatedAt
```

Use a key such as:

```text
rss-client-requests
```

Do not use only a JavaScript variable because it resets when the application or container restarts.

---

# 6. Relationships

Implement:

```text
User hasMany Post
Post belongsTo User

Post belongsToMany Channel through PostChannel
Channel belongsToMany Post through PostChannel

ExternalFeed hasMany ExternalArticle
ExternalArticle belongsTo ExternalFeed
```

API responses for posts should include their author and channels where useful.

Avoid circular JSON output from Sequelize relationships.

---

# 7. Database initialisation and seed data

Create a repeatable database initialisation process.

It must:

- connect to SQLite
- create missing tables
- seed the four existing mock users
- seed the existing subject channels
- seed the five existing external RSS sources
- optionally seed sample posts and external articles
- not duplicate seed data
- be safe to run repeatedly
- not erase user-created records during normal startup

Do not use this during normal startup:

```ts
sequelize.sync({ force: true })
```

A separate explicit development reset script is acceptable, but it must be clearly named and documented.

---

# 8. API response format

Use consistent JSON responses.

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

Successful list:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "count": 0
  }
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": {}
  }
}
```

Use appropriate HTTP status codes:

- `200` successful request
- `201` record created
- `400` invalid request
- `404` record not found
- `409` conflict or duplicate
- `500` unexpected server error
- `503` failed health dependency

Do not return raw stack traces or SQL errors to the browser.

---

# 9. CRUD API requirements

## Posts

Implement:

```text
POST   /api/posts
GET    /api/posts
GET    /api/posts/:id
PATCH  /api/posts/:id
DELETE /api/posts/:id
```

The create endpoint must validate input, verify the author and channels, create the post, create channel relationships, use a transaction, and return the saved post with author and channels.

Support useful filters where practical:

```text
?search=
?classification=
?authorId=
?channelId=
```

Sort newest posts first.

Allow updates to title, body, classification, author, image URL, external link and selected channels.

Delete the post and its join-table records safely.

## Channels

Implement:

```text
POST   /api/channels
GET    /api/channels
GET    /api/channels/:id
PATCH  /api/channels/:id
DELETE /api/channels/:id
```

Validate required fields and unique channel codes.

Deleting a channel should remove join-table relationships while leaving original posts intact.

## Users

Implement at minimum:

```text
GET /api/users
GET /api/users/:id
```

The frontend mock user selector must load its users from the backend.

## External feeds

Implement:

```text
GET    /api/feeds
POST   /api/feeds
PATCH  /api/feeds/:id
DELETE /api/feeds/:id
```

## External articles

Implement:

```text
GET /api/external-articles
GET /api/external-articles/:id
```

When an external article is posted to subject channels, convert it into a normal internal `Post` record containing its title, summary/body, source link, image URL where available, classification, author and selected channels.

---

# 10. Backend validation

Validate all important data on the server, even where the frontend already validates it.

Check:

- required fields
- valid classifications
- valid user IDs
- valid channel IDs
- active channels
- URL format
- duplicate channel codes
- malformed IDs
- missing records

Do not trust IDs or other values supplied by the frontend without verification.

---

# 11. RSS Server

Create a real RSS 2.0 XML endpoint for each subject channel.

Preferred endpoint:

```text
GET /api/rss/channels/:channelCode
```

Example:

```text
GET /api/rss/channels/LTCSE4CBA
```

The endpoint must:

- find the channel by code
- retrieve database posts linked to that channel
- sort newest first
- generate valid RSS 2.0 XML
- return XML rather than JSON
- include channel title and description
- include item title
- include item description
- include item link
- include publication date
- include author where appropriate
- include image information where practical
- return `404` for an unknown channel
- safely escape XML
- increment the persistent RSS Client request counter

Set:

```http
Content-Type: application/rss+xml; charset=utf-8
```

The RSS output must be generated from database records, not from a separate hard-coded list.

---

# 12. RSS Client page

Create:

```text
/rss-client
```

The page is logically an RSS Client and visually a mock LMS view.

It must:

- retrieve channels from the backend
- allow the user to select a subject channel
- request the selected channel RSS endpoint
- parse the returned XML
- display the feed title
- display each item title
- display publication date
- display author where available
- display description
- display source link
- display image when available
- provide refresh functionality
- show loading, empty and error states
- clearly show that the data came from the RSS Server

A post created in the main application must appear in the RSS Client when its selected channel feed is loaded or refreshed.

Do not create a separate application or repository. Implement the RSS Client as a new page inside the existing Next.js application.

---

# 13. Frontend integration

Replace major Assessment 1 mock behaviours with real API calls.

- Load users from `GET /api/users`.
- Load posts from `GET /api/posts`.
- Create posts through `POST /api/posts`.
- Edit through `PATCH /api/posts/:id`.
- Delete through `DELETE /api/posts/:id`.
- Load and manage channels through the channel API.
- Load and manage external feeds through the feed API.

The existing spinner and toast can remain, but they must reflect the real API request.

Do not display success until the backend confirms the database write succeeded.

Remove the fixed three-second mock delay as the primary behaviour. A short minimum animation time may remain for polish, but the real API result controls success or failure.

Local Storage may still be used for visual preferences such as theme, but it must not be the source of truth for posts and channels.

---

# 14. Health endpoint

Expose exactly:

```text
GET /health
```

It must check that the Next.js server is running and SQLite can be reached.

Healthy example:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-08-05T11:00:00.000Z"
}
```

Return `503` if the database cannot be reached.

This endpoint must work from inside the Docker container.

---

# 15. Count endpoint

Expose exactly:

```text
GET /count
```

Return the persistent number of successful RSS feed requests made by the RSS Client.

Example:

```json
{
  "requestCount": 47
}
```

The count must increase when the RSS Client successfully requests a subject feed, must not count unrelated static requests, and must persist after application restart and Docker container recreation when the volume is retained.

---

# 16. Docker requirements

Create:

```text
Dockerfile
.dockerignore
```

Follow the Dockerfile style demonstrated in the course lab unless that conflicts with the application requirements.

The Docker image must:

- use an explicit Node.js version
- install dependencies
- build the Next.js application
- include Sequelize and SQLite runtime dependencies
- expose port 3000
- create or use a writable data directory
- start the production Next.js server
- accept environment variables
- work reproducibly on another computer

Prefer a multi-stage Docker build where practical.

Do not copy local `node_modules` into the image.

---

# 17. Docker ignore file

Include at minimum:

```text
node_modules
.next
.git
*.log
coverage
.env
.env.local
data/*.sqlite
```

Do not exclude source files required to build the application.

---

# 18. SQLite persistence in Docker

Use a file-based SQLite database inside:

```text
/app/data/content-hub.sqlite
```

Use a named Docker volume:

```bash
docker run --name latrobe-content-hub -p 3000:3000 -v latrobe-content-hub-data:/app/data -e DATABASE_STORAGE=/app/data/content-hub.sqlite latrobe-content-hub
```

Also document a Windows PowerShell-friendly command.

An optional `docker-compose.yml` may be added.

Ensure the running container has permission to write to `/app/data`.

---

# 19. Docker health and shell demonstration

Add a Docker health check where practical and compatible with the base image.

Document:

```bash
docker build -t latrobe-content-hub .
docker run --name latrobe-content-hub -p 3000:3000 -v latrobe-content-hub-data:/app/data latrobe-content-hub
docker ps
docker logs latrobe-content-hub
docker exec -it latrobe-content-hub sh
```

The video must be able to show the application running inside Docker and a Docker shell similar to the course lab.

---

# 20. Environment configuration

Create `.env.example` containing:

```text
DATABASE_STORAGE=./data/content-hub.sqlite
APP_BASE_URL=http://localhost:3000
RSS_SERVER_TITLE=La Trobe Content Distribution Hub
```

Do not commit real secrets.

---

# 21. Error handling and UX states

Implement:

- loading states
- empty states
- validation messages
- API error messages
- database failure handling
- RSS parse failure handling
- confirmation before deletion
- success toasts only after successful backend responses

Do not leave buttons that appear functional but do nothing.

---

# 22. Code quality expectations

Use:

- strict TypeScript
- modular code
- reusable components
- reusable service functions
- central database setup
- central validation helpers
- central API response helpers
- clear naming
- small focused modules
- Sequelize transactions for multi-table writes
- safe model initialisation during Next.js hot reload

Avoid:

- excessive `any`
- database code in React components
- destructive database sync on startup
- silent failures
- unnecessary raw SQL
- duplicated hard-coded data
- unnecessary enterprise complexity

---

# 23. Testing and verification

Before completion, verify:

## Database

- tables are created
- seed records appear once
- posts persist after refresh
- posts persist after app restart
- data persists after Docker container recreation when the volume is retained

## Posts

- create
- read list
- read one
- edit
- delete
- author relationship
- multiple channel relationships

## Channels

- create
- read
- update
- delete
- associated posts display correctly

## RSS

- valid channel returns RSS XML
- unknown channel returns `404`
- XML content type is correct
- a new post appears in the correct feed
- RSS Client displays the feed
- request count increases

## Operations

- `/health` returns `200` when healthy
- `/count` returns persistent count
- Docker image builds
- container starts
- application loads through localhost
- APIs work inside Docker
- SQLite writes inside Docker
- Docker shell can be demonstrated

Run:

```bash
npm run lint
npm run build
```

Fix all errors before final submission.

---

# 24. Git workflow

Continue the genuine Git history from Assessment 1.

Use separate branches for major features.

Suggested branches:

1. `feature/a2-database-foundation`
2. `feature/a2-schema-models`
3. `feature/a2-posts-api`
4. `feature/a2-channels-users-api`
5. `feature/a2-external-feeds`
6. `feature/a2-frontend-integration`
7. `feature/a2-rss-server`
8. `feature/a2-rss-client`
9. `feature/a2-health-count`
10. `feature/a2-docker`
11. `feature/a2-testing-polish`
12. `docs/a2-submission`

For each milestone:

1. create branch
2. implement feature
3. run lint
4. run build
5. fix errors
6. review changes
7. commit
8. merge into main
9. pause before the next milestone

Do not fabricate commit history after completion.

Keep merged feature branches visible on GitHub until marking is finished.

---

# 25. README requirements

Update the README with:

- application purpose
- Assessment 1 to Assessment 2 progression
- architecture
- technology stack
- database schema
- model relationships
- API endpoint table
- sample API responses
- RSS Server endpoint
- RSS Client behaviour
- `/health`
- `/count`
- local development instructions
- environment variables
- database initialisation
- seed process
- Docker build and run commands
- Docker volume explanation
- Docker shell command
- testing instructions
- Git workflow
- known limitations
- future Assessment 3 scope

State clearly that:

- user selection remains mock authentication
- SQLite and Sequelize are used
- posts and channels are database-backed
- the RSS Server produces real XML from database records
- the RSS Client is a mock LMS page inside the same application
- Docker provides the reproducible runtime
- advanced dashboards and alerts are deferred to Assessment 3

---

# 26. Video demonstration preparation

The application must support a 3–8 minute walkthrough showing:

- student ID, face and voice
- application introduction
- frontend-to-backend architecture
- Sequelize schema
- SQLite persistence
- creating a post
- refreshing to prove persistence
- editing or deleting a post
- publishing to multiple subject channels
- opening the RSS XML endpoint
- opening the RSS Client mock LMS page
- showing the new post in the RSS Client
- showing `/health`
- showing `/count`
- refreshing the feed and showing the count increase
- Docker image and running container
- Docker shell
- application working through localhost
- brief Git history
- readiness for Assessment 3

No written report is required.

---

# 27. Definition of done

The assessment is complete only when:

- the Assessment 1 frontend remains polished and usable
- Sequelize connects to SQLite
- the schema includes RSS posts, authors, dates, blog content, images, links and channels
- CRUD APIs work
- API responses are predictable
- frontend data comes from APIs
- posts persist in the database
- post editing and deletion work
- channel management works
- RSS XML is generated from database records
- RSS Client reads and displays the feed
- RSS Client acts as a mock LMS view
- `/health` checks the server and database
- `/count` stores RSS Client request count
- Docker image builds
- container runs successfully
- SQLite works inside Docker
- Docker volume retains data
- code is modular and readable
- lint passes
- production build passes
- Git history contains meaningful commits and branches
- README is current
- `node_modules` is not committed or submitted
- the full workflow can be shown within eight minutes

---

# 28. Final instruction to the coding agent

Inspect the existing Assessment 1 repository before making changes.

Do not rebuild the frontend from scratch.

Implement the assignment incrementally and preserve the successful design and UX from Assessment 1.

Choose the simplest implementation that fully satisfies the rubric.

Do not over-engineer the project, but do not substitute required backend, database, RSS or Docker functionality with mocks.

The final result must visibly demonstrate:

```text
database schema and ORM
+
working CRUD APIs
+
frontend API integration
+
RSS Server
+
RSS Client mock LMS page
+
health and request monitoring
+
Docker execution
```
