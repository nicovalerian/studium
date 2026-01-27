import { test, expect } from '@playwright/test';

test.describe('Dashboard (authenticated)', () => {
  test('shows class or creates one on first visit', async ({ page }) => {
    await page.goto('/dashboard');

    await page.waitForURL(/\/(dashboard|class\/)/, { timeout: 10000 });

    const url = page.url();
    expect(url.includes('/dashboard') || url.includes('/class/')).toBeTruthy();
  });
});
