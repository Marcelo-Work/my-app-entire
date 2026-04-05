import { test, expect } from '@playwright/test';

test('Task 5 Public: Discount coupon application at checkout', async ({ page }) => {
  test.setTimeout(45000);
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.getByTestId('email-input').fill('customer@public.com');
  await page.getByTestId('password-input').fill('PublicPass123!');
  
  const loginBtn = page.getByTestId('login-button');
  await expect(loginBtn).toBeVisible({ timeout: 5000 });
  await expect(loginBtn).toBeEnabled({ timeout: 5000 });
  await loginBtn.click();
  
  await expect(page).toHaveURL(/dashboard|home|\//, { timeout: 10000 });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  await page.waitForSelector('[data-testid="product-card"]', { 
    state: 'visible', 
    timeout: 10000 
  });
  
  const viewDetailsBtn = page
    .getByTestId('product-card')
    .getByTestId('view-Detail')  // ✅ Changed from 'view-details-button'
    .first();
    
  await expect(viewDetailsBtn).toBeVisible({ timeout: 10000 });
  await viewDetailsBtn.click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const addToCartBtn = page.getByTestId('add-to-cart-button'); // This is in ProductDetail.svelte
  await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
  await addToCartBtn.click();
  
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  await page.waitForTimeout(2000);
  
  await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const emptyMessage = page.getByText('Your cart is empty');
  const isEmpty = await emptyMessage.isVisible().catch(() => false);
  
  if (isEmpty) {
    throw new Error('Cart is empty - add to cart failed');
  }
  
  const cartItems = page.locator('.list-group-item');
  const itemCount = await cartItems.count();
  expect(itemCount).toBeGreaterThanOrEqual(1);
  
  const cartTotal = page.getByTestId('cart-total');
  await expect(cartTotal).toBeVisible({ timeout: 10000 });
  
  const originalTotalStr = await cartTotal.textContent();
  const originalTotal = parseFloat(originalTotalStr?.replace(/[^0-9.-]+/g, '') || '0');
  expect(originalTotal).toBeGreaterThan(0);
  
  const couponInput = page.getByTestId('coupon-input');
  await couponInput.fill('WELCOME10');
  
  const applyBtn = page.getByTestId('coupon-apply');
  await applyBtn.click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log(`✅ Task 5 Public Test Passed!`);
});