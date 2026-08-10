# RSS Feed Update — Video Talking Points

## Simple explanation

For this update, I made the RSS part of the application simpler and closer to the lecturer's guidance.

The API now has one main RSS feed at `/rss`. This gives the five newest posts from all channels.

It also has a channel-specific feed, such as `/rss/FRONTIERLLMS`. This only gives posts for the selected channel.

Both feeds return RSS 2.0 XML. They use the same shared code, so the feed title, post title, description, author, date, image, and link are created consistently.

I kept the old API RSS URL working as a compatibility alias. This means `/api/rss/topics/FRONTIERLLMS` still works, but the new recommended RSS URLs are `/rss` and `/rss/:channelCode`.

Each RSS post now links back to the main frontend. For example, an RSS item can open `/posts/21` instead of opening another XML endpoint. This gives users a normal readable page with the post title, author, date, channels, content, image, and optional external link.

The RSS Client is still a separate service on port 5000. It loads the list of channels, automatically loads the selected channel feed, and refreshes the feed every 15 seconds. The spinner and countdown show when the next refresh will happen.

The API keeps track of successful RSS requests using the `/count` endpoint. This lets us demonstrate that the RSS Client is really making requests to the API.

I also configured the frontend base URL in Docker. This ensures RSS links point to `http://localhost:3000/posts/:id` when the application is running locally.

Finally, I ran lint and production builds for the frontend, API, and RSS Client. I also rebuilt the Docker stack and tested the feeds, compatibility route, post reader, and request counter.

## Navigation instructions for the video

Start Docker first if it is not already running:

```powershell
docker compose up --build -d
```

Open these browser tabs before recording:

1. Main frontend: http://localhost:3000
2. API combined RSS feed: http://localhost:4000/rss
3. API Frontier LLMs feed: http://localhost:4000/rss/FRONTIERLLMS
4. Compatibility RSS feed: http://localhost:4000/api/rss/topics/FRONTIERLLMS
5. RSS Client: http://localhost:5000
6. RSS request count: http://localhost:4000/count

Suggested demonstration order:

1. Open the main frontend at `localhost:3000`.
2. Go to **Posts** and point out that posts are assigned to channels.
3. Open `localhost:4000/rss` and explain that this is the main feed with the latest five posts across all channels.
4. Open `localhost:4000/rss/FRONTIERLLMS` and explain that this is a feed for one channel only.
5. Open `localhost:4000/api/rss/topics/FRONTIERLLMS` and mention that it is retained as a compatibility route.
6. In either RSS XML page, find an item `<link>` and open it. It should go to a page like `localhost:3000/posts/21`.
7. On the post-reader page, point out the author, publication date, channel labels, post body, and optional link/image.
8. Open `localhost:5000`. Select a channel if one is not already selected.
9. Show that its feed loads automatically. Point out the small spinner while refreshing and the 15-second countdown clock.
10. Wait for one automatic refresh, or change to a different channel, then open `localhost:4000/count` to show that successful RSS requests increased.

Optional Docker check in PowerShell:

```powershell
docker compose ps
```

You should see four running services: `frontend`, `api`, `rss-client`, and `sqlite`.

## EC2 deployment talking points

The local Docker setup uses ports 3000 for the frontend, 4000 for the API, and 5000 for the RSS Client. These are convenient ports for development on my computer.

The course diagram shows a separate EC2 deployment layout. It does not mean that every container needs a different internal port. In that layout, both the frontend and API containers can run internally on port 3000, while Docker exposes them through different public ports.

On EC2, the frontend is mapped from public port 80 to container port 3000. This means users can visit the website using the normal web address without typing a port number.

The API is mapped from public port 4080 to container port 3000. This keeps the API separate from the frontend while still allowing browser requests to reach it.

I kept the normal local Compose file unchanged for the assessment. I added a separate EC2 Compose override, so the same project can run locally or use the EC2 port layout without changing application code each time.

