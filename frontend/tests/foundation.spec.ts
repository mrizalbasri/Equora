import { expect, test } from '@playwright/test';

test('built frontend serves landing HTML and a separate health route', async ({ request }) => {
  const root = await request.get('/');
  expect(root.ok()).toBeTruthy();
  expect(root.headers()['content-type']).toContain('text/html');
  expect(await root.text()).toContain('Beda wilayah,');
  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });
});

test('built frontend serves catalog, detail, and health routes', async ({ page, request }) => {
  await page.goto('/datasets');
  await expect(page).toHaveTitle('Katalog dataset — Equora');
  await expect(page.getByRole('heading', { name: 'Katalog dataset' })).toBeVisible();
  await expect(page.getByText('Fixture demo · belum terhubung API')).toBeVisible();

  await page.getByRole('link', { name: /Akses fasilitas sanitasi dasar/ }).click();
  await expect(page).toHaveURL(/\/datasets\/sanitasi-dasar-2025$/);
  await expect(page.getByRole('heading', { name: 'Akses fasilitas sanitasi dasar' })).toBeVisible();
  await expect(page.getByText('Belum diaudit').first()).toBeVisible();

  const notFound = await request.get('/datasets/does-not-exist');
  expect(notFound.status()).toBe(404);
});

test('catalog search exposes an empty state', async ({ page }) => {
  await page.goto('/datasets');
  await page.getByLabel('Cari judul atau penerbit').fill('tidak ada');
  await expect(page.getByRole('heading', { name: 'Belum ada dataset yang cocok.' })).toBeVisible();
  await page.getByRole('button', { name: 'Hapus pencarian' }).click();
  await expect(page.getByRole('heading', { name: 'Akses fasilitas sanitasi dasar' })).toBeVisible();
});

test('methodology page exposes documented sections and anchors', async ({ page }) => {
  await page.goto('/methodology');
  await expect(page).toHaveTitle('Metodologi — Equora');
  await expect(page.getByRole('heading', { name: 'Bagaimana Equora menjelaskan prioritas dan skenario.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Skor prioritas' })).toHaveAttribute('href', '#priority');
  await expect(page.getByRole('heading', { name: 'Missing tidak diam-diam diubah menjadi nol.' })).toBeVisible();
  await expect(page.getByText('Contoh sintetis · bukan data provinsi')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Optimal menurut model bukan bukti keadilan universal.' })).toBeVisible();
});
