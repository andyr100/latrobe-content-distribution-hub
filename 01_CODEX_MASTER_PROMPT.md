# La Trobe Content Distribution Hub
## Complete Master Prompt for Coding Agent

You are acting as a senior React/Next.js developer, UX designer and software architect.

Your task is to build a polished, professional, university-appropriate frontend application for Assessment 1 in a subject called **Cloud Based Applications**.

This prompt is the single source of truth. Follow it closely. Do not remove requirements, simplify away assessed functionality, or replace the requested full application with a prototype.

---

# 1. Assessment Context

This is **Assessment 1** of a larger project that will continue into later assessments.

Assessment 1 focuses specifically on:

- Frontend design
- Usability
- Responsive design
- React
- Component-based architecture
- State management
- Navigation
- Accessibility
- Local Storage
- Interactive frontend behaviour
- GitHub quality and development history

Assessment 1 does **not** require:

- A database
- Real authentication
- Live RSS parsing
- Backend feed processing
- API routes
- Real LMS integration
- Cloud deployment
- Server-side persistence

All backend behaviour must therefore be simulated in the frontend using mock data and React state.

The application must be created from:

```bash
npx create-next-app
```

Use:

- Next.js
- App Router
- React
- TypeScript
- ESLint
- Tailwind CSS
- `src/` directory
- Import alias `@/*`

Do not submit standalone HTML or JavaScript files.

---

# 2. Application Name and Purpose

The application is called:

# **La Trobe Content Distribution Hub**

It is a frontend prototype of an RSS publishing server used by university lecturers and administrators.

The purpose is to allow lecturers and administrators to:

- Create posts
- Classify posts
- Select one or more university subject channels
- Mock-publish posts to those channels
- Subscribe to external RSS feeds
- Review external RSS articles
- Republish external articles to selected subject channels

This is **not** primarily an RSS reader.

It is a content publishing and distribution interface for lecturers and administrators, with an additional external RSS aggregation area.

---

# 3. Design Philosophy

The UI should be:

- Simple
- Elegant
- Professional
- Clean
- Modern
- Polished
- Uncluttered
- Appropriate for a university assignment
- Visually impressive without looking over-engineered

Do not turn this into an enterprise platform.

Avoid unnecessary features, excessive statistics, complicated multi-step workflows or deep administration screens.

Every component should serve one of three purposes:

1. Satisfy an assessment requirement.
2. Support the application’s core user workflow.
3. Improve usability.

Consistency is critical.

Similar interactions should look and behave the same throughout the application.

---

# 4. Visual Style

Use a subtle modern glassmorphic design.

The application should support both:

- Light mode
- Dark mode

Use a restrained accent palette based on:

- Cyan
- Violet
- Magenta

The design should include:

- Frosted glass cards
- Soft translucent surfaces
- Subtle blur
- Fine borders
- Restrained glow
- Rounded corners
- Good spacing
- Clear typography
- Strong readability

Avoid:

- Overly bright cyberpunk styling
- Excessive animation
- Overcrowded dashboards
- Low contrast
- Grey dropdowns combined with white text
- White controls placed on indistinguishable pale backgrounds
- Decorative effects that reduce usability

Dropdowns, menus and modals must remain clearly readable in both light and dark mode.

---

# 5. Theme Behaviour

The application must include a light/dark theme control.

When switching themes:

- The transition should occur smoothly over approximately 2 seconds.
- Transition colours, backgrounds, borders, shadows, icons, fills and strokes.
- Do not animate layout size or positioning.
- Respect `prefers-reduced-motion`.
- If reduced motion is enabled, theme switching should become immediate or nearly immediate.
- Store the user’s theme preference in Local Storage.
- Apply the preference after refresh.
- Avoid a flash of the wrong theme where practical.

---

# 6. Required Navigation

The application must include these six main navigation items:

1. Dashboard
2. Posts
3. Channels
4. Workflow
5. About
6. Settings

