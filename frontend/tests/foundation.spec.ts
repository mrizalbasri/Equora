import { expect, test } from '@playwright/test';

test('built frontend serves its foundation and health routes', async ({ request }) => {
  const root = await request.get('/');
  expect(root.ok()).toBeTruthy();
  expect(await root.json()).toEqual({
    service: 'Equora frontend', status: 'ok', stage: 'foundation'
  });
  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });
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
