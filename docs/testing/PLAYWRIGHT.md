# Playwright end-to-end testing

The Playwright suite uses an isolated SQLite file at `api/tests/.playwright.sqlite`. It does not use or reset the normal demonstration database. Test posts have unique names and are deleted in `finally` blocks.

Install Chromium once:

```powershell
npx playwright install chromium
```

Run the server CRUD and RSS Client browser use cases:

```powershell
docker compose stop frontend api rss-client
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:report
docker compose start api frontend rss-client
```

The suite deliberately refuses to reuse services already occupying ports 3000, 4000 or 5000. This guarantees that its configured test database is used instead of the normal Docker/demo database. The HTML report is generated in `playwright-report/`. Screenshots and traces are retained only when a test fails. The assessed workflows are:

1. Create, retrieve, update, publish through RSS, delete, and verify deletion through the real API.
2. Create a known post, open the standalone mock LMS, choose its feed, and verify the RSS item is rendered in Chromium.
3. Open Hub Intelligence and verify database metrics, charts, filters, pagination and collapsible evidence.

Verified on 16 August 2026: **3/3 tests passed in 22.9 seconds**.

Do not claim a passing result in the assessment video until the suite has actually run on the demonstration machine.
