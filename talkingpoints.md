# Assessment 2 video talking points

Target length: about six minutes. Keep the browser tabs and PowerShell windows open before recording.

## 1. Introduction — about 30 seconds

“This is my Assessment 2 Content Distribution Hub. It extends my Assessment 1 frontend with a real backend, Sequelize ORM, a persistent SQLite database, RSS Server, separate RSS Client and Docker deployment.”

“My Docker Compose stack has four services. Each service runs in its own container. The services are the frontend, API, RSS Client and a lightweight SQLite volume holder. They communicate through one private Docker network.”

Do not say that all four services are in one container.

## 2. Prove Docker is running — about 45 seconds

Run:

```powershell
docker compose ps
```

Point out:

- `frontend` is on port 3000 and is healthy.
- `api` is on port 4000 and is healthy.
- `rss-client` is on port 5000 and is healthy.
- `sqlite` holds the named data volume and is healthy.

Then enter the API container:

```powershell
docker compose exec api sh
```

Inside the container, run:

```sh
pwd
ls -la
node -v
exit
```

Say: “This proves the backend is running inside its Docker container, not directly on my computer.”

## 3. Explain the database — about 50 seconds

Open the README ER diagram or the Database tab at http://localhost:3000/database.

Say:

“Sequelize manages a versioned schema. A User authors many Posts. Posts and Feeds have a many-to-many relationship through PostFeeds. The interface calls feeds Channels because that wording is clearer for publishers. RequestCounter stores successful RSS requests.”

“Posts contain the author, publication date, body, optional image and optional link required by the rubric. Foreign keys and cascade rules protect the relationships. Indexes support publication dates, authors and feed lookups.”

Use the table selector to show `Users`, `Posts`, `Feeds`, `PostFeeds`, `RequestCounters` and `SchemaMigrations`.

Say: “This inspector is read-only. It proves that the screen is displaying real SQLite records.”

## 4. Show operational endpoints — about 35 seconds

Open:

- http://localhost:4000/health
- http://localhost:4000/count
- http://localhost:4000/stats

Say:

“Health confirms that the API is running and SQLite is connected. Count shows successful RSS requests. Stats provides database-driven totals, posts per feed and the latest publication. These endpoints use the same predictable success response structure as the REST API.”

## 5. Demonstrate create and RSS delivery — about 90 seconds

Open the RSS Client at http://localhost:5000 and select the channel you will publish to.

Say:

“The RSS Client is a separate application. It represents a simple LMS. It automatically loads the selected feed and refreshes every 15 seconds. The spinner and countdown make the request timing visible.”

Open the frontend at http://localhost:3000 and create a post:

- Enter a clear title and body.
- Select the same channel as the RSS Client.
- Confirm publication.

Open the Database tab and select `Posts`, then `PostFeeds`. Point out the new post row and join row.

Return to the RSS Client. Wait for the countdown. The new post should appear automatically.

Say:

“The frontend sent JSON to the API. The API validated it, saved the post and relationship in one SQLite transaction, generated RSS XML, and the separate RSS Client received the new feed on its next refresh.”

Refresh `/count` and show that the number increased.

## 6. Demonstrate update and delete — about 50 seconds

In Posts, edit the new post. Change its title, publication date or assigned channel and save it. Show the database and correct RSS channel changing.

Then delete the post and show that it disappears from Posts, PostFeeds and the RSS output.

Say:

“This demonstrates create, read, update and delete. Feed relationships update transactionally, and join rows cascade when the post is deleted.”

## 7. Show RSS endpoints — about 35 seconds

Open:

- http://localhost:4000/rss
- http://localhost:4000/rss/FRONTIERLLMS

Say:

“The main `/rss` endpoint sends the five newest unique posts. The channel endpoint sends only posts assigned to that channel. Both return RSS 2.0 XML from the same generator.”

Point to an item link such as `http://localhost:3000/posts/12`.

Say: “Each RSS item links to a readable frontend post page. The optional external link remains separate post metadata.”

## 8. Prove persistence — about 35 seconds

Run:

```powershell
docker compose restart api
```

After the API becomes healthy, refresh Posts, `/count` and the Database tab.

Say:

“Restarting the API container does not remove the post data or request counter because SQLite is stored in a named Docker volume. I only use `docker compose down -v` when I deliberately want a completely fresh database.”

## 9. Code quality and GitHub — about 40 seconds

Show the GitHub repository, Actions page, commit list and final tag.

Say:

“The code is divided into three Next.js applications and reusable API models, services, validation and migrations. Automated tests use a temporary SQLite database and cover CRUD, invalid data, rollback, RSS filtering, XML escaping, the five-item limit, counting and cascade deletion.”

“GitHub Actions installs all applications, checks formatting, runs lint and tests, and creates production builds. The completed submission is on main and tagged `assessment-2-final`. Node modules, builds, environment secrets and local databases are not tracked.”

The Settings page reads recent commit details from the build instead of containing a manually typed history. GitHub remains the complete source of truth.

## 10. EC2 port explanation — optional, 20 seconds

Keep this brief because actual cloud deployment belongs to a later assessment.

“Local Docker correctly shows frontend `3000:3000`, API `4000:4000` and RSS Client `5000:5000`. The format is host port followed by container port.”

“The separate EC2 override maps public port 80 to frontend container port 3000 and public port 4080 to API container port 3000. The local configuration stays unchanged.”

## Useful commands before recording

```powershell
npm run verify
docker compose up --build -d
docker compose ps
powershell -ExecutionPolicy Bypass -File scripts/smoke-test.ps1
git status
git log --oneline --decorate -12
```

## Browser tabs to prepare

1. http://localhost:3000
2. http://localhost:3000/posts
3. http://localhost:3000/database
4. http://localhost:5000
5. http://localhost:4000/health
6. http://localhost:4000/count
7. http://localhost:4000/stats
8. http://localhost:4000/rss
9. http://localhost:4000/rss/FRONTIERLLMS
