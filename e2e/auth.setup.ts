import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, context }) => {
  const response = await page.request.post('/api/auth/test-login', {
    data: {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    },
  });

  expect(response.ok()).toBeTruthy();

  await page.goto('/dashboard');
  await page.waitForURL(/\/(dashboard|class\/)/, { timeout: 15000 });

  await context.storageState({ path: authFile });
});
