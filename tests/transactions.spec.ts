import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

const BASE_URL = "http://localhost:3000";

test.describe("Transactions", () => {
  let fundId: string;
  let fundTitle: string;

  test.beforeEach(async ({ page }) => {
    await authenticate(page);

    // Create a fresh fund for each test
    fundTitle = `Tx Fund ${Date.now()}`;
    const res = await page.request.post(`${BASE_URL}/api/funds`, {
      data: {
        title: fundTitle,
        description: "for transactions",
        color: "#3b82f6",
        icon: "wallet",
        targetAmount: 0,
        deadline: "",
      },
    });
    const fund = await res.json();
    fundId = fund.id;
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: delete the fund
    if (fundId) {
      await page.request.delete(`${BASE_URL}/api/funds?id=${fundId}`);
    }
  });

  test("add a deposit transaction to a fund", async ({ page }) => {
    await page.goto(`${BASE_URL}/fund/${fundId}`);

    // Wait for fund to load – should show the fund title
    await expect(page.getByText(fundTitle)).toBeVisible({ timeout: 10000 });

    // Click "Ghi chép" button
    await page.getByRole("button", { name: "Ghi chép" }).click();
    await expect(page.getByText("Thêm giao dịch")).toBeVisible();

    // Fill amount
    await page.getByPlaceholder("0").fill("100000");

    // Fill note
    await page.getByPlaceholder(/Ví dụ: Mua thuốc/).fill("Test deposit note");

    // Save
    await page.getByRole("button", { name: "Lưu giao dịch" }).click();

    // Modal should close
    await expect(page.getByText("Thêm giao dịch")).not.toBeVisible();

    // Fund should still be visible (not "not found")
    await expect(page.getByText(fundTitle)).toBeVisible({ timeout: 10000 });

    // Balance should reflect the transaction (match formatted VND in hero)
    await expect(page.getByText(/100\.000/).first()).toBeVisible();
  });

  test("fund remains accessible after adding a transaction (bug regression)", async ({ page }) => {
    // This test specifically guards against the "fund not found" bug
    await page.goto(`${BASE_URL}/fund/${fundId}`);
    await expect(page.getByText(fundTitle)).toBeVisible({ timeout: 10000 });

    // Add a transaction via API
    const txRes = await page.request.post(`${BASE_URL}/api/funds/${fundId}/transactions`, {
      data: {
        type: "deposit",
        amount: 500000,
        note: "API deposit",
        date: "2026-05-13",
        category: "monthly",
      },
    });
    expect(txRes.ok()).toBeTruthy();

    // Reload the fund page
    await page.reload();

    // Fund should still be accessible – NOT show "Không tìm thấy quỹ này"
    await expect(page.getByText("Không tìm thấy quỹ này")).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(fundTitle)).toBeVisible();
  });

  test("delete a transaction", async ({ page }) => {
    // Add a transaction via API first
    await page.request.post(`${BASE_URL}/api/funds/${fundId}/transactions`, {
      data: {
        type: "deposit",
        amount: 200000,
        note: "To be deleted",
        date: "2026-05-13",
        category: "bonus",
      },
    });

    await page.goto(`${BASE_URL}/fund/${fundId}`);
    await expect(page.getByText(fundTitle)).toBeVisible({ timeout: 10000 });

    // The transaction note should be visible
    await expect(page.getByText("To be deleted")).toBeVisible();

    // Accept confirm dialog for delete
    page.on("dialog", (dialog) => dialog.accept());

    // Hover the transaction row to make the delete button visible, then click it
    // TransactionList renders each transaction as a div.group with a hover-revealed Trash2 button
    const txRow = page.locator("div.group").filter({ hasText: "To be deleted" }).first();
    await txRow.hover();
    await txRow.getByRole("button").click();

    // Transaction should be removed
    await expect(page.getByText("To be deleted")).not.toBeVisible({ timeout: 10000 });
  });
});
