# Playwright end-to-end testing

The Playwright suite uses an isolated SQLite file at `api/tests/.playwright.sqlite`. It does not use or reset the normal demonstration database. Test posts have unique names and are deleted in `finally` blocks.

Install Chromium once:

```powershell
npx playwright install chromium
```

Run the server CRUD and RSS Client browser use cases:

```powershell
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:report
```

The HTML report is generated in `playwright-report/`. Screenshots and traces are retained only when a test fails. The two assessed workflows are:

1. Create, retrieve, update, publish through RSS, delete, and verify deletion through the real API.
2. Create a known post, open the standalone mock LMS, choose its feed, and verify the RSS item is rendered in Chromium.

Do not claim a passing result in the assessment video until the suite has actually run on the demonstration machine.
