import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated user visiting /dashboard can see the guest workspace', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/guest preview is live/i)).toBeVisible();
  });

  test('unauthenticated user visiting /class/123 is redirected to /login', async ({ page }) => {
    await page.goto('/class/123');
    await expect(page).toHaveURL('/login');
  });

  test('login page shows Google and email auth options', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('guest is prompted to sign in before chatting', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /sign in to start chatting/i }).click();
    await expect(page.getByRole('heading', { name: /sign in to continue/i })).toBeVisible();
  });
});
