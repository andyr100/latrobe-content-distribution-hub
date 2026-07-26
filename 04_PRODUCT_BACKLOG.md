# Product Backlog

All P0 items are mandatory.

## HUB-001 — Project foundation

**Priority:** P0

Acceptance criteria:

- project created from `npx create-next-app .`
- App Router, TypeScript, Tailwind and ESLint enabled
- central student and application configuration
- `.gitignore` excludes generated folders
- lint and build pass

Commit: `chore(project): initialise Next.js application`

## HUB-002 — Design system and application shell

**Priority:** P0

Acceptance criteria:

- central semantic colour tokens
- complete light/dark surface definitions
- reusable glass card, button, input and modal primitives
- shared header, sidebar/main area and footer
- no unreadable grey dropdown/white-text combinations
- assessment title and student placeholders included

Commit: `feat(layout): add shared application shell and design system`

## HUB-003 — Responsive navigation and breadcrumbs

**Priority:** P0

Acceptance criteria:

- desktop sidebar has six required routes
- active page clearly shown
- mobile hamburger opens animated glass drawer
- Escape closes drawer
- navigation closes drawer
- focus returns to trigger
- breadcrumbs on all secondary pages

Commit: `feat(navigation): add responsive sidebar hamburger menu and breadcrumbs`

## HUB-004 — Persistent theme system

**Priority:** P0

Acceptance criteria:

- light and dark themes complete
- optional system setting
- approximately two-second visual transition
- reduced-motion support
- Local Storage persistence
- no wrong-theme flash where practical

Commit: `feat(theme): implement persistent light and dark themes`

## HUB-005 — Mock user selection

**Priority:** P0

Acceptance criteria:

- user modal appears on every fresh app load
- four fixed users available
- Continue disabled until selection
- profile chip shows chosen user
- profile chip reopens modal
- selected user becomes post author
- user is not persisted as authentication

Commit: `feat(user): add mock user selection workflow`

## HUB-006 — Dashboard

**Priority:** P0

Acceptance criteria:

- summary cards for posts, channels, feeds and user
- concise recent activity
- four required quick actions
- Create Post opens shared create modal
- dashboard is informative but uncluttered

Commit: `feat(dashboard): build content distribution dashboard`

## HUB-007 — Posts module

**Priority:** P0

Acceptance criteria:

- Internal Posts and External RSS tabs
- compact toolbar
- internal filters: search, classification, author and channel
- external filters: search, source and classification
- clear filters
- Create Post visible only on Internal Posts
- cards display all required metadata
- empty-state feedback

Commit: `feat(posts): add internal and external posts views`

## HUB-008 — Internal create-post form

**Priority:** P0

Acceptance criteria:

- blurred responsive modal
- title, classification, body and channels
- title/body required
- body character count
- fixed classifications
- searchable channel multi-select
- All Channels option
- removable wrapping pills
- visible selected count
- Post disabled until valid

Commit: `feat(posts): add validated internal post composer`

## HUB-009 — Shared publishing workflow

**Priority:** P0

Acceptance criteria:

- one reusable flow handles internal and external content
- confirmation includes title, classification, author and destinations
- large channel selections can expand/collapse
- modal locks during publishing
- exactly three-second spinner
- internal posts appear at top after success
- toast slides top-right
- toast includes title and channel count
- toast is closable and accessible

Commit: `feat(publishing): add reusable mock publishing workflow`

## HUB-010 — External RSS dataset and reposting

**Priority:** P0

Acceptance criteria:

- five exact sources
- ten synthetic articles per source
- 50 total articles
- subscription state controls visibility
- article expansion is available
- Post to Channels uses HUB-009, not a separate workflow

Commit: `feat(rss): add mock RSS aggregation and reposting`

## HUB-011 — Channel management

**Priority:** P0

Acceptance criteria:

- 10–12 LT-prefixed channels
- cards show code, name, semester, status and count
- View Posts applies relevant Posts filter
- Add Channel modal validates input
- Delete uses confirmation modal
- add/delete updates UI
- standard toast confirms actions
- no complex administration

Commit: `feat(channels): add subject channel management`

## HUB-012 — Settings

**Priority:** P0

Acceptance criteria:

- appearance controls
- five subscription switches
- subscriptions persist
- external article list responds immediately
- Manage Channels link
- Assessment 1/frontend-only/version panel
- no unrelated settings

Commit: `feat(settings): add appearance and RSS subscription preferences`

## HUB-013 — Workflow page

**Priority:** P0

Acceptance criteria:

- internal lecturer journey shown
- external reposting journey shown
- clean cards/arrows
- responsive vertical layout on mobile
- simulated frontend-only wording
- future LMS/RSS integration wording

Commit: `feat(workflow): visualise RSS content distribution process`

## HUB-014 — About and video

**Priority:** P0

Acceptance criteria:

- application purpose
- frontend-only scope
- future RSS/LMS explanation
- student name and number
- usage instructions
- responsive video placeholder
- replacement path documented
- student disclaimer

Commit: `feat(about): add assessment details and demonstration video`

## HUB-015 — Accessibility and responsive hardening

**Priority:** P0

Acceptance criteria:

- complete keyboard path
- visible focus
- semantic structure
- correct ARIA state
- focus handling for modals/drawer
- screen-reader toast announcement
- sufficient contrast in both themes
- responsive checks at 360, 768, 1024 and 1440 px
- reduced motion verified

Commit: `fix(accessibility): improve keyboard contrast and responsive behaviour`

## HUB-016 — Documentation and release

**Priority:** P0

Acceptance criteria:

- README complete
- local-storage keys documented
- architecture and mock scope documented
- Git graph is genuine
- lint and build pass from clean install
- video notes and written justification prepared
- final zip excludes generated dependencies

Commit: `docs(project): complete assessment documentation`