This keeps the navigation simple and satisfies the original required pages:

- Home → Dashboard
- Feeds / Posts → Posts
- About → About
- Settings → Settings

Do not add separate Search, Categories or Administration pages.

Search and filtering should exist within the Posts page.

---

# 7. Shared Layout

Every page should use a consistent shared application shell containing:

- Header
- Desktop sidebar
- Mobile hamburger menu
- Main content area
- Footer
- Breadcrumbs where appropriate

The header must display the assessment title, for example:

**Cloud Based Applications – Assessment 1**

The footer must display:

- Student name
- Student number

Store the student name and student number in one central configuration file so they are not repeated throughout the code.

Example:

```ts
export const student = {
  name: "REPLACE WITH REAL NAME",
  studentNumber: "REPLACE WITH REAL STUDENT NUMBER",
} as const;
```

The real details should be committed before submission.

---

# 8. Responsive Navigation

## Desktop

Use a simple left-hand sidebar.

The sidebar should:

- Show the six main navigation items.
- Clearly indicate the current page.
- Use icons and labels.
- Be clean and compact.
- Not dominate the screen.

A collapsible desktop sidebar is acceptable but optional. If implemented, persist the collapsed state in Local Storage.

## Mobile

Use a hamburger menu.

The hamburger menu must:

- Be visible at compact screen widths.
- Open a blurred glassmorphic navigation drawer.
- Use a CSS transform or similar animation.
- Support keyboard navigation.
- Include `aria-expanded`.
- Include `aria-controls`.
- Close with Escape.
- Close when a navigation item is selected.
- Return focus to the trigger after closing.
- Start closed whenever the application loads.

---

# 9. User Selection

Do not build a login page.

Every time the application loads, show a blurred modal requiring the user to choose a mock user.

Users:

- Administrator
- Dr Sarah Williams
- Prof Michael Chen
- Dr Emily Taylor

The modal should contain:

- Heading such as “Select User”
- Dropdown or selectable list
- User name
- Role
- Continue button
- Continue button disabled until a user is selected

After selection:

- Close the modal.
- Show the selected user in a profile chip in the top-right corner.
- Clicking the profile chip reopens the same user selection modal.
- The chosen user becomes the author for newly created posts.
- The modal should appear again on every full application load.
- Do not persist the selected user as a fake authentication session.
- This is a frontend simulation only.

Use one reusable modal component for this and other modal workflows.

---

# 10. Dashboard Page

The Dashboard is the Home page.

It should immediately explain what the application does.

Use a simple grid of glass cards.

Include:

## Summary Cards

- Posts Published
- Subject Channels
- External RSS Feeds
- Logged-in User

## Recent Activity

Show a short list of recent mock actions, for example:

- Dr Sarah Williams published “Assessment Reminder” to 3 channels.
- Administrator added LTCSE3WEB.
- Prof Michael Chen reposted an external industry article.

Keep the recent activity list short.

## Quick Actions

Include simple actions:

- Create Post
- View External RSS
- Manage Channels
- Open Settings

Avoid unnecessary metrics or overly detailed analytics.

The Dashboard must feel informative but not crowded.

---

# 11. Posts Page

The Posts page is the main content area.

Use two clear tabs:

1. Internal Posts
2. External RSS

Place a clean toolbar above the content.

The toolbar should include:

- Search
- Classification filter
- Author filter
- Channel filter
- Clear filters
- Internal Posts / External RSS tab switch
- Create Post button shown only on Internal Posts

Keep the toolbar compact and easy to scan.

---

# 12. Internal Posts Tab

Display all posts created within the mock application.

Each post card or row should show:

- Title
- Classification
- Post body preview
- Author
- Date and time
- Channels published to
- Status
- View or expand action if appropriate

Newly published posts must immediately appear at the top of the Internal Posts list.

Use the current selected user as the author.

Post data can be held in React state and optionally persisted in Local Storage for demonstration continuity.

