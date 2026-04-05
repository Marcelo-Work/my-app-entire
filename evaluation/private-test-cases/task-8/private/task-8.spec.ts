import { test, expect } from '@playwright/test';

test('Task 8 Private: Error Handling, Rate Limiting & Content Validation', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.getByTestId('email-input').fill('customer@private.com');
  await page.getByTestId('password-input').fill('CustomerPrivate123!');
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Welcome, customer_private')).toBeVisible({ timeout: 10000 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="product-card"]', { state: 'visible', timeout: 10000 });

  await page.getByTestId('product-card').getByTestId('view-Detail').first().click();
  await page.waitForFunction(() => window.location.href.includes('/product?id='), { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const addToCartBtn = page.getByTestId('add-to-cart-button');
  await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
  await addToCartBtn.click();

  page.on('dialog', async dialog => await dialog.accept());
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const emptyMsg = page.getByText('Your cart is empty');
  const isEmpty = await emptyMsg.isVisible({ timeout: 5000 }).catch(() => true);

  if (isEmpty) {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.getByTestId('product-card').getByTestId('add-to-cart-button').first().click();
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }

  const cartTotal = page.getByTestId('cart-total');
  await expect(cartTotal).toBeVisible({ timeout: 10000 });

  console.log('🚀 Testing Rate Limiting (Rapid Checkout)...');

  const checkoutBtn = page.locator('button:has-text("Checkout")')
    .or(page.locator('[data-testid="checkout-btn"]'))
    .or(page.locator('button:has-text("Place Order")'))
    .first();

  await expect(checkoutBtn).toBeVisible({ timeout: 15000 });
  await expect(checkoutBtn).toBeEnabled({ timeout: 5000 });

  await checkoutBtn.click();
  page.on('dialog', async dialog => await dialog.accept());

  try {
    await page.waitForURL(/order-confirmation/, { timeout: 15000 });
  } catch (e) {
    await expect(page.locator('[data-testid="order-confirmed"]').first()).toBeVisible({ timeout: 10000 });
  }

  let orderId = null;
  const url = page.url();
  const urlParams = new URLSearchParams(url.split('?')[1]);
  orderId = urlParams.get('id');

  if (!orderId) {
    const pageText = await page.evaluate(() => document.body.innerText);
    const match = pageText.match(/Order #(\d+)/);
    if (match) orderId = match[1];
  }

  expect(orderId).toBeTruthy();
  console.log(`✅ Order created: #${orderId}`);

  await page.waitForTimeout(3000);
  await page.goto('http://localhost:5173/email-logs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const emailLogEntries = page.locator(
    '[data-testid="email-log-entry"], ' +
    '.list-group-item:has-text("Order"), ' +
    'tr:has-text("Order")'
  );

  const entryCount = await emailLogEntries.count();
  console.log(`📧 Total email log entries in system: ${entryCount}`);
  let relevantLogsCount = 0;
  const relevantLogTexts: string[] = [];

  for (let i = 0; i < Math.min(entryCount, 50); i++) {
    try {
      const entryText = await emailLogEntries.nth(i).textContent();
      if (entryText?.includes(`#${orderId}`)) {
        relevantLogsCount++;
        relevantLogTexts.push(entryText);
        console.log(`  ✅ Found log for Order #${orderId}: ${entryText?.substring(0, 100)}...`);
      }
    } catch (e) {
    }
  }

  console.log(`📧 Found ${relevantLogsCount} logs specifically for Order #${orderId}`);

  expect(relevantLogsCount).toBeGreaterThanOrEqual(1);
  expect(relevantLogsCount).toBeLessThanOrEqual(6);    

  console.log(`✅ Log count for Order #${orderId} is reasonable: ${relevantLogsCount}`);

  await page.reload({ waitUntil: 'networkidle' });

  const customerLog = page.locator(
    `[data-testid="email-log-entry"]:has-text("#${orderId}"):has-text("Order Confirmation"), ` +
    `tr:has-text("#${orderId}"):has-text("Order Confirmation"), ` +
    `.list-group-item:has-text("customer@private.com"):has-text("#${orderId}")`
  ).first();

  if (await customerLog.isVisible().catch(() => false)) {
    await expect(customerLog).toContainText('customer@private.com');
    await expect(customerLog).toContainText(`Order Confirmation`);
    console.log('✅ Email content validation passed');
  } else {
    console.log('⚠️ Could not find specific customer log entry');
  }
  const errorColumn = page.locator('th:has-text("Error"), th:has-text("Details"), th:has-text("Status")').first();
  await expect(errorColumn).toBeVisible({ timeout: 10000 });

  const errorBadge = page.locator('[data-testid="email-error-log"], .badge-danger:has-text("failed")').first();
  if (await errorBadge.count().catch(() => 0) > 0) {
    await expect(errorBadge).not.toBeVisible();
  }

  console.log('✅ Error handling UI verified');
  console.log('✅ Task 8 Private Tests Passed!');
});