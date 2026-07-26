# Testing, README, Video and Submission

## Functional validation

- user selector appears on fresh load
- all four users are selectable
- current user chip changes
- Create Post validates all required fields
- All Channels selects all active channels
- individual pills can be removed
- confirmation details are correct
- publishing locks modal for exactly three seconds
- success toast shows title and channel count
- new post appears first
- external article uses same publishing flow
- five feeds and 50 articles exist
- subscription switches alter External RSS
- channel add/delete updates state
- View Posts filters correctly
- theme persists
- selected user does not persist as authentication
- breadcrumbs and mobile drawer work

## Quality commands

```bash
npm ci
npm run lint
npm run build
npm run dev
```

## Keyboard test

Using no mouse:

- skip to main
- choose user
- use sidebar/drawer
- switch tabs
- operate all filters
- create a post
- use channel multi-select
- remove pills
- cancel and confirm publishing
- close toast
- add/delete channel
- change settings
- navigate breadcrumbs

## README contents

- purpose and correct product interpretation
- Assessment 1 frontend-only scope
- framework and commands
- route list
- feature list
- architecture
- component approach
- Local Storage keys
- mock-data explanation
- accessibility
- theme behaviour
- Git milestone process
- student config location
- video replacement path
- limitations
- Assessment 2 future work
- clean submission instructions

Explicitly state:

- no backend
- no database
- no real authentication
- no live RSS
- no LMS connection

## Video — target 5–6 minutes

The formal limit is 3–8 minutes.

Show:

- student ID, face and voice
- app purpose and frontend-only scope
- Dashboard
- responsive sidebar and hamburger menu
- theme transition
- mock user selection
- Internal Posts and filters
- Create Post
- channel pills and All Channels
- confirmation
- three-second spinner
- success toast
- newly inserted post
- External RSS filters and repost
- Channels
- Settings/subscriptions
- Workflow
- About/video
- code components and state
- Git history

## Written justification — approximately 1,200 words

Cover:

1. application purpose
2. design decisions
3. component structure
4. state management
5. responsive design
6. accessibility
7. UX decisions
8. reusable publishing workflow
9. theme transition
10. trade-offs
11. frontend-only scope
12. future RSS-to-LMS integration

Explain key choices:

- user selector rather than fake login
- one publishing workflow for both sources
- one modal system
- searchable channel selector with pills
- minimal settings
- six navigation items
- subtle glassmorphism
- Local Storage rather than database
- no rich-text editor
- no backend in Assessment 1

## Final submission

- replace student placeholders
- replace video placeholder
- confirm video length
- test repository link
- remove `node_modules` and `.next`
- verify clean install
- zip source
- submit through Moodle/Turnitin
- confirm a similarity score is generated