The frontend must clearly indicate that publishing is simulated.

---

# 13. External RSS Tab

The application should include five mock RSS feeds.

Use these sources:

1. Microsoft AI Blog
2. AWS News
3. Google Developers
4. Stack Overflow Blog
5. Higher Education News

Each feed must contain 10 synthetic articles, giving 50 external articles in total.

Each external article should include:

- Title
- Source
- Publication date and time
- Classification or category
- Summary
- “Post to Channels” button

Users should be able to:

- Search external articles
- Filter by RSS source
- Filter by classification
- Open or expand an article
- Click “Post to Channels”

The “Post to Channels” action must reuse the exact same publishing workflow as internally created posts.

Do not create a separate publishing pattern for external RSS content.

---

# 14. Post Classifications

Use a fixed central list of at least 10 classifications.

Use exactly these:

1. University News
2. Subject News
3. Assessment Information
4. Examination Information
5. Timetable Changes
6. Assignment Updates
7. Industry News
8. Career Opportunities
9. Student Services
10. General Announcement

Store these centrally.

Do not allow users to create or edit classifications.

Use classification chips or badges consistently across the application.

---

# 15. Create Post Workflow

Clicking “Create Post” opens a polished blurred glassmorphic modal.

The modal should be visually balanced and responsive.

Fields:

- Title
- Classification
- Post body
- Channels

Use a single-screen form rather than a multi-step wizard.

The form should remain simple and easy to understand.

## Title

- Required
- Clear label
- Reasonable character limit
- Inline validation

## Classification

- Required
- Dropdown using the fixed classification list

## Post Body

- Required
- Multi-line textarea
- Character counter
- No rich text editor needed

## Channels

Use a searchable multi-select dropdown.

Requirements:

- User can select multiple channels.
- Include an “All Channels” option.
- Selecting “All Channels” selects every available subject channel.
- Selected channels appear below the dropdown as removable pills.
- Pills appear on the same row where space permits.
- Pills wrap naturally to the next line when required.
- Each pill includes an “x” remove action.
- Removing a pill immediately removes that channel from the selection.
- Show a selected channel count.
- Do not display selected channels as one item per row.

Example:

```text
[LTCSE4CBA ×] [LTCSE3DBF ×] [LTCSE3AIM ×]
```

The Post button is disabled until all required fields are valid and at least one channel is selected.

---

# 16. Publishing Confirmation Flow

The same reusable publishing workflow must be used for:

- New internal posts
- External RSS articles

## Step 1 – Confirm

When the user clicks Post or Post to Channels, open a blurred confirmation modal.

Show:

- Post title
- Classification
- Author
- Selected channels
- Number of selected channels

If four or fewer channels are selected, list the channel codes.

If more than four are selected, show:

- The total channel count
- Optional “View selected channels” expand/collapse control

Buttons:

- Cancel
- Confirm

## Step 2 – Loading

After clicking Confirm:

- Prevent the modal from being closed.
- Replace the action area with a spinner.
- Show text such as “Publishing to selected channels…”
- Simulate publishing for exactly 3 seconds.

## Step 3 – Success

After 3 seconds:

- Close the modal.
- Add the new post to Internal Posts if it was internally created.
- Show a toast sliding in from the top-right.

The toast must include:

- Success heading
- Post title
- Number of channels published to

Example:

**Post Published Successfully**

“Semester 2 Assessment Reminder”

Published to **3 channels**

The toast should:

- Remain visible for around 5 seconds.
- Include a visible close button.
- Use a subtle progress indicator if practical.
- Be keyboard accessible.
- Be announced to screen readers.

The same toast style must be reused throughout the application.

---

# 17. Channels Page

Use approximately 10–12 mock university subject channels.

Prefix all subject codes with **LT**.

Use examples such as:

