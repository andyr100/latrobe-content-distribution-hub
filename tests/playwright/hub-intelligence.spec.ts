import { expect, test } from "@playwright/test";

test("Hub Intelligence filters, paginates and collapses its detailed evidence", async ({ page, request }) => {
  await request.get("http://localhost:4000/rss/CLOUDDEVOPS", {
    headers: { "X-Client-Id": "hub-intelligence-playwright", "X-Rss-User-Id": "ava-nguyen" },
  });
  await page.goto("http://localhost:3000/hubintelligence");
  await page.getByRole("radio", { name: /Administrator Administrator/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("heading", { name: "Hub Intelligence" })).toBeVisible();
  await expect(page.getByText("Filterable request log", { exact: true })).toBeVisible();
  await expect(page.getByLabel("RSS user").locator("option[value='ava-nguyen']")).toHaveCount(1);

  await page.locator("label", { hasText: "Time" }).locator("select").selectOption("24h");
  await page.locator("label", { hasText: "RSS user" }).locator("select").selectOption("ava-nguyen");
  await page
    .locator("label", { hasText: "Request result" })
    .locator("select")
    .selectOption("success");
  await page.locator("label", { hasText: "Rows per page" }).locator("select").selectOption("100");
  await expect(page.getByText(/matching requests/)).toBeVisible();

  const logPanel = page.getByRole("button", { name: /Filterable request log/ });
  await logPanel.click();
  await expect(page.getByLabel("Rows per page")).toBeHidden();
  await logPanel.click();
  await expect(page.getByLabel("Rows per page")).toBeVisible();
  await expect(page.getByRole("img", { name: "RSS request activity" })).toBeVisible();
});
