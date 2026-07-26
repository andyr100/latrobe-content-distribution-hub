# Mandatory Git Development Lifecycle

## Absolute rule

Do not build the application first and manufacture commits later.

Every milestone must be implemented, validated, committed and merged chronologically before the next milestone starts.

## Lifecycle

1. Create/switch to milestone branch.
2. Implement only that milestone.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Fix all failures.
6. Review `git diff`.
7. Commit with the specified message.
8. Output the checkpoint.
9. Merge to `main`.
10. Pause before continuing.

## Milestones

| # | Branch | Scope | Commit |
|---|---|---|---|
| 1 | `feature/project-foundation` | create-next-app, TS, Tailwind, README, gitignore | `chore(project): initialise Next.js application` |
| 2 | `feature/design-system-layout` | tokens, glass styles, header, footer, shell | `feat(layout): add shared application shell and design system` |
| 3 | `feature/responsive-navigation` | sidebar, drawer, active route, breadcrumbs | `feat(navigation): add responsive sidebar hamburger menu and breadcrumbs` |
| 4 | `feature/theme-system` | themes, two-second transition, storage, reduced motion | `feat(theme): implement persistent light and dark themes` |
| 5 | `feature/user-selection` | selector modal, profile chip, author state | `feat(user): add mock user selection workflow` |
| 6 | `feature/dashboard` | summary cards, activity, quick actions | `feat(dashboard): build content distribution dashboard` |
| 7 | `feature/posts-module` | tabs, toolbar, filters, seed data | `feat(posts): add internal and external posts views` |
| 8 | `feature/publishing-workflow` | composer, channel pills, confirmation, spinner, toast, reuse | `feat(publishing): add reusable mock publishing workflow` |
| 9 | `feature/channels` | channel cards, add/delete/view posts | `feat(channels): add subject channel management` |
| 10 | `feature/settings` | theme controls, subscriptions, storage | `feat(settings): add appearance and RSS subscription preferences` |
| 11 | `feature/workflow` | internal/external journey | `feat(workflow): visualise RSS content distribution process` |
| 12 | `feature/about` | scope, student details, video | `feat(about): add assessment details and demonstration video` |
| 13 | `feature/accessibility-polish` | keyboard, ARIA, contrast, responsiveness | `fix(accessibility): improve keyboard contrast and responsive behaviour` |
| 14 | `docs/final-documentation` | README, screenshots, notes, checklist | `docs(project): complete assessment documentation` |

## Required checkpoint

```text
✓ Feature complete

Milestone:
Milestone X — <name>

Branch:
<actual branch>

Validation:
✓ npm run lint
✓ npm run build

Git Commit:
<actual commit>

Files changed:
- <brief factual summary>

Ready for review. Pausing before the next milestone.
```

Do not report a command as passed unless it actually passed.

When Git is unavailable, state that honestly and provide commands instead of claiming commits exist.