- LTCSE4CBA – Cloud Based Applications
- LTCSE3DBF – Database Fundamentals
- LTCSE3AIM – Artificial Intelligence
- LTCSE3WEB – Web Development
- LTCSE3SEC – Cyber Security
- LTCSE3NET – Computer Networks
- LTCSE3DS – Data Science
- LTCSE3SE – Software Engineering
- LTCSE3UX – User Experience Design
- LTCSE3ML – Machine Learning

Keep the Channels page simple.

Each channel card should show:

- Channel code
- Subject name
- Semester
- Active status
- Number of posts
- View Posts
- Delete

Add Channel button opens a modal containing:

- Subject code
- Subject name
- Semester
- Active checkbox

Adding a channel should:

- Update the UI.
- Store the channel in frontend state.
- Optionally persist it in Local Storage.
- Show a success toast.

Deleting a channel should:

- Open the standard confirmation modal.
- Confirm the channel code and subject name.
- Remove it from the frontend state.
- Show a success toast.

Do not add complex channel administration features.

---

# 18. Settings Page

Keep Settings intentionally minimal.

Include these sections only:

## Appearance

- Light theme
- Dark theme
- Optional system theme
- Theme transition
- Store theme in Local Storage

## RSS Subscriptions

Display the five mock RSS feeds.

Each feed has:

- Feed name
- Short description
- Subscribe/unsubscribe switch

When subscribed:

- Its articles appear in External RSS.

When unsubscribed:

- Its articles disappear from External RSS.

Store subscriptions in Local Storage.

## Channels

Include a simple “Manage Channels” button linking to the Channels page.

## About This Version

Display:

- Assessment 1
- Frontend Only
- Mock Data
- Version number

Do not turn Settings into an administration screen.

---

# 19. Workflow Page

The Workflow page should visually represent the user journey rather than backend technical architecture.

Show two simple flows.

## Internal Content Flow

Create Post  
↓  
Choose Channels  
↓  
Confirm Publish  
↓  
RSS Feed Generated  
↓  
Students View in LMS

## External RSS Flow

External RSS Feed  
↓  
Review Article  
↓  
Choose Channels  
↓  
Republish  
↓  
Students View in LMS

Use clean cards, icons and connecting arrows.

The page must clearly state:

- Assessment 1 simulates the workflow.
- Live RSS processing will be added in a later assessment.
- No backend processing is currently implemented.

---

# 20. About Page

The About page must include:

- Application purpose
- Explanation that Assessment 1 is frontend only
- Explanation of future RSS Server and LMS integration
- Student name
- Student number
- Short instructions for using the site
- Embedded video placeholder
- Student project disclaimer

Use a responsive video element.

Provide a clear placeholder file path such as:

```text
public/video/assessment-demo.mp4
```

The page should explain that the placeholder must be replaced with the final 3–8 minute assessment video before submission.

---

# 21. Header and Footer

## Header

Must include:

- Assessment title
- Current user profile chip
- Theme toggle
- Mobile hamburger button

## Footer

Must include:

- Student name
- Student number
- Application name
- Frontend-only assessment note if appropriate

---

# 22. Breadcrumbs

Use breadcrumbs on:

- Posts
- Channels
- Workflow
- Settings
- About
- Any detail or filtered view

Breadcrumbs should:

- Be semantic
- Use accessible labels
- Clearly indicate current page
- Support keyboard navigation

---

# 23. Hide/Show Behaviour

The original assignment requires hide/show behaviour.

Include at least two meaningful examples:

1. Mobile hamburger navigation drawer
2. Expand/collapse external article summary or confirmation channel list

Do not add hide/show interactions purely for decoration.

---

# 24. State Management

Use React Context and/or `useReducer` where global state is required.

Recommended state areas:

## App Preferences

- Theme
- RSS subscriptions
- Optional sidebar state

## Content State

- Internal posts
- Channels
- Recent activity

## Session State

- Selected mock user

Do not use Redux unless there is a strong reason.

Avoid unnecessary dependencies.

---

