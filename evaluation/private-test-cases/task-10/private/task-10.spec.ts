import { test, expect } from '@playwright/test';

test('Task 10 Public: Related Products & FBT', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  const firstProductCard = page.locator('[data-testid="view-Detail"]').first();
  await firstProductCard.click();
  await expect(page.locator('[data-testid="related-products"]')).toBeVisible({ timeout: 10000 });
  const productName = await page.locator('h1.display-4').textContent();
  const relatedCards = page.locator('[data-testid="related-products"] .card');
  const count = await relatedCards.count();
  
  expect(count).toBeGreaterThan(0); 

  for (let i = 0; i < count; i++) {
    const title = await relatedCards.nth(i).locator('.card-title').textContent();
    expect(title).not.toEqual(productName);
  }
  const firstRelatedTitle = await relatedCards.first().locator('.card-title').textContent();
  expect(firstRelatedTitle).toBeTruthy();

  const fbtSection = page.locator('[data-testid="frequently-bought-together"]');
  if (await fbtSection.isVisible()) {
    const fbtCount = await fbtSection.locator('.card').count();
    expect(fbtCount).toBeGreaterThan(0);
  }
  console.log('✅ Task 10 Public Test Passed!');
});