import { test, expect } from '@playwright/test';
import * as path from 'path';

test('Task 3 Public: Order history sorting and filtering works', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('[data-testid="email-input"]', { state: 'visible' });
  
  await page.getByTestId('email-input').fill('customer@public.com');
  await page.getByTestId('password-input').fill('PublicPass123!');
  await page.getByTestId('login-button').click();
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:5173/orders');
  
  const hasTable = await page.locator('[data-testid="order-table"]').isVisible().catch(() => false);
  const hasNoOrders = await page.locator('[data-testid="no-orders-message"]').isVisible().catch(() => false);

  if (hasNoOrders && !hasTable) {
    console.log('⚠️ No orders found. Ensure create_test_orders.py was run.');

    expect(hasTable, 'Orders table should be visible. Run seed/create scripts if empty.').toBeTruthy();
  }

  const orderTable = page.getByTestId('order-table');
  await expect(orderTable).toBeVisible();

  await expect(page.getByTestId('order-sort')).toBeVisible();
  await expect(page.getByTestId('order-direction')).toBeVisible();
  await expect(page.getByTestId('order-filter')).toBeVisible();

  const initialRows = page.getByTestId('order-row');
  const count = await initialRows.count();
  expect(count).toBeGreaterThan(0);

  await page.getByTestId('order-sort').selectOption('total_amount');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Allow render

  expect(await page.getByTestId('order-row').count()).toBe(count);

  await page.getByTestId('order-direction').selectOption('asc');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.getByTestId('order-filter').selectOption('completed');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const filteredRows = page.getByTestId('order-row');
  const filteredCount = await filteredRows.count();

  expect(filteredCount).toBeLessThanOrEqual(count);

  for (let i = 0; i < filteredCount; i++) {
    const statusBadge = filteredRows.nth(i).getByTestId('order-status');
    const text = await statusBadge.textContent();
    expect(text?.toLowerCase()).toContain('completed');
  }

  await page.getByTestId('order-filter').selectOption('');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  expect(await page.getByTestId('order-row').count()).toBe(count);

  const firstRow = page.getByTestId('order-row').first();
  await expect(firstRow.getByTestId('order-date')).toBeVisible();
  await expect(firstRow.getByTestId('order-status')).toBeVisible();
  await expect(firstRow.getByTestId('order-amount')).toBeVisible();
});