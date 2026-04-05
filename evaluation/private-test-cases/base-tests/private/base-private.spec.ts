import { test, expect } from '@playwright/test';

test('Base Private: Health Check', async ({ request }) => {
  const response = await request.get('http://localhost:3000/health/');
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.status).toBe('healthy');
});

test('Base Private: Home Page Loads', async ({ page }) => {
  test.setTimeout(30000);
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/DigiMart/);
  await expect(page.getByText('Featured Products')).toBeVisible({ timeout: 10000 });
  const privateProductHeading = page
    .getByTestId('product-card')
    .getByRole('heading', { name: 'Private Wireless Headphones', exact: true });
  
  await expect(privateProductHeading).toBeVisible({ timeout: 10000 });
  
  const cards = page.getByTestId('product-card');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(2);
});

test('Base Private: Profile Page Loads for Authenticated Private User', async ({ page }) => {
  test.setTimeout(30000);
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.getByTestId('email-input').fill('customer@private.com');
  await page.getByTestId('password-input').fill('CustomerPrivate123!');

  const loginButton = page.getByTestId('login-button');
  await expect(loginButton).toBeVisible({ timeout: 5000 });
  await expect(loginButton).toBeEnabled({ timeout: 5000 });
  await loginButton.click();
  
});