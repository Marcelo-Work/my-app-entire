import { test, expect } from '@playwright/test';

test('Task 6 Private: Review validation, purchase check, and average calculation', async ({ page }) => {
  test.setTimeout(150000);

  await page.context().clearCookies();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByTestId('product-card').getByTestId('view-Detail').first().click();
  await page.waitForFunction(() => window.location.href.includes('/product?id='), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await expect(page.locator('[data-testid="review-section"]')).toBeVisible({ timeout: 15000 });

  const loginPrompt = page.locator('[data-testid="login-prompt"]')
    .or(page.locator('.alert-warning').filter({ hasText: /login/i }))
    .or(page.getByText('Please login to write a review').first());

  await expect(loginPrompt).toBeVisible({ timeout: 20000 });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.getByTestId('email-input').fill('admin@private.com');
  await page.getByTestId('password-input').fill('AdminPrivate123!');
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/dashboard|home|\//, { timeout: 10000 });

  await expect(page.locator('text=Welcome, admin_private')).toBeVisible({ timeout: 10000 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.getByTestId('product-card').getByTestId('view-Detail').first().click();
  await page.waitForFunction(() => window.location.href.includes('/product?id='), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await expect(page.locator('[data-testid="review-section"]')).toBeVisible({ timeout: 15000 });
  const reviewForm = page.locator('[data-testid="review-form"]')
    .or(page.locator('.card').filter({ has: page.locator('button:has-text("Submit Review")') }))
    .or(page.locator('form:has(textarea)'));

  await expect(reviewForm.first()).toBeVisible({ timeout: 15000 });
  console.log('✅ Review form visible');
  const adminStars = page.locator('[data-testid="star-rating"]').first();
  await expect(adminStars).toBeVisible({ timeout: 10000 });
  const fifthStar = adminStars.locator('[data-testid="star-5"]')
    .or(adminStars.locator('span:nth-child(5)'))
    .or(adminStars.locator('[role="radio"]:nth-child(5)'))
    .first();

  await expect(fifthStar).toBeVisible({ timeout: 10000 });
  await fifthStar.click();

  const textarea = page.locator('[data-testid="review-comment"]')
    .or(page.locator('textarea').first());
  await expect(textarea.first()).toBeVisible({ timeout: 10000 });
  await textarea.first().fill('I am an admin testing this.');
  const submitBtn = page.locator('[data-testid="review-submit"]')
    .or(page.locator('button:has-text("Submit Review")'))
    .or(page.locator('button[type="submit"]'));
  await expect(submitBtn.first()).toBeVisible({ timeout: 10000 });
  await submitBtn.first().click();

  page.on('dialog', async dialog => await dialog.accept());
  const errorAlert = page.locator('[data-testid="review-error"]')
    .or(page.locator('.alert-danger'))
    .or(page.getByText(/purchased/i).first());

  await expect(errorAlert.first()).toBeVisible({ timeout: 15000 });

  const errorText = await errorAlert.first().textContent();
  console.log(`✅ Purchase validation: ${errorText?.trim()}`);

  await page.waitForTimeout(1000);
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
  await page.getByTestId('email-input').fill('customer@private.com');
  await page.getByTestId('password-input').fill('CustomerPrivate123!');
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/dashboard|home|\//, { timeout: 10000 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.getByTestId('product-card').getByTestId('view-Detail').first().click();
  await page.waitForFunction(() => window.location.href.includes('/product?id='), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await expect(page.locator('[data-testid="review-section"]')).toBeVisible({ timeout: 15000 });

  await expect(reviewForm.first()).toBeVisible({ timeout: 15000 });

  const custStars = page.locator('[data-testid="star-rating"]').first();
  await expect(custStars).toBeVisible({ timeout: 10000 });

  const custFifthStar = custStars.locator('[data-testid="star-5"]')
    .or(custStars.locator('span:nth-child(5)'))
    .first();
  await expect(custFifthStar).toBeVisible({ timeout: 10000 });
  await custFifthStar.click();

  await textarea.first().fill('Perfect product! Giving it 5 stars.');
  await submitBtn.first().click();
  const avgRating = page.locator('[data-testid="average-rating"]').first();
  await expect(avgRating).toBeVisible({ timeout: 10000 });
  const avgText = await avgRating.textContent();
  console.log(`Average rating: ${avgText?.trim()}`);
  expect(avgText).toMatch(/\d/);

  console.log('✅ Task 6 Private Test Passed!');
});