# Confirmed Requirements and Decisions

## 1. Product name

**La Trobe Content Distribution Hub**

Do not call it LaTrobeRSS or La Trobe Content Management Hub.

## 2. Product purpose

This is not primarily an RSS reader.

It is a frontend publishing and distribution interface used by lecturers and administrators to:

- create university or subject content
- publish content to one or more subject channels
- simulate distribution through RSS feeds
- subscribe to external RSS sources
- review external articles
- republish external articles to selected subject channels
- demonstrate how students will later receive content through an LMS

## 3. Assessment boundary

Assessment 1 is frontend only.

Do not implement:

- a database
- live RSS retrieval or parsing
- authentication
- server-side permissions
- API routes
- LMS connectivity
- cloud deployment infrastructure
- backend channel creation or deletion
- backend persistence

Mock all server behaviour through React state and Local Storage where persistence is required.

## 4. Required navigation

Use exactly six principal navigation items:

1. Dashboard
2. Posts
3. Channels
4. Workflow
5. About
6. Settings

Mapping to the formal assignment:

- Home → Dashboard
- Feeds / Posts → Posts
- About → About
- Settings → Settings

Do not create separate Search, Classification or Administration pages. Search and filters belong inside Posts.

## 5. Mock user selection

Do not create a login page.

Every full application load must open a blurred glass modal requiring selection of one mock user:

- Administrator
- Dr Sarah Williams
- Prof Michael Chen
- Dr Emily Taylor

The selected user:

- appears in a profile chip in the top-right
- can be changed by reopening the same modal
- becomes the author of newly created posts
- is not persisted as fake authentication
- must be selected again on a fresh application load

## 6. Internal posts

Internal posts contain:

- title
- body
- date and time
- one fixed classification
- author based on selected mock user
- one or more destination channels
- simulated published status

The newest created post appears immediately at the top of Internal Posts.

## 7. Fixed classifications

Use exactly these centrally configured classifications:

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

Users cannot create, rename or delete classifications.

## 8. Channel selection

Use a searchable multi-select dropdown.

Requirements:

- multiple channels can be selected
- “All Channels” selects every available channel
- selected channels appear as removable pills
- pills display inline and wrap naturally
- each pill has an accessible remove action
- selected count is visible
- the publish action is disabled until at least one channel is selected
- avoid one selected item per row

## 9. Reusable publishing workflow

Internal and external content must use one shared workflow.

### Confirmation

A blurred confirmation modal lists:

- title
- classification
- author
- selected channels
- selected channel count

For four or fewer channels, list codes directly. For more than four, show the count and an optional expandable channel list.

### Loading

After Confirm:

- modal cannot close
- spinner is displayed
- “Publishing to selected channels…” is displayed
- simulated delay lasts exactly 3 seconds

### Success

After three seconds:

- modal closes
- internal post is inserted at the top of Internal Posts when relevant
- toast slides from the top-right
- toast includes the post title and number of channels
- toast remains approximately five seconds
- toast has a close button
- toast is keyboard accessible and screen-reader announced

## 10. External RSS

Provide five mock sources:

1. Microsoft AI Blog
2. AWS News
3. Google Developers
4. Stack Overflow Blog
5. Higher Education News

Each feed has 10 synthetic articles, for 50 total.

External articles include:

- title
- source
- date and time
- classification/category
- summary
- expand/open behaviour
- Post to Channels action

Users can:

- search articles
- filter by source
- filter by classification
- expand article details
- republish through the shared publishing workflow

## 11. Channels

Provide approximately 10–12 mock subject channels.

Every subject code begins with `LT`.

Each card shows:

- channel code
- subject name
- semester
- active status
- post count
- View Posts
- Delete

Add Channel opens a modal with:

- subject code
- subject name
- semester
- active checkbox

Add and Delete update frontend state and show the standard toast.

Channel administration must remain simple.

## 12. Settings

Keep Settings intentionally minimal.

Include:

- light, dark and optional system theme selection
- five mock RSS subscription switches
- Local Storage persistence for theme and subscriptions
- Manage Channels link
- assessment/version panel

Unsubscribing from a feed removes its articles from External RSS. Resubscribing restores them.

## 13. Dashboard

Use restrained glass cards showing:

- Posts Published
- Subject Channels
- External RSS Feeds
- Logged-in User
- short recent activity list
- quick actions

Quick actions:

- Create Post
- View External RSS
- Manage Channels
- Open Settings

Avoid unnecessary analytics.

## 14. Workflow

Show the lecturer/admin journey, not backend architecture.

Internal:

Create Post → Choose Channels → Confirm Publish → RSS Feed Generated → Students View in LMS

External:

External RSS Feed → Review Article → Choose Channels → Republish → Students View in LMS

Clearly label the process as simulated for Assessment 1.

## 15. Visual design

- subtle professional glassmorphism
- complete light and dark themes
- cyan, violet and magenta used sparingly
- approximately two-second theme transition
- no animation of layout dimensions
- respect `prefers-reduced-motion`
- strong readability
- no grey dropdowns with white text
- dropdowns, menus and modals readable in both themes
- polished but not an enterprise platform

## 16. Original assessment UI requirements

Include:

- header with assessment title
- footer with student name and number
- About page with student details and video placeholder
- desktop navigation
- responsive hamburger menu
- transform/animation on mobile navigation
- breadcrumbs
- hide/show interactions
- Local Storage preferences
- keyboard support
- ARIA where appropriate
- responsive layouts
- reusable React components

## 17. Git policy

Every major feature must be developed chronologically on an appropriate branch, validated with lint and build, committed, and merged before the next milestone.

Never fabricate multiple commits after the application has been built.
