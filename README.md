# La Trobe Content Distribution Hub

La Trobe Content Distribution Hub is a responsive frontend prototype for **Cloud Based Applications — Assessment 1**. It gives lecturers and administrators a single workspace to create, classify and distribute university updates to subject channels. It also lets them review a curated set of synthetic external RSS articles and republish a selected article through the same channel workflow.

This is intentionally a client-side demonstration. It does not include a backend, database, real authentication, live RSS retrieval or RSS generation, cloud deployment, LMS delivery, or network calls to external feeds.

## Application functionality and features

### Dashboard and navigation

- Dashboard summary cards, recent activity and quick links to common tasks.
- Responsive application shell with a desktop sidebar, mobile drawer, breadcrumbs and a skip link.
- Six routes: dashboard, posts, channels, workflow, about and settings.
- A mock user selector starts each new page load. The selected user is used as the author when publishing, but is not authentication and is not saved.

### Posts and distribution workflow

- Create a validated internal post with a title, body, classification and one or more channel destinations.
- Browse internal posts and the External RSS catalogue in separate tabs.
- Search and filter posts by classification, author, channel and source as appropriate.
- Delete an individual internal post directly from its tile, with a confirmation dialog. External RSS items are source content and remain read-only.
- Republish an external article to selected subject channels using the same confirmation and simulated publishing workflow.
- A three-second locked publishing state, followed by a dismissible success toast, makes the future server-side delivery step visible without pretending that delivery has occurred.
- Contextual links support `/posts?tab=external`, `/posts?create=1` and `/posts?channel=<id>`.

### Channels and external content

- Twelve seeded La Trobe subject channels, with add, delete and inspection workflows.
- Choose between a grid layout and a persistent one-channel-per-row horizontal layout.
- Five configurable external RSS sources, each contributing ten original synthetic articles when subscribed.
- Ten defined classifications shared by internal posts and external articles.

### Settings and persistence

- Light, dark and system theme choices are saved in the browser. The saved theme is applied before the interactive app opens, preventing a light/dark startup flash or fade.
- RSS subscriptions and the preferred channel layout are saved per browser.
- The Settings page includes a collapsible, oldest-to-newest Git history tile, with one row per commit and its hash, date, time, branch and message.
- **Reset workspace** removes local changes and restores the seed posts, channels, subscriptions, layout and system theme.

### Accessibility and responsive behaviour

- Semantic landmarks, a visible skip link, descriptive labels and visible focus states.
- Keyboard-operable tabs, controls, drawers and dialogs; modal and drawer focus management; Escape handling; and polite toast announcements.
- 44px interactive targets and reduced-motion handling.
- Layouts designed and checked for 360px, 768px, 1024px and 1440px viewports.

## Running the application

Requirements: Node.js 20.9 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

For production validation:

```bash
npm run lint
npm run build
npm start
```

## Architectural design and decisions

### Technology and rendering model

The application uses Next.js App Router, React 19, TypeScript and Tailwind CSS. Pages and layout structure are rendered with the App Router; only the interactive workspaces and state providers are client components. This keeps the application structure simple while allowing immediate, responsive browser interactions.

### State boundaries

State is separated by responsibility rather than being placed in a single global store:

| Boundary | Responsibility | Reason for the boundary |
|---|---|---|
| `PreferencesContext` | Theme preference, RSS subscriptions and channel layout | Keeps user-interface preferences independent from content. |
| `SessionContext` | Current mock user and selector visibility | Makes the assessment's simulated identity flow explicit and non-persistent. |
| `ContentContext` | Internal posts and subject channels | Gives all content creation, deletion and reset actions one local source of truth. |
| `PublishingContext` | Confirmation, simulated publishing progress and toast notifications | Reuses the same feedback workflow for internal and external publication. |

Reusable components provide the shell, navigation, page headers, cards, badges, buttons, icons, modal focus management, channel multi-select and publishing composer. This avoids duplicate interaction logic and keeps page components focused on their workspace.

### Data design and persistence boundary

`src/data/mockData.ts` contains the deterministic seed content: classifications, channels, feed definitions, synthetic external articles and seed internal posts. The 50 external titles and summaries are original fictional content. They are not downloaded, parsed or cached from real RSS feeds.

There is no database. Content and preferences that the user changes are stored in `localStorage` on the current browser and device:

| Key | Stored value |
|---|---|
| `lt-content-hub.preferences.v1` | Theme, subscribed feed IDs and channel-layout preference |
| `lt-content-hub.channels.v1` | Added or deleted subject-channel state |
| `lt-content-hub.internal-posts.v1` | Created or deleted internal-post state |

Malformed stored values safely fall back to the seeded state. This browser-only storage was chosen to demonstrate the full interface and state lifecycle without implying a server, shared data, access controls or durable institutional record. Clearing site data or using **Reset workspace** returns the app to its default local state.

### Theme implementation

An early, non-React bootstrap script reads the saved preference and applies the resolved theme to the document before React becomes interactive. Once hydration has completed, the application enables the two-second transition used for deliberate theme changes. This decision prevents the page from briefly rendering in the wrong colour scheme or fading on startup.

### Future service boundary

The publishing delay and workflow visualisation deliberately mark the boundary where a later system could add authenticated users, an API, persistent database, RSS ingestion and generation, a queue or notification service, and LMS integration. The current component and context boundaries make those services replaceable without changing the core user journey.

## Project structure

```text
src/
  app/                  App Router pages, layout and global styles
  components/           Shared UI, layout, publishing, posts, channels and settings components
  config/app.ts         Application, student and displayed Git-history metadata
  context/              Preference, session, content and publishing state boundaries
  data/mockData.ts      Deterministic seed data and synthetic RSS catalogue
  types/                Shared TypeScript domain types
```

## Development history

The repository history records the feature work chronologically. The Settings Git tile mirrors the project commit metadata for in-app review; the repository remains the source of truth.

```bash
git log --graph --oneline --decorate --all
```

## Student details

The configured student details are:

- Name: Andy Rea
- Student number: 22809185

They are centralised in `src/config/app.ts`.

## Demonstration video

Record a 3–8 minute MP4 (target 5–6 minutes) demonstrating the student ID, face, voice, application, responsive navigation, themes, publishing flow and code. Place it at:

```text
public/video/assessment-demo.mp4
```

See `docs/VIDEO_SPEAKING_NOTES.md` for the guided run-through.

## Submission checklist

1. Confirm the student name and number are correct.
2. Add and test the final 3–8 minute MP4.
3. Run `npm ci`, `npm run lint` and `npm run build`.
4. Review keyboard operation at the four target widths.
5. Review the repository Git graph.
6. Exclude `node_modules`, `.next` and local environment files from the zip.
7. Submit through Moodle/Turnitin and confirm a similarity score is generated.

Additional materials:

- `docs/VIDEO_SPEAKING_NOTES.md`
- `docs/WRITTEN_JUSTIFICATION.md`
- `docs/SUBMISSION_CHECKLIST.md`
