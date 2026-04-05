import { test, expect } from '@playwright/test';

test('Task 4 Public: Contact support form validation and submission', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('http://localhost:5173/support');
  await page.waitForSelector('[data-testid="contact-name"]', { state: 'visible' });
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByTestId('field-error').first()).toBeVisible();
  const errorCount = await page.getByTestId('field-error').count();
  expect(errorCount).toBeGreaterThanOrEqual(4);
  await page.getByTestId('contact-name').fill('John Doe');
  await page.getByTestId('contact-email').fill('invalid-email');
  await page.getByTestId('contact-subject').fill('Help');
  await page.getByTestId('contact-message').fill('This is a long enough message to pass length validation.');
  
  await page.getByRole('button', { name: /send message/i }).click();
  const emailError = page.locator('[data-testid="contact-email"] + [data-testid="field-error"]');
  await expect(emailError).toBeVisible();
  expect(await emailError.textContent()).toContain('valid email');
  await page.getByTestId('contact-email').fill('john.doe@example.com');
  const msgLength = await page.getByTestId('contact-message').inputValue();
  expect(msgLength.length).toBeGreaterThanOrEqual(10);
  expect(msgLength.length).toBeLessThanOrEqual(500);

  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.getByTestId('submit-success')).toBeVisible({ timeout: 10000 });
  expect(await page.getByTestId('submit-success').textContent()).toContain('successfully');
  expect(await page.getByTestId('contact-name').inputValue()).toBe('');
  expect(await page.getByTestId('contact-email').inputValue()).toBe('');
  expect(await page.getByTestId('contact-subject').inputValue()).toBe('');
  expect(await page.getByTestId('contact-message').inputValue()).toBe('');
});