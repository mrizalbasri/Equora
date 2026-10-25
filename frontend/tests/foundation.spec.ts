import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

test('built frontend serves landing HTML and a separate health route', async ({ request }) => {
  const root = await request.get('/');
  expect(root.ok()).toBeTruthy();
  expect(root.headers()['content-type']).toContain('text/html');
  expect(await root.text()).toContain('Beda wilayah.');
  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });
});

test('catalog exposes API source and unknown source errors', async ({ page }) => {
  await mockWorkspace(page);
  await page.goto('/datasets');
  await expect(page).toHaveTitle('Katalog dataset · Equora');
  await page.getByRole('link', { name: 'Sanitasi dasar', exact:true }).click();
  await expect(page.getByRole('heading', { name: 'Synthetic sanitation source' })).toBeVisible();
  await expect(page.getByText('synthetic_fixture_only', {exact:true})).toBeVisible();
  await page.goto('/datasets/does-not-exist');
  await expect(page.getByRole('alert')).toContainText('Dataset tidak ditemukan');
});

test('methodology page exposes documented sections and anchors', async ({ page }) => {
  await page.goto('/methodology');
  await expect(page).toHaveTitle('Metodologi — Equora');
  await expect(page.getByRole('heading', { name: 'Bagaimana Equora menjelaskan prioritas dan skenario.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Skor prioritas' })).toHaveAttribute('href', '#priority');
  await expect(page.getByRole('heading', { name: 'Missing tidak diam-diam diubah menjadi nol.' })).toBeVisible();
  await expect(page.getByText('Contoh sintetis · bukan data provinsi')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lewati ke konten utama' })).toHaveAttribute('href', '#main-content');
  await expect(page.getByRole('heading', { name: 'Optimal menurut model bukan bukti keadilan universal.' })).toBeVisible();
  await expect(page.getByText('Bukan keputusan anggaran resmi.').first()).toBeVisible();
});
