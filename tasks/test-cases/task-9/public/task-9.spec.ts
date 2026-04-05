import { test, expect } from '@playwright/test';
test('Task 9 Public: Guest Checkout Flow', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Add to Cart as Guest
    await page.goto('http://localhost:5173/');
    await page.locator('[data-testid="view-Detail"]').first().click();
    await page.waitForTimeout(1000);

    // 2. Go to Cart
    await page.locator('[data-testid="add-to-cart-button"]').first().click();

    // 3. Click Guest Checkout
    await page.locator('[data-testid="guest-checkout"], button:has-text("Guest")').click();

    // 4. Fill Form
    await page.fill('input[data-testid="guest-email"]', 'guest@test.com');
    await page.fill('input[type="text"]', 'Guest User');
    await page.fill('textarea', '123 Test St');
    await page.fill('input[placeholder="City"]', 'Test City');
    await page.fill('input[placeholder="ZIP"]', '12345');

    await page.locator('[data-testid="guest-form"] button[type="submit"]').click();

    // 5. Verify Success
    await page.waitForURL(/guest\/(success|track)/);

});