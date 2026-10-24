import { test, expect } from '@playwright/test';

test('account requires a server-verified Clerk session', async ({ request }) => {
  const anonymous = await request.get('/account', { maxRedirects: 0 });
  expect(anonymous.status()).toBe(303);
  expect(anonymous.headers().location).toBe('/sign-in');
  const forged = await request.get('/account', { maxRedirects: 0, headers: { Cookie: '__session=forged-session' } });
  expect(forged.status()).toBe(303);
  expect(forged.headers().location).toBe('/sign-in');
});

test('sign-in remains publicly available with a clear loading or configuration state', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Masuk ke Equora' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lanjut jelajahi data publik' })).toHaveAttribute('href', '/explore');
  await expect(page.getByRole('link', { name: 'Daftar', exact: true })).toHaveAttribute('href', '/sign-up');
});