# 25. Local Storage

Use Local Storage for:

- Theme preference
- RSS subscription preferences
- Optional channel changes
- Optional mock-published posts
- Optional sidebar state

Do not persist the selected user across full application loads because the user-selection modal must appear every time the app loads.

Use safe Local Storage access to avoid server-rendering errors.

Use centralised keys, for example:

```ts
export const storageKeys = {
  theme: "lt-content-hub:theme",
  subscriptions: "lt-content-hub:subscriptions",
  channels: "lt-content-hub:channels",
  posts: "lt-content-hub:posts",
} as const;
```

---

# 26. Accessibility Requirements

Target good WCAG 2.2 AA practice.

Include:

- Semantic landmarks
- One logical H1 per page
- Logical heading order
- Skip-to-content link
- Keyboard navigation
- Visible focus indicators
- Labelled form controls
- `aria-current`
- `aria-expanded`
- `aria-controls`
- Accessible modals
- Focus trapping
- Escape key support
- Focus return after modal close
- Accessible toast region
- Sufficient colour contrast
- No colour-only meaning
- Touch targets around 44px
- `prefers-reduced-motion`
- Accessible carousel if one is included

Use native HTML semantics before adding ARIA.

---

# 27. Modals

Use one reusable modal system throughout.

Apply it consistently to:

- User selection
- Create Post
- Confirm Publish
- Add Channel
- Delete Channel
- RSS subscription confirmation if needed

Every modal should:

- Use a blurred backdrop
- Use a glassmorphic panel
- Have consistent spacing
- Use the same button layout
- Put the primary action on the right
- Put the secondary action on the left
- Support Escape
- Support focus trapping
- Return focus to the trigger
- Close on backdrop click, except while publishing spinner is active
- Animate with a subtle fade and scale

Consistency is more important than novelty.

---

# 28. Toasts

Use one reusable toast system.

Use it for:

- Post published
- External article republished
- Channel added
- Channel deleted
- RSS subscription changed
- Settings reset if implemented

Toasts should:

- Slide in from the top-right
- Use clear text
- Have a close button
- Remain visible briefly
- Be accessible to screen readers
- Match both themes
- Never use low-contrast grey-on-white combinations

---

# 29. Cards and Lists

Use cards for:

- Dashboard summaries
- Internal posts
- External RSS articles
- Channels
- Workflow stages

Cards should be:

- Consistent
- Responsive
- Easy to scan
- Not overloaded with fields
- Clearly interactive when clickable
- Accessible by keyboard where needed

---

# 30. Original Assessment Requirements to Explicitly Satisfy

The final application must visibly demonstrate all of the following:

- React frontend
- Component-based architecture
- State management
- Responsive UI
- Navigation bar or tab bar
- Header
- Footer
- About page
- Name and student number
- Short video on About page
- Hamburger or kebab menu
- Accessible colour contrast
- Readable typography
- Keyboard navigation
- ARIA support where appropriate
- Quick scanning of content
- Light and dark themes
- Theme saved in cookie or Local Storage
- Hide/show behaviour
- RSS-to-LMS workflow representation
- Breadcrumbs
- Dynamic or interactive links
- Local Storage for preferences
- Visual feedback
- Reusable content areas
- Professional frontend
- App Router
- No standalone HTML submission
- No backend RSS processing in Assessment 1

---

# 31. Git Requirements

This is mandatory.

Do not build the entire application and commit once at the end.

Every major feature or major change must result in a separate Git commit.

Use real chronological commits.

Do not fabricate Git history after all code has already been written.

For every milestone:

1. Create or switch to the feature branch.
2. Implement the milestone.
3. Run:

```bash
npm run lint
npm run build
```

4. Fix issues.
5. Commit.
6. Merge to `main`.
7. Only then begin the next milestone.

---

# 32. Git Milestones

Use approximately these milestones.

## Milestone 1 – Project Foundation

Branch:

