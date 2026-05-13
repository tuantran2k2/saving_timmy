import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

const BASE_URL = "http://localhost:3000";

const createdFundIds: string[] = [];

async function cleanupFunds(page: import("@playwright/test").Page) {
  for (const id of createdFundIds) {
    try {
      await page.request.delete(`${BASE_URL}/api/funds?id=${id}`);
    } catch {
      // ignore
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
    await page.getByRole("button", { name: "Tạo quỹ" }).click();
    await expect(page.getByText("Tạo quỹ mới")).toBeVisible();

    const fundName = `Test Fund ${Date.now()}`;
    await page.getByPlaceholder("Ví dụ: Quỹ du lịch, Mua nhà...").fill(fundName);
    await page.getByRole("button", { name: "Tạo quỹ" }).last().click();

    await expect(page.getByText("Tạo quỹ mới")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: fundName })).toBeVisible();

    const res = await page.request.get(`${BASE_URL}/api/funds`);
    const funds = await res.json();
    const created = funds.find((f: { title: string; id: string }) => f.title === fundName);
    if (created) createdFundIds.push(created.id);
  });

  test("edit a fund", async ({ page }) => {
    const createRes = await page.request.post(`${BASE_URL}/api/funds`, {
      data: {
        title: `Edit Fund ${Date.now()}`,
        description: "original",
        color: "#10b981",
        icon: "piggy",
        targetAmount: 0,
        deadline: "",
      },
    });
    const created = await createRes.json();
    createdFundIds.push(created.id);

    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: created.title })).toBeVisible({ timeout: 10000 });

    const card = page.locator("div.overflow-hidden").filter({ hasText: created.title }).first();
    await card.hover();
    // Pencil button — first in the action div
    await card.getByTitle("Chỉnh sửa").click({ force: true });

    await expect(page.getByText("Chỉnh sửa quỹ")).toBeVisible();

    const newTitle = `Edited Fund ${Date.now()}`;
    await page.getByPlaceholder("Ví dụ: Quỹ du lịch, Mua nhà...").clear();
    await page.getByPlaceholder("Ví dụ: Quỹ du lịch, Mua nhà...").fill(newTitle);
    await page.getByRole("button", { name: "Cập nhật" }).click();

    await expect(page.getByText("Chỉnh sửa quỹ")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: newTitle })).toBeVisible();
  });

  test("delete a fund removes it from the list", async ({ page }) => {
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

    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: created.title })).toBeVisible({ timeout: 10000 });

    const card = page.locator("div.overflow-hidden").filter({ hasText: created.title }).first();
    await card.hover();

    page.on("dialog", (dialog) => dialog.accept());
    await card.getByTitle("Xóa").click({ force: true });

    await expect(page.getByRole("heading", { name: created.title })).not.toBeVisible({ timeout: 10000 });
  });
});
