# Architecture and Component Specification

## Framework

- Next.js v22+ as required by the assignment
- App Router
- React
- TypeScript
- Tailwind CSS
- browser Local Storage
- ESLint

No backend framework or API layer.

## Suggested folders

```text
src/
├─ app/
│  ├─ page.tsx
│  ├─ posts/page.tsx
│  ├─ channels/page.tsx
│  ├─ workflow/page.tsx
│  ├─ about/page.tsx
│  ├─ settings/page.tsx
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ layout/
│  ├─ navigation/
│  ├─ dashboard/
│  ├─ posts/
│  ├─ publishing/
│  ├─ channels/
│  ├─ settings/
│  └─ ui/
├─ context/
├─ reducers/
├─ data/
├─ config/
├─ types/
└─ utils/
```

## Global state

Use Context plus `useReducer` for coherent shared frontend state.

### Preferences state

- theme
- RSS subscription IDs
- optional sidebar collapse state

### Content state

- internal posts
- channels
- recent activity

### Session-only state

- selected mock user
- open modal
- active publishing request
- active toast
- navigation drawer

Do not persist the mock selected user.

## Local Storage keys

Use stable versioned keys:

```text
lt-content-hub.preferences.v1
lt-content-hub.channels.v1
lt-content-hub.internal-posts.v1
```

Preferences must include theme and feed subscriptions. Channel/post persistence is optional but useful for demonstration continuity.

Handle malformed values by returning safe defaults.

## Domain types

```ts
type UserRole = "Administrator" | "Lecturer";

type MockUser = {
  id: string;
  name: string;
  role: UserRole;
};

type Classification =
  | "University News"
  | "Subject News"
  | "Assessment Information"
  | "Examination Information"
  | "Timetable Changes"
  | "Assignment Updates"
  | "Industry News"
  | "Career Opportunities"
  | "Student Services"
  | "General Announcement";

type Channel = {
  id: string;
  code: string;
  subjectName: string;
  semester: string;
  active: boolean;
};

type InternalPost = {
  id: string;
  title: string;
  body: string;
  classification: Classification;
  authorId: string;
  publishedAt: string;
  channelIds: string[];
  status: "Published";
};

type ExternalArticle = {
  id: string;
  feedId: string;
  title: string;
  summary: string;
  classification: Classification;
  publishedAt: string;
};

type PublishRequest = {
  sourceType: "internal" | "external";
  title: string;
  body: string;
  classification: Classification;
  author: MockUser;
  channelIds: string[];
  externalArticleId?: string;
};
```

## Reusable components

### Layout

- `AppShell`
- `AppHeader`
- `DesktopSidebar`
- `MobileNavigationDrawer`
- `AppFooter`
- `Breadcrumbs`
- `UserProfileChip`

### UI primitives

- `GlassCard`
- `Button`
- `IconButton`
- `TextInput`
- `Select`
- `Toggle`
- `Badge`
- `Modal`
- `ConfirmationModal`
- `Toast`
- `Spinner`
- `EmptyState`

### Posts

- `PostsTabs`
- `PostsToolbar`
- `InternalPostCard`
- `ExternalArticleCard`
- `CreatePostModal`
- `ChannelMultiSelect`
- `SelectedChannelPills`

### Publishing

- `PublishConfirmation`
- `PublishingProgress`
- `PublishSuccessToast`
- `usePublishingWorkflow`

One shared hook/state machine must drive internal and external publishing.

## Publishing state machine

```text
idle
  → composing/selecting
  → confirming
  → publishing
  → success
  → idle
```

Cancellation is allowed before publishing begins. During `publishing`, closure is disabled.

## Server/client component rule

Use server components by default for static page structure. Use `"use client"` only for components needing React state, events, Local Storage, timers or browser focus control.
