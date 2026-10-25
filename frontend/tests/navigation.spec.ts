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
      await expect(nav.getByRole('link', { name: 'Tentang', exact: true })).toHaveAttribute('href', '/about');
      await expect(nav.getByRole('link', { name: 'Daerah Saya', exact: true })).toHaveAttribute('href', '/daerah');
      for (const [group, destinations] of [
        ['Eksplorasi', [['Pendidikan di Daerah Saya', '/daerah'], ['Peta & Data Pendidikan', '/explore'], ['Katalog Dataset', '/datasets']]],
        ['Simulasi', [['Studio Simulasi', '/studio'], ['Bandingkan Skenario', '/compare'], ['Metodologi', '/methodology']]],
      ] as const) {
        const trigger = nav.getByRole('button', { name: group, exact: true });
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        for (const [label, href] of destinations) {
          const link = nav.getByRole('link', { name: new RegExp(`^${label}`) });
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href', href);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`${group}-${width}-${entry.replaceAll('/', '') || 'home'}.png`) });
        await page.keyboard.press('Tab');
        await expect(nav.getByRole('link', { name: new RegExp(`^${destinations[0][0]}`) })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await nav.getByRole('button', { name: 'Simulasi', exact: true }).click();
      await nav.getByRole('link', { name: /^Studio Simulasi/ }).click();
      await expect(page.getByRole('heading', { name: 'Studio simulasi', exact: true })).toBeVisible();
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

test('dropdowns close on outside interaction and mobile menu can be reopened', async ({ page }) => {
  await mockWorkspace(page);
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
  const explore = nav.getByRole('button', { name: 'Eksplorasi', exact: true });
  const simulation = nav.getByRole('button', { name: 'Simulasi', exact: true });
  await explore.click();
  await simulation.click();
  await expect(explore).toHaveAttribute('aria-expanded', 'false');
  await page.locator('body').click({ position: { x: 4, y: 4 } });
  await expect(simulation).toHaveAttribute('aria-expanded', 'false');
  await explore.click();
  await page.locator('footer a').first().focus();
  await expect(explore).toHaveAttribute('aria-expanded', 'false');

  await page.setViewportSize({ width: 390, height: 800 });
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.click();
  await explore.click();
  await page.getByRole('button', { name: 'Tutup menu', exact: true }).click();
  await expect(nav).not.toBeVisible();
  await menu.click();
  await expect(explore).toHaveAttribute('aria-expanded', 'false');
  await nav.getByRole('link', { name: 'Daerah Saya', exact: true }).click();
  await expect(page).toHaveURL(/\/daerah(?:\?|$)/);
});
