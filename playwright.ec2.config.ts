import { defineConfig, devices } from "@playwright/test";

// Runs from the EC2 host against the deployed Docker services. The test posts
// are deleted in `finally` blocks, so the seeded assessment data is preserved.
export default defineConfig({
  testDir: "./tests/playwright",
  fullyParallel: false,
  forbidOnly: true,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report-ec2", open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_RSS_CLIENT_BASE_URL ?? "http://127.0.0.1:5000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium-ec2", use: { ...devices["Desktop Chrome"] } }],
});
