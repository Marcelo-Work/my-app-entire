import { test, expect } from '@playwright/test';

test('Task 7 Private: Role Based Access Control', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('http://localhost:5173/login');
  await page.getByTestId('email-input').fill('customer@public.com');
  await page.getByTestId('password-input').fill('PublicPass123!');
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');

  await page.goto('http://localhost:5173/vendor/dashboard');
  await expect(page.locator('text=Access Denied')).toBeVisible({ timeout: 10000 });

  const res = await page.request.get('http://localhost:3000/api/vendor/products/');
  expect(res.status()).toBe(403); // Or 401 depending on auth flow

});