For EC2, the frontend uses the public API address, for example `http://YOUR_EC2_HOST:4080`. Inside Docker, the RSS Client talks privately to the API using `http://api:3000`.

The EC2 security group needs inbound TCP rules for port 80 for the frontend and port 4080 for the API. The standalone RSS Client is not publicly exposed by default.

## EC2 navigation and commands

Before deploying, copy the example environment file and replace the placeholder host name with the EC2 public IP address or public DNS name:

```powershell
Copy-Item ec2.env.example ec2.env
```

Then start the EC2 configuration:

```powershell
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml up --build -d
```

## Correct Docker terminology

It is better to say that this project has **four Docker Compose services in one Docker Compose stack**, rather than saying they are all in one container.

The four services are:

1. `frontend` — the main publishing and administration user interface.
2. `api` — the REST API, RSS server, and SQLite database access layer.
3. `rss-client` — the separate mock LMS RSS viewer.
4. `sqlite` — the lightweight service that holds the shared named SQLite data volume.

When Docker Compose starts the project, each service runs in its own container. The containers are connected through the same private Docker network and are managed together as one Compose application or stack.

A simple way to say this in the video is: “My Docker Compose stack has four services, and Docker runs each service in its own container. The frontend, API, RSS Client, and SQLite volume holder work together on the same Docker network.”

## RSS Client live-update demonstration

The RSS Client is a separate application, not a page inside the main administration frontend. It represents a simple LMS-style system that receives and displays the posts published through the Content Distribution API.

It loads posts from the selected channel's RSS feed and automatically refreshes every 15 seconds. The spinner and countdown clock make the refresh behaviour visible.

For the demonstration, keep the main frontend open in one browser tab at `http://localhost:3000` and the RSS Client open in another tab at `http://localhost:5000`.

First, select the same channel in the RSS Client that you will use for the new post. Then create and publish a new post in the main frontend and assign it to that channel.

After publishing, return to the RSS Client. Within 15 seconds, it automatically requests the RSS feed again and the newly created post appears in the list. This demonstrates that the frontend writes the post through the API, the API saves it in SQLite and generates RSS, and the separate RSS Client receives the updated feed.

A simple way to say this in the video is: “The RSS Client is a separate application. It reads the selected channel’s RSS feed and refreshes automatically every 15 seconds. I will now create a post in the admin frontend, and after the next refresh it will appear here in the RSS Client.”

For the video, you can show `docker-compose.ec2.override.yml` and explain these mappings:

1. Frontend: EC2 port `80` to container port `3000`.
2. API: EC2 port `4080` to container port `3000`.
3. RSS Client: remains private inside Docker unless it is deliberately exposed later.

You can also show that the API health check was made port-aware, so it works when the API runs locally on port 4000 or inside the EC2 configuration on port 3000.

## Explaining the Docker ports shown locally

If I run `docker compose ps` on my computer, it correctly shows `3000:3000` for the frontend, `4000:4000` for the API, and `5000:5000` for the RSS Client. This is the normal local development configuration.

The numbers before and after the colon mean `host port:container port`. For example, `4000:4000` means my browser uses port 4000 on my computer and Docker passes that request to port 4000 inside the API container.

The EC2 ports are different because I start Docker with an additional EC2 override file. That override replaces the local port mappings without changing the normal local Compose file.

When running on EC2, `docker compose ps` would show the frontend as `80:3000` and the API as `4080:3000`.

This means the frontend container still runs Next.js on internal port 3000, but it is available publicly on web port 80. The API container also runs internally on port 3000, but Docker exposes it publicly on port 4080.

So, local Docker showing `3000:3000`, `4000:4000`, and `5000:5000` is expected. The ports only change to the EC2 layout after running this command on the EC2 machine:

```powershell
docker compose --env-file ec2.env -f docker-compose.yml -f docker-compose.ec2.override.yml up --build -d
```
