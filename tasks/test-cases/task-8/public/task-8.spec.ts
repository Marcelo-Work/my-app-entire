import { test, expect } from '@playwright/test';

test('Task 8 Public: Async Email Notifications & Logging', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.getByTestId('email-input').fill('customer@public.com');
    await page.getByTestId('password-input').fill('PublicPass123!');

    const loginBtn = page.getByTestId('login-button');
    await expect(loginBtn).toBeVisible({ timeout: 10000 });
    await expect(loginBtn).toBeEnabled({ timeout: 10000 });
    await loginBtn.click();

    await page.waitForLoadState('networkidle');

    try {
        await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
    } catch (e) {
        try {
            await expect(page.locator('text=customer@public.com')).toBeVisible({ timeout: 5000 });
        } catch (e2) {
            try {
                await expect(page).not.toHaveURL(/\/login$/, { timeout: 5000 });
            } catch (e3) {
                const currentUrl = page.url();
                if (!currentUrl.includes('home') && !currentUrl.includes('dashboard')) {
                    console.log('❌ Login verification failed. Current URL:', currentUrl);
                    throw new Error('Login failed - user not authenticated');
                }
            }
        }
    }
    console.log('✅ Login verified');

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="product-card"]', { state: 'visible', timeout: 10000 });

    await page.getByTestId('product-card').getByTestId('view-Detail').first().click();
    await page.waitForURL(/\/product\?id=\d+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const addToCartBtn = page.getByTestId('add-to-cart-button');
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Handle alert
    page.on('dialog', async dialog => {
        await dialog.accept();
    });
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const emptyMsg = page.getByText('Your cart is empty');
    const isEmpty = await emptyMsg.isVisible().catch(() => false);
    if (isEmpty) {
        throw new Error('Cart is empty - add to cart failed');
    }

    const cartTotal = page.getByTestId('cart-total');
    await expect(cartTotal).toBeVisible({ timeout: 10000 });

    const startTime = Date.now();

    const checkoutBtn = page.locator('button:has-text("Checkout")').first();
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });

    page.on('dialog', async dialog => {
        console.log('Dialog:', dialog.message());
        await dialog.accept();
    });

    await checkoutBtn.click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('After checkout, URL is:', currentUrl);

    if (currentUrl.includes('/guest/checkout')) {
        console.log('❌ Redirected to guest checkout - order API likely failed');
        throw new Error('Order API failed - redirected to guest checkout');
    }

    try {
        await page.waitForURL(/order-confirmation/, { timeout: 15000 });
        console.log('✅ Navigated to order-confirmation via URL');
    } catch (e) {
        console.log('⚠️ URL wait failed, checking for order-confirmed element...');
        await expect(page.locator('[data-testid="order-confirmed"]').first()).toBeVisible({ timeout: 10000 });
    }

    await expect(page.getByTestId('order-confirmed')).toBeVisible({ timeout: 10000 });

    const orderTime = Date.now() - startTime;
    console.log(`✅ Order placed in ${orderTime}ms`);

    await page.goto('http://localhost:5173/email-logs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const emailLogEntry = page.locator('[data-testid="email-log-entry"]').first();
    await expect(emailLogEntry).toBeVisible({ timeout: 15000 });

    const logText = await emailLogEntry.textContent();
    expect(logText).toContain('customer@public.com');
    expect(logText).toContain('Order');
    expect(logText).toMatch(/Sent|Pending/);

    console.log('✅ Email log entry verified!');

    expect(orderTime).toBeLessThan(5000);

    console.log(`✅ Task 8 Public Test Passed!`);
    console.log(`   Order time: ${orderTime}ms`);
    console.log(`   Email log: Verified`);
});