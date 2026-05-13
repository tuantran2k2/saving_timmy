import { Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

/**
 * Authenticate by posting to /api/auth and setting the cookie directly.
 * This bypasses the UI lock screen so tests can focus on app functionality.
 */
export async function authenticate(page: Page) {
  // Post to auth API to get the cookie
  const response = await page.request.post(`${BASE_URL}/api/auth`, {
    data: { password: "200502" },
  });
  if (!response.ok()) {
    throw new Error(`Auth failed: ${response.status()}`);
  }

  // Set the cookie on the browser context
  await page.context().addCookies([
    {
      name: "app_unlocked",
      value: "1",
      domain: "localhost",
      path: "/",
    },
  ]);
}

/**
 * Clear the auth cookie to simulate a locked state.
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies();
}
