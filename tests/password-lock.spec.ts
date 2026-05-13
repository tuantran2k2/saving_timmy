import { test, expect } from "@playwright/test";
import { authenticate, clearAuth } from "./helpers";

test.describe("Password lock screen", () => {
  test("redirects to /login when not authenticated", async ({ page }) => {
    // Ensure no auth cookie
    await clearAuth(page);
    await page.goto("http://localhost:3000/");
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Nhập mật khẩu để tiếp tục")).toBeVisible();
  });

  test("shows error on wrong password", async ({ page }) => {
    await clearAuth(page);
    await page.goto("http://localhost:3000/login");
    await page.getByPlaceholder("Mật khẩu").fill("wrongpassword");
    await page.getByRole("button", { name: "Mở khoá" }).click();
    await expect(page.getByText("Mật khẩu không đúng")).toBeVisible();
    // Should stay on login
    await expect(page).toHaveURL(/\/login/);
  });

  test("unlocks with correct password and redirects to home", async ({ page }) => {
    await clearAuth(page);
    await page.goto("http://localhost:3000/login");
    await page.getByPlaceholder("Mật khẩu").fill("200502");
    await page.getByRole("button", { name: "Mở khoá" }).click();
    // Should redirect to home
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByText("Heo Đất")).toBeVisible();
  });

  test("authenticated user can access home directly", async ({ page }) => {
    await authenticate(page);
    await page.goto("http://localhost:3000/");
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(page.getByText("Heo Đất")).toBeVisible();
  });
});
