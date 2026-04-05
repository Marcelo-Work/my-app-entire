import { test, expect } from '@playwright/test';

test('Task 2 Private: Avatar upload works for private user', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByTestId('email-input').fill('customer@private.com');
  await page.getByTestId('password-input').fill('CustomerPrivate123!');
  await page.getByTestId('login-button').click();
  await page.waitForLoadState('networkidle');
  await page.goto('http://localhost:5173/profile');
  await expect(page.getByText('My Profile')).toBeVisible({ timeout: 10000 });
  
  const avatarInput = page.getByTestId('avatar-input');
  await expect(avatarInput).toHaveCount(1);
  await expect(avatarInput).toHaveAttribute('type', 'file');
  await expect(avatarInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png,image/gif');
  
  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  await avatarInput.setInputFiles({
    name: 'test-avatar.png',
    mimeType: 'image/png',
    buffer: pngBuffer
  });
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await expect(page.getByText('Avatar uploaded successfully')).toBeVisible({ timeout: 10000 });
});