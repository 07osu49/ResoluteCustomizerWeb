const { test, expect } = require('@playwright/test');

test('page opens and renders visible content', async ({ page }) => {
  const response = await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  expect(response, 'Expected a document response').not.toBeNull();
  expect(response.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  await expect.poll(async () => page.locator('body').innerText().then(s => s.trim().length)).toBeGreaterThan(0);
});

test('main page is usable at device width', async ({ page, isMobile }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  }));
  // Report unexpected sideways scrolling on narrow phones.
  if (isMobile) expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 8);
});
