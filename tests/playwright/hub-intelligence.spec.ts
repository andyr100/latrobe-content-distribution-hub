import { expect, test } from "@playwright/test";

const apiBaseUrl = process.env.HUB_API_BASE_URL ?? "http://127.0.0.1:4000";
const frontendBaseUrl = process.env.HUB_FRONTEND_BASE_URL ?? "http://localhost:3000";

test("Hub Intelligence filters, paginates and collapses its detailed evidence", async ({
  page,
  request,
}) => {
  await request.get(`${apiBaseUrl}/rss/CLOUDDEVOPS`, {
    headers: {
      "X-Client-Id": "hub-intelligence-playwright",
      "X-Client-Source": "browser",
      "X-Rss-User-Id": "ava-nguyen",
    },
  });
  await page.goto(`${frontendBaseUrl}/hubintelligence`);
  await page.getByRole("radio", { name: /Administrator Administrator/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("heading", { name: "Hub Intelligence" })).toBeVisible();
  const dashboard = page.locator("#hub-intelligence");
  const expectDayLabels = async () => {
    await expect
      .poll(async () => {
        const labels = await dashboard.locator(".xaxis .xtick").allTextContents();
        const visibleLabels = labels.map((label) => label.trim()).filter(Boolean);
        return (
          visibleLabels.length > 0 &&
          visibleLabels.every((label) => /^\d{2} [A-Z][a-z]{2}$/.test(label))
        );
      })
      .toBe(true);
  };
  await expect(dashboard.locator(".group-panel")).toHaveCount(2);
  await expect(dashboard.locator(".primary-kpi")).toHaveCount(10);
  await expect(
    dashboard.locator(".group-panel").first().locator(":scope > .section-kpis > .primary-kpi"),
  ).toHaveCount(5);
  await expect(
    dashboard.locator(".group-panel").last().locator(":scope > .section-kpis > .primary-kpi"),
  ).toHaveCount(5);
  await expect(dashboard.locator(".bars")).toHaveCount(4);
  await expect(dashboard.locator(".lineplot")).toHaveCount(2);
  await expect(dashboard.locator(".donut")).toHaveCount(2);
  await expect(dashboard.locator(".bars").first().locator(".barlabel")).not.toHaveCount(0);
  await expect(dashboard.locator(".chart").first().locator(".xaxis .xtick")).not.toHaveCount(0);
  for (const metric of [
    "RSS Feeds",
    "Success Rate",
    "Error Rate",
    "Avg Latency",
    "Open Alerts",
    "RSS Requests",
    "Active RSS Users",
    "Active RSS Clients",
    "Requests / RSS User",
    "Published Posts",
  ]) {
    await expect(dashboard.locator(".primary-kpi .label", { hasText: metric })).toHaveCount(1);
  }
  await expect
    .poll(async () => {
      const counts = await Promise.all(
        [
          "RSS requests over time",
          "Request latency over time",
          "Published posts over time",
          "RSS users over time",
        ].map((name) => dashboard.getByRole("img", { name }).locator(".barpair").count()),
      );
      return counts.every((count) => count > 0 && count === counts[0]);
    })
    .toBe(true);
  await expectDayLabels();
  await expect(page.getByText("Request log", { exact: true })).toBeVisible();
  await expect(page.getByLabel("RSS user").locator("option[value='ava-nguyen']")).toHaveCount(1);

  await page.getByRole("button", { name: "7d" }).click();
  await expectDayLabels();
  await page.getByRole("button", { name: "30d" }).click();
  await expectDayLabels();
  await expect
    .poll(async () => {
      const labels = await dashboard
        .getByRole("img", { name: "Request latency over time" })
        .locator(".barlabel")
        .allTextContents();
      return labels.length > 0 && labels.every((label) => /^\d[\d,]*$/.test(label));
    })
    .toBe(true);
  await expect(dashboard.locator(".xaxis .xtick").first()).toHaveCSS("overflow", "visible");

  await page.getByRole("button", { name: "24h" }).click();
  await page.locator("label", { hasText: "RSS user" }).locator("select").selectOption("ava-nguyen");
  await page
    .locator("label", { hasText: "Request result" })
    .locator("select")
    .selectOption("success");
  await page.locator("label", { hasText: "RSS client" }).locator("select").selectOption("browser");
  await page.locator("label", { hasText: "Rows per page" }).locator("select").selectOption("100");
  await expect(page.getByText(/matching requests/)).toBeVisible();

  const logPanel = page.getByRole("button", { name: /Request log/ });
  await logPanel.click();
  await expect(page.getByLabel("Rows per page")).toBeHidden();
  await logPanel.click();
  await expect(page.getByLabel("Rows per page")).toBeVisible();
  await expect(page.getByRole("img", { name: "RSS requests over time" })).toBeVisible();
  await page.getByRole("button", { name: "Operating resilience" }).click();
  await expect(page.getByText("Success Rate", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "RSS requests over time" })).toBeHidden();
  await page.getByRole("button", { name: "Expand all" }).click();
  await expect(page.getByRole("img", { name: "RSS requests over time" })).toBeVisible();
});
