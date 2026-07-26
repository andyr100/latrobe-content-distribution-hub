# Design and implementation justification

## Purpose and assessment scope

The La Trobe Content Distribution Hub is a frontend prototype for a university
RSS publishing and distribution service. Its primary users are lecturers and
administrators who need to prepare an update once and send it to one or more
subject channels. A secondary workflow brings synthetic external articles into
the same workspace so useful industry or higher-education content can be
reviewed and republished. This interpretation keeps the application focused on
content distribution rather than turning it into a general RSS reader.

Assessment 1 intentionally stops at the browser boundary. Publishing, channel
management and subscriptions are simulated with React state and Local Storage.
There is no database, authentication system, live feed parser, API route or LMS
connection. The interface names this boundary repeatedly so users and markers do
not mistake a polished simulation for a production service. The three-second
publishing state represents a future server operation while still allowing the
complete user journey to be evaluated.

## Visual and interaction design

The visual direction uses restrained glassmorphism rather than decorative
spectacle. Translucent surfaces, fine borders and soft blur establish depth,
while generous spacing and a limited cyan, violet and magenta accent palette
keep the interface appropriate for a university context. Each page has a clear
eyebrow, H1, short explanation and content cards. This repeated hierarchy makes
new routes immediately understandable and supports quick scanning.

Both light and dark themes were designed through semantic CSS variables instead
of simple colour inversion. Surface strength, muted text, borders, shadows and
accent contrast are defined independently for each theme. Colour-related
properties transition over two seconds, matching the brief without animating
layout. A reduced-motion media query makes the change effectively immediate for
users who request less animation. Light, dark and system preferences are saved
in a versioned Local Storage record, and a small pre-render script reduces
wrong-theme flash.

The six-item navigation mirrors the required information architecture. Search
and classification stay inside Posts rather than becoming unnecessary top-level
destinations. Desktop users receive a compact persistent sidebar; small screens
receive a transform-based drawer that starts closed, traps focus, closes with
Escape or route selection and returns focus to its trigger. Breadcrumbs on every
secondary route reinforce location without adding navigation clutter.

## Component structure and state

Next.js App Router supplies the route structure, React provides interaction,
TypeScript protects domain boundaries and Tailwind supports concise responsive
styling. Components are separated by responsibility: layout and navigation,
small UI primitives, posts, publishing, channels, settings and user selection.
GlassCard, Button, Badge, Icon and Modal provide a consistent visual language.
This avoids small differences in spacing, focus behavior and button priority
across workflows.

Global state is split into four focused Context/reducer boundaries.
PreferencesContext owns theme and feed subscriptions. SessionContext owns the
mock user and deliberately never writes it to storage. ContentContext owns
channels and internal posts. PublishingContext owns confirmation, progress and
toast state. This division keeps updates coherent without the weight of Redux.
Stable, versioned Local Storage keys persist only the preferences and mock
content that benefit the demonstration. Defensive parsing falls back to central
seed data when stored values are missing or malformed.

All seed content is deterministic. Twelve channels, ten immutable
classifications, eight internal posts and exactly 50 articles across five feeds
live in central data files. Nothing random changes between renders, so counts,
filter results and assessment screenshots remain reproducible. External titles
and summaries are original synthetic copy rather than reproduced articles.

## Publishing workflow and UX decisions

One publishing state machine handles both internal posts and external articles.
This is the most important architectural choice in the application. The source
changes the initial content, but destination selection, confirmation, locked
progress and feedback remain identical. Users therefore learn one interaction
and the code has one place to maintain timing and accessibility behavior.

The internal composer stays on a single responsive screen. A multi-step wizard
would add navigation cost to four familiar fields. Title and body have limits
and counters; classification comes from a fixed list; publication stays
disabled until required content and a destination exist. A rich-text editor was
excluded because formatting is not central to the assessed distribution
workflow and would add dependency and accessibility cost.

Channel selection combines search, a multi-select listbox, an All active
channels action, a visible count and removable wrapping pills. This works for
one destination and remains manageable for twelve. Inline pills preserve space
better than one selected item per row and make accidental choices easy to undo.
The confirmation lists up to four channels directly and collapses longer
selections, providing useful detail without producing an oversized modal.

After confirmation, the modal cannot be dismissed and announces a busy state.
The simulation lasts exactly three seconds. Internal content is inserted at the
start of the list, while both sources produce the same top-right success toast
containing title and channel count. The toast remains for five seconds, can be
closed, and uses a polite live region. The combination of state change, text,
icon and motion avoids relying on colour alone.

## Responsive design and accessibility

Layouts were designed from a 360px baseline and expand through the requested
768, 1024 and 1440px widths. Grids collapse to a single column, toolbars reflow,
pills wrap, large workflow diagrams become vertical sequences, and modal panels
use viewport-constrained scrolling. Header labels hide selectively at the
narrowest width so profile, theme and menu controls retain full touch targets.

Accessibility uses native semantics before ARIA: buttons for actions, links for
navigation, fieldsets and labels for preferences, headings in logical order and
semantic header, nav, main and footer landmarks. The skip link becomes visible
on focus. Focus rings are deliberately prominent in both themes. The reusable
modal moves focus inside, contains Tab navigation, supports Escape when safe,
locks during publishing and returns focus on close. Drawer and article
expansion expose their state with `aria-expanded`; status changes use live
regions. Touch targets are approximately 44px and reduced motion is respected.

## Trade-offs and future work

Local Storage was chosen instead of a database because it demonstrates
persistence without crossing the Assessment 1 boundary. It is device-specific,
has no concurrency control and cannot enforce permissions. Likewise, the user
selector is intentionally not a fake login: it makes authorship testable without
implying security. Minimal settings and six navigation items keep the prototype
credible and prevent unfinished administration features from diluting the core
journey.

Assessment 2 can place authenticated services behind the current domain types:
server persistence for posts and channels, scheduled retrieval and validation
of external feeds, RSS XML generation, permission checks, audit history and LMS
delivery. Because the frontend already centralises content state and uses one
PublishRequest shape, these services can replace the simulated reducer actions
without redesigning the lecturer experience.
