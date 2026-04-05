import { test, expect } from '@playwright/test';

test('Task 10 Public: Related Products & FBT', async ({ page }) => {
    test.setTimeout(90000);

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    await page.waitForSelector('[data-testid="product-card"]', {
        state: 'visible',
        timeout: 10000
    });

    const viewDetailsBtn = page
        .getByTestId('product-card')
        .getByTestId('view-Detail')  
        .first();

    await expect(viewDetailsBtn).toBeVisible({ timeout: 10000 });
    await viewDetailsBtn.click();

    await page.waitForFunction(
        () => window.location.href.includes('/product?id='),
        { timeout: 15000 }
    );

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const relatedSection = page.locator('[data-testid="related-products"]').first();
    await expect(relatedSection).toBeVisible({ timeout: 15000 });

    const productName = await page.locator('h1.display-4, h1:first-of-type').first().textContent();
    console.log(`Current product: ${productName?.trim()}`);

    const relatedCards = page.locator('[data-testid="related-products"] .card');
    const count = await relatedCards.count(); 

    console.log(`Found ${count} related products`);
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
        const title = await relatedCards.nth(i).locator('.card-title').textContent();
        if (title && productName) {
            expect(title.trim()).not.toEqual(productName.trim());
        }
    }
    const firstRelatedTitle = await page
        .locator('[data-testid="related-products"] .card-title')
        .first()
        .textContent();

    expect(firstRelatedTitle?.trim()).toBeTruthy();
    console.log(`First related: ${firstRelatedTitle?.trim()}`);
    const fbtSection = page.locator('[data-testid="frequently-bought-together"]').first();

    if (await fbtSection.isVisible().catch(() => false)) {
        const fbtCards = page.locator('[data-testid="frequently-bought-together"] .card');
        const fbtCount = await fbtCards.count();
        console.log(`Found ${fbtCount} FBT products`);
        expect(fbtCount).toBeGreaterThan(0);
    } else {
        console.log('⚠️ FBT section not visible (may need more seed data)');
    }
    console.log('✅ Task 10 Public Test Passed!');
});