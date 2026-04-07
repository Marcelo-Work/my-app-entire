import { test, expect } from '@playwright/test';

test('Task 7 Public: Vendor Dashboard CRUD', async ({ page }) => {
  test.setTimeout(150000);

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('email-input')).toBeVisible({ timeout: 10000 });
  
  await page.getByTestId('email-input').fill('vendor@public.com');
  await page.getByTestId('password-input').fill('VendorPass123!');
  
  const loginBtn = page.getByTestId('login-button');
  await expect(loginBtn).toBeVisible({ timeout: 10000 });
  await expect(loginBtn).toBeEnabled({ timeout: 10000 });
  await loginBtn.click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Allow UI to settle
  await page.goto('http://localhost:5173/vendor/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const titleInput = page.locator('input[data-testid="product-title-input"], input[placeholder*="title"], input[name="title"]').first();
  await expect(titleInput).toBeVisible({ timeout: 15000 });
  
  await titleInput.fill('Test Product Task7');
  await page.locator('textarea[placeholder*="description"], textarea[name="description"]').first().fill('Test description for Task 7 validation');
  await page.locator('input[type="number"], input[name="price"]').first().fill('99.99');
  await page.locator('input[placeholder*="http"], input[name="image"]').first().fill('https://example.com/test.jpg');
  const addBtn = page.locator('button:has-text("Add Product"), button:has-text("Create Product")').first();
  await expect(addBtn).toBeVisible({ timeout: 5000 });
  await addBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const productText = page.getByText('Test Product Task7').first();
  await expect(productText).toBeVisible({ timeout: 15000 });
  const editBtn = page.locator('button:has-text("Edit"), [data-testid="edit-product"]').filter({ hasText: /Edit/i }).first();
  const productCard = page.locator('*').filter({ has: page.getByText('Test Product Task7') }).first();
  const robustEditBtn = productCard.locator('button:has-text("Edit"), button[data-testid="edit-product"], i.fa-edit + button, .btn-edit').first();

  if (!(await robustEditBtn.isVisible())) {
      await expect(page.locator('button:has-text("Edit")').first()).toBeVisible({ timeout: 5000 });
      await page.locator('button:has-text("Edit")').first().click();
  } else {
      await expect(robustEditBtn).toBeVisible({ timeout: 5000 });
      await robustEditBtn.click();
  }
  
  await page.waitForTimeout(1000);
  const editTitleInput = page.locator('input[placeholder*="title"], input[name="title"]').first();
  await expect(editTitleInput).toBeVisible({ timeout: 5000 });
  await editTitleInput.fill('Edited Product Task7');
  
  const updateBtn = page.locator('button:has-text("Update"), button:has-text("Save")').first();
  await expect(updateBtn).toBeVisible({ timeout: 5000 });
  await updateBtn.click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await expect(page.getByText('Edited Product Task7').first()).toBeVisible({ timeout: 15000 });
  const editedProductCard = page.locator('*').filter({ has: page.getByText('Edited Product Task7') }).first();
  const robustDeleteBtn = editedProductCard.locator('button:has-text("Delete"), button[data-testid="delete-product"], .btn-delete').first();

  if (!(await robustDeleteBtn.isVisible())) {
      // Fallback
      await expect(page.locator('button:has-text("Delete")').first()).toBeVisible({ timeout: 5000 });
      
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await page.locator('button:has-text("Delete")').first().click();
  } else {
      await expect(robustDeleteBtn).toBeVisible({ timeout: 5000 });
      
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await robustDeleteBtn.click();
  }

  await page.waitForTimeout(1000);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Edited Product Task7').first()).not.toBeVisible({ timeout: 15000 });
  
  console.log('✅ Task 7 Public Test Passed!');
});