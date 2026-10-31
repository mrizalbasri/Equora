import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

test('public and workspace pages work without an account or authentication requests', async ({ page }) => {
  await mockWorkspace(page);
  const authRequests: string[] = [];
  page.on('request', request => {
    if (/clerk\.(accounts\.dev|com)|accounts\.dev/.test(new URL(request.url()).hostname)) {
      authRequests.push(request.url());
    }
  });
  for (const path of ['/', '/daerah', '/explore', '/studio', '/compare']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('a[href="/sign-in"], a[href="/sign-up"], a[href="/account"]')).toHaveCount(0);
  }
  expect(authRequests).toEqual([]);
});

test('retired account routes are unavailable even with an old session cookie', async ({ request }) => {
  const headerCases: Record<string, string>[] = [{}, { Cookie: '__session=obsolete-session' }];
  for (const path of ['/sign-in', '/sign-up', '/account']) {
    for (const headers of headerCases) {
      const response = await request.get(path, { maxRedirects: 0, headers });
      expect(response.status()).toBe(404);
      expect(response.headers().location).toBeUndefined();
    }
  }
});
