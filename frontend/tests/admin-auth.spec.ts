import { test, expect, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';
import { mockWorkspace } from './workspace-fixture';

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Token admin', { exact: true }).fill('valid-secret');
  await page.getByRole('button', { name: 'Masuk ke dashboard' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('direct admin URL redirects before dashboard HTML is served', async ({ page, request }) => {
  const response = await request.get('/admin', { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  expect(response.headers()['location']).toBe('/admin/login');
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.text()).not.toContain('Pusat Kendali Tata Kelola Data');
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Masuk sebagai admin' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pusat Kendali Tata Kelola Data' })).toHaveCount(0);
  await expect(page.getByText('Peran: Admin Data', { exact: true })).toHaveCount(0);
});

test('invalid login never opens dashboard or retains the token', async ({ page, context }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Token admin', { exact: true }).fill('invalid');
  await page.getByRole('button', { name: 'Masuk ke dashboard' }).click();
  await expect(page.getByRole('alert')).toContainText('Token admin tidak valid');
  await expect(page.getByLabel('Token admin', { exact: true })).toHaveValue('');
  expect((await context.cookies()).find(cookie => cookie.name === 'equora_admin_session')).toBeUndefined();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('valid login survives refresh, authorizes import, and logout closes dashboard', async ({ page, context }) => {
  await mockWorkspace(page);
  await login(page);
  const cookie = (await context.cookies()).find(item => item.name === 'equora_admin_session')!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Strict');
  expect(cookie.value).not.toContain('valid-secret');
  expect(cookie.expires).toBeGreaterThan(Date.now() / 1000 + 3500);
  expect(await page.evaluate(() => document.cookie)).not.toContain('equora_admin_session');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Keluar admin' })).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Navigasi admin', exact: true });
  await nav.getByRole('link', { name: 'Sinkronisasi & impor' }).click();
  await page.getByRole('button', { name: 'Periksa & impor snapshot' }).click();
  await expect(page.getByRole('status')).toContainText('Impor lokal berhasil diselesaikan!');
  await expect(page.getByRole('status')).toContainText('synthetic-release');
  await page.getByRole('button', { name: 'Keluar admin' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await context.cookies()).find(item => item.name === cookie.name)).toBeUndefined();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('forged and signed-but-expired cookies cannot open admin', async ({ page, context }) => {
  const payload = `1.${'a'.repeat(64)}`;
  const signature = createHmac('sha256', 'valid-secret').update('equora-admin-v1:' + payload).digest('hex');
  for (const value of ['true', payload + '.' + signature]) {
    await context.addCookies([{ name: 'equora_admin_session', value, url: 'http://127.0.0.1:4173' }]);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole('heading', { name: 'Masuk sebagai admin' })).toBeVisible();
  }
});

test('admin navigation is separate and keeps catalog and security views in the URL', async ({ page }) => {
  await mockWorkspace(page);
  await login(page);
  const nav = page.getByRole('navigation', { name: 'Navigasi admin', exact: true });
  await expect(nav.getByRole('link')).toHaveCount(4);
  await expect(page.getByRole('navigation', { name: 'Navigasi workspace', exact: true })).toHaveCount(0);
  for (const name of ['Explorer', 'Studio simulasi', 'Bandingkan']) {
    await expect(page.getByRole('link', { name, exact: true })).toHaveCount(0);
  }
  await nav.getByRole('link', { name: 'Katalog indikator' }).click();
  await expect(page).toHaveURL(/\/admin#catalog$/);
  await expect(page.getByRole('heading', { name: 'Daftar 10 Indikator Pendidikan Nasional Terverifikasi' })).toBeVisible();
  await page.reload();
  await expect(nav.getByRole('link', { name: 'Katalog indikator' })).toHaveAttribute('aria-current', 'location');
  await nav.getByRole('link', { name: 'Peran & keamanan' }).click();
  await expect(page.getByRole('heading', { name: 'Batasan Fitur Masyarakat Umum vs Pemerintah & Admin' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Daftar 10 Indikator Pendidikan Nasional Terverifikasi' })).toBeVisible();
  await nav.getByRole('link', { name: 'Sinkronisasi & impor' }).click();
  await expect(nav.getByRole('link', { name: 'Sinkronisasi & impor', exact: true })).toHaveAttribute('aria-current', 'location');
  await expect(page.getByRole('heading', { name: 'Periksa & Terbitkan Rilis Snapshot' })).toBeVisible();
  await page.getByRole('link', { name: 'Buka aplikasi publik' }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole('navigation', { name: 'Navigasi workspace', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navigasi admin', exact: true })).toHaveCount(0);
});

test('mobile admin menu supports navigation, keyboard dismissal, and logout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockWorkspace(page);
  await login(page);
  const menu = page.getByRole('button', { name: 'Menu admin', exact: true });
  const nav = page.getByRole('navigation', { name: 'Navigasi admin', exact: true });
  await expect(nav).toBeHidden();
  await menu.click();
  await expect(page.getByRole('button', { name: 'Tutup menu admin', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('link', { name: 'Equora, panel admin' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Keluar admin' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(menu).toBeFocused();
  await menu.click();
  await nav.getByRole('link', { name: 'Katalog indikator' }).click();
  await expect(nav).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Daftar 10 Indikator Pendidikan Nasional Terverifikasi' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await menu.click();
  await page.getByRole('button', { name: 'Keluar admin' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('expired session during import returns to login', async ({ page, context }) => {
  await mockWorkspace(page);
  await login(page);
  const nav = page.getByRole('navigation', { name: 'Navigasi admin', exact: true });
  await nav.getByRole('link', { name: 'Sinkronisasi & impor' }).click();
  await context.addCookies([{
    name: 'equora_admin_session', value: 'expired', url: 'http://127.0.0.1:4173',
  }]);
  await page.getByRole('button', { name: 'Periksa & impor snapshot' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('upstream auth failure never opens dashboard', async ({ page, context }) => {
  for (const value of ['backend-unavailable', 'invalid-response']) {
    await context.addCookies([{
      name: 'equora_admin_session', value, url: 'http://127.0.0.1:4173',
    }]);
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(503);
    await expect(page.getByRole('heading', { name: 'Pusat Kendali Tata Kelola Data' })).toHaveCount(0);
  }
});

test('direct import needs authentication and cross-origin login is rejected', async ({ request }) => {
  const response = await request.post('/api/v1/admin/import', {
    headers: { Origin: 'http://127.0.0.1:4173' }, data: {},
  });
  expect(response.status()).toBe(401);
  const loginResponse = await request.post('/admin/login', {
    headers: { Origin: 'https://evil.example' }, form: { token: 'valid-secret' },
  });
  expect(loginResponse.status()).toBe(403);
});

test('login works without JavaScript and rejects cross-origin logout', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://127.0.0.1:4173' });
  const page = await context.newPage();
  await login(page);
  const response = await context.request.post('/admin/logout', {
    headers: { Origin: 'https://evil.example' }, maxRedirects: 0,
  });
  expect(response.status()).toBe(403);
  await page.getByRole('button', { name: 'Keluar admin' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await context.close();
});
