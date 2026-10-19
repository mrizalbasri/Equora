import { expect, test } from '@playwright/test';

test('built frontend serves landing, about, and health routes', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Equora — Intelligence for Equitable Decisions/);
  await expect(page.getByRole('heading', { name: 'Dari data publik menuju keputusan yang lebih terukur.' })).toBeVisible();
  await expect(page.getByText('Explorer dan Studio segera tersedia')).toBeVisible();

  await page.getByRole('link', { name: 'Tentang', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page).toHaveTitle('Tentang Equora');
  await expect(page.getByRole('heading', { name: 'Membuat data pendidikan lebih mudah dipahami dan dipertanggungjawabkan.' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Equora beranda');

  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });
});

test('landing remains usable at a 360px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Dari data publik menuju keputusan yang lebih terukur.' })).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow-x', 'visible');
  await expect(page.getByRole('link', { name: 'Tentang', exact: true })).toHaveCount(0);
});
