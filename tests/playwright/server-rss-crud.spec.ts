import { expect, test } from "@playwright/test";

const apiBase = "http://127.0.0.1:4000";

test("RSS server post can be created, read, updated and deleted", async ({ request }) => {
  const marker = `playwright-server-${Date.now()}`;
  let postId: number | null = null;
  try {
    const createdResponse = await request.post(`${apiBase}/api/posts`, {
      data: {
        title: `Playwright RSS post ${marker}`,
        body: "Created by the isolated Assessment 3 server use-case test.",
        authorId: "administrator",
        feedIds: ["cloud-devops"],
      },
    });
    expect(createdResponse.status()).toBe(201);
    const created = await createdResponse.json();
    postId = created.data.id;

    const readResponse = await request.get(`${apiBase}/api/posts/${postId}`);
    expect(readResponse.ok()).toBeTruthy();
    await expect(readResponse.json()).resolves.toMatchObject({
      success: true,
      data: { id: postId, title: `Playwright RSS post ${marker}` },
    });

    const updatedResponse = await request.patch(`${apiBase}/api/posts/${postId}`, {
      data: { title: `Updated Playwright RSS post ${marker}`, feedIds: ["cloud-devops"] },
    });
    expect(updatedResponse.ok()).toBeTruthy();
    await expect(updatedResponse.json()).resolves.toMatchObject({
      success: true,
      data: { title: `Updated Playwright RSS post ${marker}` },
    });

    const feedResponse = await request.get(`${apiBase}/rss/CLOUDDEVOPS`, {
      headers: { "X-Client-Id": "playwright-server-client", "X-Client-Source": "playwright" },
    });
    expect(feedResponse.ok()).toBeTruthy();
    expect(await feedResponse.text()).toContain(`Updated Playwright RSS post ${marker}`);

    const deletedResponse = await request.delete(`${apiBase}/api/posts/${postId}`);
    expect(deletedResponse.ok()).toBeTruthy();
    postId = null;
    expect((await request.get(`${apiBase}/api/posts/${created.data.id}`)).status()).toBe(404);
  } finally {
    if (postId) await request.delete(`${apiBase}/api/posts/${postId}`);
  }
});
