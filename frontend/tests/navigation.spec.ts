import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`pages are discoverable from public navigation at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWorkspace(page);
    for (const entry of ['/', '/about', '/methodology']) {
      await page.goto(entry);
      if (width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
      const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
      await expect(nav.getByRole('link', { name: 'Jelajahi Data', exact: true })).toHaveAttribute('href', '/explore');
      await expect(nav.getByRole('link', { name: 'Cara Kerja', exact: true })).toHaveAttribute('href', '/methodology');
      await expect(nav.getByRole('link', { name: 'Dataset', exact: true })).toHaveAttribute('href', '/datasets');
      await expect(nav.getByRole('link', { name: 'Tentang', exact: true })).toHaveAttribute('href', '/about');
      await expect(nav.getByRole('link', { name: 'Mulai Eksplorasi', exact: true })).toHaveAttribute('href', '/explore');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`nav-${width}-${entry.replaceAll('/', '') || 'home'}.png`) });
    }
    await page.goto('/');
    if (width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('navigation', { name: 'Navigasi utama', exact: true }).getByRole('link', { name: 'Tentang', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    if (width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Navigasi utama', exact: true }).getByRole('link', { name: 'Tentang', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.locator('header').getByRole('link', { name: 'Equora, beranda', exact: true }).click();
    await expect(page).toHaveURL('/');
  });
}

test('mobile menu can be opened, closed with Escape, and navigated', async ({ page }) => {
  await mockWorkspace(page);
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
  await menu.click();
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav).not.toBeVisible();
  await menu.click();
  await nav.getByRole('link', { name: 'Jelajahi Data', exact: true }).click();
  await expect(page).toHaveURL(/\/explore(?:\?|$)/);
});
