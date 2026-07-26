# Video speaking guide (target: 5–6 minutes)

The formal recording must be between 3 and 8 minutes. Show your face, voice and
student ID at the beginning. These are prompts for a natural explanation rather
than a script to read word for word.

## 0:00–0:30 — Introduction

- Show face and student ID.
- State your name, student number and assessment.
- Explain that the Hub is a frontend-only prototype for publishing internal and
  curated external content to subject RSS channels.
- Clearly state that there is no backend, database, live RSS or LMS connection.

## 0:30–1:15 — Dashboard and mock user

- Reload to show the mandatory user selector.
- Choose a lecturer and point out the current-user chip.
- Explain the summary cards, recent activity and four quick actions.
- Mention that the user is session-only and becomes the post author.

## 1:15–2:00 — Navigation and responsive design

- Visit all six destinations using the desktop sidebar.
- Point out active-route styling and breadcrumbs.
- Narrow the viewport and open the animated hamburger drawer.
- Close it with Escape and explain focus return.

## 2:00–2:30 — Themes

- Switch between light and dark themes.
- Open Settings and show Light, Dark and System choices.
- Explain the two-second transition, Local Storage and reduced-motion behavior.

## 2:30–3:40 — Internal publishing

- Open Posts and demonstrate search plus author/classification/channel filters.
- Choose Create Post and briefly show required-field validation.
- Complete title, classification and body.
- Search for channels, choose All active channels and remove one inline pill.
- Review the confirmation details and expand a large channel selection.
- Confirm, narrate the locked three-second spinner, then point out the toast.
- Show that the new post appears first and uses the selected user as author.

## 3:40–4:20 — External RSS

- Switch to External RSS and explain the five sources and 50 synthetic articles.
- Search/filter, expand a summary and choose Post to channels.
- Explain that this uses the same composer, confirmation, spinner and toast.
- Toggle a subscription in Settings and show that its articles disappear.

## 4:20–4:50 — Channels and settings

- Add a valid LT-prefixed channel and show the success toast.
- Use View Posts to apply its Posts filter.
- Demonstrate the standard delete confirmation.
- Reiterate that changes are local mock state.

## 4:50–5:20 — Workflow and About

- Explain both five-stage user journeys.
- Point out the explicit Assessment 1 / frontend-only boundary.
- Show purpose, student details, disclaimer and responsive video area on About.

## 5:20–6:00 — Code and Git

- Show the App Router pages and shared components.
- Highlight the four contexts, deterministic mock data and Local Storage keys.
- Show the shared PublishingContext and exact three-second timer.
- Run through `git log --graph --oneline --all` to show chronological branches.
- Finish with planned Assessment 2 RSS server and LMS integration.
