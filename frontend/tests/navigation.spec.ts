import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

for (const width of [390, 1024, 1440]) {
  test(`pages are discoverable from public navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWorkspace(page);
    for (const entry of ['/', '/about', '/methodology']) {
      await page.goto(entry);
      if (width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
      const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
      for (const [label, href] of [
        ['Explorer', '/explore'], ['Studio simulasi', '/studio'],
        ['Perbandingan', '/compare'], ['Katalog dataset', '/datasets'],
        ['Metodologi', '/methodology'], ['Tentang Equora', '/about'],
      ]) {
        await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
        await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await nav.getByRole('link', { name: 'Studio simulasi', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Studio simulasi', exact: true })).toBeVisible();
    }
    await page.goto('/');
    const guide = page.getByRole('region', { name: 'Mulai menggunakan Equora' });
    await guide.getByRole('link', { name: 'Buka skenario tersimpan' }).click();
    await expect(page).toHaveURL(/\/studio#skenario-tersimpan$/);
    await expect(page.getByRole('heading', { name: 'Skenario tersimpan', exact: true })).toBeInViewport();
    await expect(page.getByRole('link', { name: 'Synthetic saved scenario', exact: true })).toBeVisible();
    await page.getByText('Panduan alur dan halaman', { exact: true }).click();
    await page.getByRole('region', { name: 'Mulai menggunakan Equora' }).getByRole('link', { name: 'Bandingkan hasil' }).click();
    await expect(page).toHaveURL(/\/compare$/);
  });
}
