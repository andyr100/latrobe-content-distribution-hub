import { expect, test } from "@playwright/test";

const apiBase = "http://localhost:4000";

test("mock LMS loads a newly published post from its RSS feed", async ({ page, request }) => {
  const marker = `Playwright LMS item ${Date.now()}`;
  const createdResponse = await request.post(`${apiBase}/api/posts`, {
    data: {
      title: marker,
      body: "This item proves the browser client receives database-backed RSS content.",
      authorId: "administrator",
      feedIds: ["cloud-devops"],
    },
  });
  expect(createdResponse.status()).toBe(201);
  const created = await createdResponse.json();

  try {
    await page.addInitScript(() => {
      localStorage.setItem("latrobe-rss-client.id.v1", "playwright-browser-client");
    });
    await page.goto("/");
    await page.getByLabel("Mock user").selectOption("ava-nguyen");
    await expect(page.getByRole("heading", { name: "RSS Client — Mock LMS View" })).toBeVisible();
    await page.getByRole("combobox", { name: /Channel/ }).selectOption("CLOUDDEVOPS");
    await expect(page.getByRole("heading", { name: marker })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Client ID:/)).toHaveAttribute(
      "title",
      "rss-client-ava-nguyen-playwright-browser-client",
    );
  } finally {
    await request.delete(`${apiBase}/api/posts/${created.data.id}`);
  }
});
