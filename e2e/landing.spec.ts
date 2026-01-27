import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('displays hero section with CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
  });

  test('displays features section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/upload/i)).toBeVisible();
    await expect(page.getByText(/chat/i)).toBeVisible();
    await expect(page.getByText(/flashcard/i)).toBeVisible();
  });

  test('Get Started button links to login', async ({ page }) => {
    await page.goto('/');

    const ctaButton = page.getByRole('link', { name: /get started/i }).first();
    await expect(ctaButton).toHaveAttribute('href', '/login');
  });
});