```text
feature/project-foundation
```

Implement:

- create-next-app
- TypeScript
- Tailwind
- App Router
- Basic README
- `.gitignore`

Commit:

```text
chore(project): initialise Next.js application
```

## Milestone 2 – Design System and Shared Layout

Branch:

```text
feature/design-system-layout
```

Implement:

- Design tokens
- Glass card styles
- Header
- Footer
- Shared shell

Commit:

```text
feat(layout): add shared application shell and design system
```

## Milestone 3 – Responsive Navigation

Branch:

```text
feature/responsive-navigation
```

Implement:

- Desktop sidebar
- Mobile hamburger drawer
- Active route
- Breadcrumbs

Commit:

```text
feat(navigation): add responsive sidebar hamburger menu and breadcrumbs
```

## Milestone 4 – Theme System

Branch:

```text
feature/theme-system
```

Implement:

- Light mode
- Dark mode
- 2 second transition
- Local Storage
- Reduced motion

Commit:

```text
feat(theme): implement persistent light and dark themes
```

## Milestone 5 – User Selection

Branch:

```text
feature/user-selection
```

Implement:

- User selector modal
- Profile chip
- Reopen selection
- Current author state

Commit:

```text
feat(user): add mock user selection workflow
```

## Milestone 6 – Dashboard

Branch:

```text
feature/dashboard
```

Implement:

- Summary cards
- Recent activity
- Quick actions

Commit:

```text
feat(dashboard): build content distribution dashboard
```

## Milestone 7 – Posts Module

Branch:

```text
feature/posts-module
```

Implement:

- Internal Posts
- External RSS tabs
- Toolbar
- Search
- Filters
- Mock data

Commit:

```text
feat(posts): add internal and external posts views
```

## Milestone 8 – Publishing Workflow

Branch:

```text
feature/publishing-workflow
```

Implement:

- Create Post modal
- Channel multi-select
- Pills
- Confirmation modal
- 3 second spinner
- Toast
- Add new post to list
- Reuse for external RSS

Commit:

```text
feat(publishing): add reusable mock publishing workflow
```

## Milestone 9 – Channels

Branch:

```text
feature/channels
```

Implement:

- Channel cards
- Add
- Delete
- View Posts

Commit:

```text
feat(channels): add subject channel management
```

## Milestone 10 – Settings

Branch:

```text
feature/settings
```

Implement:

- Theme options
- RSS subscriptions
- Local Storage
- Manage Channels link

Commit:

```text
feat(settings): add appearance and RSS subscription preferences
```

## Milestone 11 – Workflow Page

Branch:

```text
feature/workflow
```

Implement:

- Internal content flow
- External RSS flow
- Frontend-only explanation

Commit:

```text
feat(workflow): visualise RSS content distribution process
```

## Milestone 12 – About and Video

Branch:

```text
feature/about
```

Implement:

- Student details
- Project scope
- Video placeholder
- Usage instructions

Commit:

```text
feat(about): add assessment details and demonstration video
```

## Milestone 13 – Accessibility and Responsive Polish

Branch:

```text
feature/accessibility-polish
```

Implement:

- Keyboard review
- Focus states
- ARIA
- Contrast
- Reduced motion
- Responsive fixes

Commit:

```text
fix(accessibility): improve keyboard contrast and responsive behaviour
```

## Milestone 14 – Documentation and Release

Branch:

```text
docs/final-documentation
```

Implement:

- Final README
- Screenshots
- Video notes
- Submission checklist

Commit:

```text
docs(project): complete assessment documentation
```

Do not continue to the next milestone until the current milestone has been committed.

---

# 33. README Requirements

The final README should contain:

- Application purpose
- Assessment scope
- Frontend-only statement
- Setup instructions
- Scripts
- Routes
- Features
- Architecture summary
- Local Storage keys
- Accessibility features
- Git workflow
- Mock data explanation
- Video replacement instructions
- Known limitations
- Future Assessment 2 work
- Submission checklist

