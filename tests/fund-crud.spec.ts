import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

const BASE_URL = "http://localhost:3000";

// Track fund IDs created during tests so we can clean up
const createdFundIds: string[] = [];

async function cleanupFunds(page: import("@playwright/test").Page) {
  for (const id of createdFundIds) {
    try {
      await page.request.delete(`${BASE_URL}/api/funds?id=${id}`);
    } catch {
      // ignore cleanup errors
    }
  }
  createdFundIds.length = 0;
}

test.describe("Fund CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupFunds(page);
  });

  test("create a new fund", async ({ page }) => {
    await page.goto(BASE_URL);

    // Open create modal
    await page.getByRole("button", { name: "Tạo quỹ" }).click();
    await expect(page.getByText("Tạo quỹ mới")).toBeVisible();

    // Fill in fund title
    const fundName = `Test Fund ${Date.now()}`;
    await page.getByPlaceholder("Ví dụ: Quỹ du lịch, Mua nhà...").fill(fundName);

    // Save
    await page.getByRole("button", { name: "Tạo quỹ" }).last().click();

    // Modal should close and new fund should appear in the list
    await expect(page.getByText("Tạo quỹ mới")).not.toBeVisible();
    await expect(page.getByText(fundName)).toBeVisible();

    // Capture the fund id from the API for cleanup
    const res = await page.request.get(`${BASE_URL}/api/funds`);
    const funds = await res.json();
    const created = funds.find((f: { title: string; id: string }) => f.title === fundName);
    if (created) createdFundIds.push(created.id);
  });

  test("edit a fund", async ({ page }) => {
    // Create a fund via API first
    const createRes = await page.request.post(`${BASE_URL}/api/funds`, {
      data: {
        title: `Edit Fund ${Date.now()}`,
        description: "original description",
        color: "#10b981",
        icon: "piggy",
        targetAmount: 0,
        deadline: "",
      },
    });
    const created = await createRes.json();
    createdFundIds.push(created.id);

    await page.goto(BASE_URL);

    // Hover over the fund card to reveal action buttons
    const fundCard = page.getByText(created.title).first();
    await fundCard.hover();

    // Click pencil (edit) button – it's inside the same card
    const card = page.locator(".group").filter({ hasText: created.title }).first();
    await card.hover();
    await card.getByRole("button").filter({ has: page.locator("svg") }).first().click();

    // Edit modal should open
    await expect(page.getByText("Chỉnh sửa quỹ")).toBeVisible();

    // Update title
    const newTitle = `Edited Fund ${Date.now()}`;
    await page.getByPlaceholder("Ví dụ: Quỹ du lịch, Mua nhà...").clear();
    await page.getByPlaceholder("Ví dụ: Quỹ du lịch, Mua nhà...").fill(newTitle);

    // Save
    await page.getByRole("button", { name: "Cập nhật" }).click();

    // Modal closes and updated title is shown
    await expect(page.getByText("Chỉnh sửa quỹ")).not.toBeVisible();
    await expect(page.getByText(newTitle)).toBeVisible();
  });

  test("delete a fund removes it from the list", async ({ page }) => {
    // Create a fund via API
    const createRes = await page.request.post(`${BASE_URL}/api/funds`, {
      data: {
        title: `Delete Fund ${Date.now()}`,
        description: "",
        color: "#ef4444",
        icon: "piggy",
        targetAmount: 0,
        deadline: "",
      },
    });
    const created = await createRes.json();
    // Don't add to createdFundIds – the test will delete it

    await page.goto(BASE_URL);

    // Hover card and click trash button
    const card = page.locator(".group").filter({ hasText: created.title }).first();
    await card.hover();

    // Accept the confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    // The trash button is the second action button in the card
    const actionButtons = card.locator("button", { has: page.locator("svg") });
    // Find the delete button (Trash2 icon – second button in the opacity-0 group)
    await actionButtons.last().click();

    // Fund should no longer be visible
    await expect(page.getByText(created.title)).not.toBeVisible({ timeout: 10000 });
  });
});
