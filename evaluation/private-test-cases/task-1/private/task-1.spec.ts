import { test, expect } from '@playwright/test';

test('Task 1 Private: Global Search finds private product', async ({ page }) => {
  test.setTimeout(45000);

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  const searchInput = page.getByTestId('search-input');
  await expect(searchInput).toBeVisible({ timeout: 10000 });
 
  const searchTerm = 'Private Gaming Mouse Pro';
  await searchInput.fill(searchTerm);
  
  await searchInput.press('Enter');
  
  await expect(page).toHaveURL(/q=Private/, { timeout: 10000 });
  
  await page.waitForSelector('[data-testid="product-card"]', { 
    state: 'visible', 
    timeout: 10000 
  });

  const privateProductHeading = page
    .getByTestId('product-card')
    .getByRole('heading', { name: searchTerm, exact: true });
  await expect(privateProductHeading).toBeVisible({ timeout: 10000 });

  const filteredCards = page.getByTestId('product-card');
  await expect(filteredCards).toHaveCount(1, { timeout: 10000 });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  const allCards = page.getByTestId('product-card');
  const cardCount = await allCards.count();

  expect(cardCount).toBeGreaterThanOrEqual(10);
  
  console.log(`✅ Task 1 Private Test Passed! Found ${cardCount} products`);
});