import { test, expect } from '@playwright/test';

test('Task 7 Public: Vendor Dashboard CRUD', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.getByTestId('email-input').fill('vendor@public.com');
  await page.getByTestId('password-input').fill('VendorPass123!');
  
  const loginBtn = page.getByTestId('login-button');
  await expect(loginBtn).toBeVisible({ timeout: 10000 });
  await expect(loginBtn).toBeEnabled({ timeout: 10000 });
  await loginBtn.click();
  
  await page.waitForLoadState('networkidle');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.goto('http://localhost:5173/vendor/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('input[data-testid="product-title-input"]').first().fill('Test Product Task7');
  await page.locator('textarea').first().fill('Test description for Task 7 validation');
  await page.locator('input[type="number"]').first().fill('99.99');
  await page.locator('input[placeholder="https://..."]').first().fill('https://example.com/test.jpg');
  
  await page.locator('button:has-text("Add Product")').first().click();
  
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Test Product Task7')).toBeVisible({ timeout: 10000 });

  const editBtn = page.locator('button:has-text("Edit"), [data-testid="edit-product"]').first();
  await expect(editBtn).toBeVisible({ timeout: 5000 });
  await editBtn.click();
  
  await page.waitForTimeout(1000);

  await page.locator('input[placeholder="Enter product title"]').first().fill('Edited Product Task7');
  
  await page.locator('button:has-text("Update Product")').first().click();
  
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Edited Product Task7')).toBeVisible({ timeout: 10000 });

  const deleteBtn = page.locator('button:has-text("Delete"), [data-testid="delete-product"]').first();
  await expect(deleteBtn).toBeVisible({ timeout: 5000 });
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  
  await deleteBtn.click();
  await page.waitForTimeout(1000);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Edited Product Task7')).not.toBeVisible({ timeout: 10000 });
  
  console.log('✅ Task 7 Public Test Passed!');
});