Explicitly state:

- No backend
- No database
- No live RSS
- No authentication
- No LMS connection yet

---

# 34. Video Speaking Notes

Create a 5–6 minute speaking guide.

The video must be between 3 and 8 minutes.

The final video must show:

- Student ID
- Face
- Voice
- Application
- Code
- Navigation
- Theme switching
- Hamburger menu
- Internal Posts
- External RSS
- Create Post
- Channel selection pills
- Confirmation modal
- 3 second spinner
- Success toast
- Channels
- Workflow page
- About page
- Git history

Suggested structure:

## 0:00–0:30

Show face and ID.

Explain:

- Name
- Student number
- Assessment
- Frontend-only scope
- Application purpose

## 0:30–1:15

Show Dashboard.

Explain:

- Summary cards
- Recent activity
- Quick actions
- User selection

## 1:15–2:00

Show navigation.

Demonstrate:

- Sidebar
- Hamburger
- Breadcrumbs
- Responsive layout

## 2:00–2:30

Show light/dark transition.

Explain Local Storage and reduced motion.

## 2:30–3:40

Show Posts.

Demonstrate:

- Internal Posts
- External RSS
- Search
- Filters
- Create Post
- Multi-select channels
- Pills
- Confirmation
- 3 second spinner
- Toast
- New post appears

## 3:40–4:20

Show external RSS reposting.

Explain reuse of publishing workflow.

## 4:20–4:50

Show Channels and Settings.

## 4:50–5:20

Show Workflow and About.

## 5:20–6:00

Show code structure and Git history.

Explain:

- Components
- State
- Local Storage
- Branches
- Commits
- No backend in Assessment 1

The speaking notes should sound natural rather than like a script being read word for word.

---

# 35. Written Justification

Prepare an approximately 1,200-word justification covering:

1. Application purpose
2. Design decisions
3. Component structure
4. State management
5. Responsive design
6. Accessibility
7. UX decisions
8. Reusable publishing workflow
9. Light/dark theme transition
10. Trade-offs
11. Frontend-only scope
12. Future RSS-to-LMS integration

Key design decisions to justify:

- User selector instead of fake login
- One publishing workflow reused everywhere
- Single modal pattern
- Channel multi-select with removable pills
- Minimal settings
- Six navigation items only
- Glassmorphism kept subtle
- Local Storage used instead of database
- Workflow page focuses on lecturer journey
- No rich text editor
- No backend in Assessment 1

---

# 36. Definition of Done

The application is complete only when:

- Every required page exists.
- Every original assessment requirement is visible.
- User selector appears on load.
- Current user is shown.
- Internal and External RSS tabs work.
- Five RSS feeds exist.
- Ten synthetic posts exist per feed.
- Ten classifications exist.
- Around ten LT-prefixed channels exist.
- Create Post works.
- Channel multi-select works.
- Selected channels show as removable wrapping pills.
- “All Channels” works.
- Confirmation modal works.
- 3 second spinner works.
- Toast includes title and channel count.
- New internal posts appear immediately.
- External RSS reposting uses the same workflow.
- Channels can be added and deleted.
- RSS subscriptions can be toggled.
- Theme persists.
- Theme transition works.
- Hamburger menu works.
- Breadcrumbs work.
- Keyboard navigation works.
- Accessibility checks pass.
- `npm run lint` passes.
- `npm run build` passes.
- Git history contains multiple meaningful commits.
- `node_modules` is not committed.
- README is complete.
- Video placeholder exists.
- Real student details are added before submission.
- The application remains frontend-only.

---

# Final Instruction

Build the **simplest application that fully satisfies every assessment requirement**, while presenting it with a polished, consistent, modern and professional user interface.

Do not add features merely to make the project appear larger.

Do not remove any requirement in this prompt.

Do not replace the full application with a prototype.

Implement milestone by milestone, committing after every major feature.
