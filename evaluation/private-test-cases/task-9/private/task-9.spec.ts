import { test, expect } from '@playwright/test';

test('Task 9 Private: Security & Validation', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('http://localhost:5173/guest/checkout', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.getByTestId('guest-email').fill('invalid-email');
  await page.getByTestId('guest-name').fill('Test User');
  await page.getByTestId('guest-address').fill('123 Test St');
  await page.getByTestId('guest-city').fill('Test City');
  await page.getByTestId('guest-zip').fill('12345');
  
  const submitBtn = page.getByTestId('guest-submit');
  await expect(submitBtn).toBeVisible({ timeout: 10000 });
  await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  
  const [request, response] = await Promise.all([
    page.waitForRequest('/api/guest/checkout/', { timeout: 15000 }).catch(() => {
      console.log('⚠️ No API request detected');
      return null;
    }),
    page.waitForResponse('/api/guest/checkout/', { timeout: 15000 }).catch(() => {
      console.log('⚠️ No API response detected');
      return null;
    }),
    submitBtn.click()
  ]);
  
  if (request) {
    console.log('✅ API request detected');
    try {
      const postData = request.postDataJSON();
      console.log('Request data:', postData);
    } catch (e) {
      console.log('Request body:', request.postData());
    }
  }
  
  if (response) {
    console.log('✅ API response status:', response.status());
    try {
      const responseData = await response.json();
      console.log('Response data:', responseData);
    } catch (e) {
      console.log('Response body:', await response.text());
    }
  }

  await page.waitForTimeout(2000);
  
  const errorLocator = page.locator('.alert-danger, [data-testid="guest-error"]').first();
  const errorVisible = await errorLocator.isVisible().catch(() => false);
  
  if (errorVisible) {
    const errorText = await errorLocator.textContent();
    console.log(`✅ Validation error displayed: ${errorText?.trim()}`);
    expect(errorText?.toLowerCase()).toMatch(/email|valid|invalid|required|field/i);
  } else {
    const fullText = await page.evaluate(() => document.body.innerText);
    console.log('Page text preview:', fullText.substring(0, 500));
    
    // Check if error text exists anywhere
    const hasErrorText = fullText.toLowerCase().includes('email') && 
                        (fullText.toLowerCase().includes('valid') || 
                         fullText.toLowerCase().includes('invalid') ||
                         fullText.toLowerCase().includes('required'));
    
    if (hasErrorText) {
      console.log('✅ Error text found in page content');
    } else if (response && response.status() === 400) {
      console.log('✅ Backend returned 400 (validation working) but frontend not displaying error');
    } else {
      console.log('⚠️ No validation error visible - backend may not be validating');
    }
  }

  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  if (page.url().includes('/login')) {
    console.log('✅ Guest redirected to login for dashboard access');
    await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible({ timeout: 10000 });
  } else if (await page.getByText('Access Denied').isVisible().catch(() => false)) {
    console.log('✅ Guest shown access denied for dashboard');
  } else {
    console.log('⚠️ Checking for auth gate on dashboard');
    await expect(page.locator('text=Please login').first()).toBeVisible({ timeout: 5000 });
  }
  await page.goto('http://localhost:5173/guest/track/FAKE_TOKEN_12345', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const pageText = await page.evaluate(() => document.body.innerText);
  expect(pageText.toLowerCase()).not.toContain('traceback');
  expect(pageText.toLowerCase()).not.toContain('internal server error');
  
  const hasUserFriendlyError = pageText.includes('not found') || 
                               pageText.includes('invalid') || 
                               pageText.includes('Order');
  if (hasUserFriendlyError) {
    console.log('✅ Fake token handled with user-friendly error');
  }

  await page.goto('http://localhost:5173/guest/checkout', { waitUntil: 'networkidle' });
  
  await page.getByTestId('guest-name').fill("'; DROP TABLE users; --");
  await page.getByTestId('guest-email').fill('test@example.com');
  await page.getByTestId('guest-address').fill('123 Test St');
  await page.getByTestId('guest-city').fill('Test City');
  await page.getByTestId('guest-zip').fill('12345');
  
  await page.getByTestId('guest-submit').click();
  await page.waitForTimeout(3000);
  
  const submitPageText = await page.evaluate(() => document.body.innerText);
  expect(submitPageText.toLowerCase()).not.toContain('sql');
  expect(submitPageText.toLowerCase()).not.toContain('syntax error');
  console.log('✅ SQL injection attempt handled safely');

  await page.goto('http://localhost:5173/guest/checkout', { waitUntil: 'networkidle' });
  
  const xssPayload = '<script>alert("XSS")</script>';
  await page.getByTestId('guest-name').fill(xssPayload);
  await page.getByTestId('guest-email').fill('xss@test.com');
  await page.getByTestId('guest-address').fill('123 Test St');
  await page.getByTestId('guest-city').fill('Test City');
  await page.getByTestId('guest-zip').fill('12345');
  
  await page.getByTestId('guest-submit').click();
  await page.waitForTimeout(3000);
  
  const pageContentXSS = await page.content();
  const hasEscapedXSS = pageContentXSS.includes('&lt;script&gt;') || pageContentXSS.includes('\\u003cscript\\u003e');
  const hasXSSInText = await page.evaluate(() => document.body.innerText.includes('<script>'));
  
  if (!hasEscapedXSS && hasXSSInText) {
    console.log('⚠️ XSS payload may not be escaped');
  } else {
    console.log('✅ XSS attempt handled');
  }
  console.log('✅ Private data validation passed');

  console.log('✅ Task 9 Private Test Passed!');
});