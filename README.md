# La Trobe Content Distribution Hub

A polished frontend prototype for **Cloud Based Applications — Assessment 1**.
It gives lecturers and administrators one place to create university updates,
classify them, select subject channels and simulate RSS distribution. Users can
also review synthetic articles from subscribed external feeds and republish them
through the same workflow.

> This version is frontend only. It has no backend, database, real
> authentication, live RSS processing or LMS connection.

## Quick start

Requirements: Node.js 20.9 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Production validation:

```bash
npm run lint
npm run build
npm start
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Dashboard summary, recent activity and quick actions |
| `/posts` | Internal Posts and External RSS tabs, search and filters |
| `/channels` | Add, delete and inspect subject destinations |
| `/workflow` | Internal and external RSS-to-LMS user journeys |
| `/about` | Purpose, scope, student details and video |
| `/settings` | Appearance, RSS subscriptions and version details |

Posts supports `?tab=external`, `?create=1` and `?channel=<id>` links for
contextual navigation.

## Features

- mandatory session-only selection from four mock users
- complete light, dark and system themes with a two-second transition
- responsive desktop sidebar and transform-based mobile drawer
- eight deterministic internal posts and 12 LT-prefixed subject channels
- exactly five external sources with ten original synthetic articles each
- internal and external search and filtering
- validated single-screen post composer
- searchable keyboard-accessible channel multi-select
- “All active channels”, selected count and removable wrapping pills
- one confirmation/publishing state machine for internal and external content
- locked, announced three-second publishing state
- closable five-second success toast with title and destination count
- persistent theme, subscriptions, mock posts and mock channels
- add/delete channel workflows and channel-filtered post links
- semantic breadcrumbs, landmarks, focus traps and reduced-motion support

## Architecture

The application uses Next.js App Router, React 19, TypeScript and Tailwind CSS.
Static page structure remains server-rendered where practical. Interactive
workspaces and providers are client components.

Shared state is split by responsibility:

- `PreferencesContext` — theme and RSS subscriptions
- `SessionContext` — selected mock user and selector state
- `ContentContext` — internal posts and subject channels
- `PublishingContext` — confirmation, three-second progress and toasts

Reusable components cover the application shell, navigation, page headers,
cards, badges, buttons, modal focus management, the channel selector and the
publishing composer. Deterministic data is centralised in
`src/data/mockData.ts`; student and version details are centralised in
`src/config/app.ts`.

## Browser storage

Malformed values safely fall back to seed state.

| Key | Contents |
|---|---|
| `lt-content-hub.preferences.v1` | theme and subscribed feed IDs |
| `lt-content-hub.channels.v1` | mock subject channel changes |
| `lt-content-hub.internal-posts.v1` | newly published internal posts |

The selected user is deliberately **not persisted**. A full application load
always shows the user selector because this is a simulation, not authentication.

## Accessibility and responsive design

The interface targets good WCAG 2.2 AA practice with semantic
header/nav/main/footer landmarks, a visible skip link, one H1 per page, semantic
breadcrumbs, visible focus rings, labelled controls, native buttons and links,
ARIA state for drawers/tabs/expansion, modal and drawer focus containment,
Escape and focus return, polite toast announcements, 44px touch targets and
`prefers-reduced-motion`. Layouts are designed for 360, 768, 1024 and 1440px
viewports.

## Mock-data policy

All names, posts, summaries and external articles are local demonstration data.
The 50 external article titles and summaries are original synthetic text; the
application performs no network feed retrieval and reproduces no source
articles. Counts and timestamps are deterministic for reliable marking and
screenshots.

## Git development process

The project was developed chronologically on feature branches. Each milestone
was linted, production-built, committed, then merged to `main` before the next
milestone began. Inspect the genuine history with:

```bash
git log --graph --oneline --decorate --all
```

## Student configuration

Replace both placeholders in `src/config/app.ts` before submission:

```ts
student: {
  name: "Andy Rea",
  number: "22809185",
}
```

## Demonstration video

Record a 3–8 minute MP4 (target 5–6 minutes) showing the student ID, face,
voice, application, responsive navigation, themes, publishing flow and code.
Place it at:

```text
public/video/assessment-demo.mp4
```

See `docs/VIDEO_SPEAKING_NOTES.md` for the guided run-through.

## Known limitations and Assessment 2

This assessment intentionally does not include server persistence, permissions,
live RSS parsing, RSS XML generation, real channel delivery, cloud
infrastructure or LMS integration. A later assessment can introduce those
services behind the existing content and publishing boundaries. The mock
three-second delay represents that future server operation.

## Clean submission checklist

1. Confirm the student name and number are correct.
2. Add and test the final 3–8 minute MP4.
3. Run `npm ci`, `npm run lint` and `npm run build`.
4. Review keyboard operation at the four target widths.
5. Confirm the repository link and Git graph.
6. Exclude `node_modules`, `.next` and local environment files from the zip.
7. Submit through Moodle/Turnitin and confirm a similarity score is generated.

Additional materials:

- `docs/VIDEO_SPEAKING_NOTES.md`
- `docs/WRITTEN_JUSTIFICATION.md`
- `docs/SUBMISSION_CHECKLIST.md`
