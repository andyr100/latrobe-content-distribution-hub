import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:5000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm --prefix api run dev",
      url: "http://127.0.0.1:4000/health",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        DATABASE_STORAGE: "./tests/.playwright.sqlite",
        APP_BASE_URL: "http://127.0.0.1:4000",
        FRONTEND_BASE_URL: "http://localhost:3000",
      },
    },
    {
      command: "npm --prefix rss-client run dev",
      url: "http://localhost:5000",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        API_BASE_URL: "http://127.0.0.1:4000",
        NEXT_PUBLIC_RSS_AUTO_REFRESH_ENABLED: "false",
      },
    },
    {
      command: "npm --prefix frontend run dev",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:4000",
      },
    },
  ],
});
