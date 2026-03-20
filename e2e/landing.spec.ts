import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('displays hero section with CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /start studying/i }).first()).toBeVisible();
  });

  test('displays features section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/upload source material/i)).toBeVisible();
    await expect(page.getByText(/grounded ai chat/i)).toBeVisible();
    await expect(page.getByText(/one-click flashcards/i)).toBeVisible();
  });

  test('Start studying button links to dashboard', async ({ page }) => {
    await page.goto('/');

    const ctaButton = page.getByRole('link', { name: /start studying/i }).first();
    await expect(ctaButton).toHaveAttribute('href', '/dashboard');
  });
});
