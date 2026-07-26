# Requirements Traceability

| ID | Requirement | Implementation evidence | Validation |
|---|---|---|---|
| A1-01 | Created from `npx create-next-app .` | Next.js App Router project | Inspect package and initial commit |
| A1-02 | Frontend only | Local mock data and React state | Confirm no backend/API/database |
| A1-03 | Home page | Dashboard route `/` | Navigate and inspect |
| A1-04 | Feeds / Posts page | Posts route with Internal and External RSS tabs | Interact with both tabs |
| A1-05 | About page | `/about` | Check scope, details and video |
| A1-06 | Settings page | `/settings` | Check themes and subscriptions |
| A1-07 | Header title | Shared header | Check every route |
| A1-08 | Footer name/student number | Central student config | Check every route |
| A1-09 | Component architecture | Shared shell, cards, modals, publishing workflow | Inspect source |
| A1-10 | React state | user, posts, channels, subscriptions, UI state | Interact and inspect |
| A1-11 | Responsive UI | sidebar plus mobile drawer | Test target widths |
| A1-12 | Hamburger animation | transform-based glass drawer | Mobile and keyboard test |
| A1-13 | Light/dark themes | central design tokens | Toggle every page |
| A1-14 | Persistent theme | Local Storage | Refresh browser |
| A1-15 | Hide/show | mobile drawer and article/channel expansion | Interact |
| A1-16 | Breadcrumbs | all secondary routes | Keyboard test |
| A1-17 | Dynamic interaction | publishing, filters, subscriptions, channels | End-to-end test |
| A1-18 | RSS-to-LMS representation | Workflow page | Inspect both flows |
| A1-19 | Keyboard and ARIA | modals, drawer, multi-select, toasts | Keyboard/accessibility test |
| A1-20 | User video | responsive video placeholder | Inspect About |
| HUB-01 | Select mock user on each load | mandatory user modal | Reload |
| HUB-02 | Create internal post | Create Post modal | Complete workflow |
| HUB-03 | Multi-channel publish | searchable selector and pills | Select/remove channels |
| HUB-04 | All Channels | selects all current channels | Test selection |
| HUB-05 | Exact 3-second simulation | shared publisher state machine | Time interaction |
| HUB-06 | Confirmation modal | title, author, classification, channels | Inspect |
| HUB-07 | Success toast | title and channel count | Publish |
| HUB-08 | Five external feeds | fixed mock sources | Inspect Settings and Posts |
| HUB-09 | Ten articles per feed | 50 synthetic articles | Count data |
| HUB-10 | Repost external content | shared publishing component | Publish article |
| HUB-11 | Add/delete channels | frontend channel state | Add and delete |
| HUB-12 | Fixed classifications | central immutable list of 10 | Inspect config |
| HUB-13 | Subscription persistence | Local Storage | Toggle and refresh |
| GIT-01 | Genuine commits | chronological milestone commits | Inspect graph |
| GIT-02 | Lint/build before commit | checkpoint records | Inspect output/history |
| SUB-01 | README current | full project documentation | Review |
| SUB-02 | Video 3–8 minutes | demonstration plan | Review recording |
| SUB-03 | No `node_modules` | `.gitignore` and zip audit | Inspect zip |
