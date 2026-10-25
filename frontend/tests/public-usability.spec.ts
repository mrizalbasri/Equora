import { expect, test } from '@playwright/test';
import { mockWorkspace, sources, core } from './workspace-fixture';

for (const width of [360, 1440]) {
  test(`main controls remain readable and easy to press at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWorkspace(page);
    for (const path of ['/', '/daerah', '/explore', '/studio', '/compare', '/datasets', '/methodology', '/about']) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
      const smallControls = await page.locator('main .eq-button, main select, main input:not([type=checkbox]):not([type=hidden]):not([type=range]), main textarea').evaluateAll((elements) =>
        elements.filter((element) => element.getClientRects().length).flatMap((element) => {
          const rect = element.getBoundingClientRect();
          return rect.height < 44 || rect.width < 44 ? [`${element.tagName}: ${Math.round(rect.width)} × ${Math.round(rect.height)}`] : [];
        }),
      );
      expect(smallControls, path).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
  });
}

test('public profile reveals comparison and source details only when requested', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await mockWorkspace(page);
  await page.route('**/api/v1/regions/11?*', (route) => route.fulfill({ json: {
    code: '11', name: 'Provinsi Synthetic Alpha', release_id: 'synthetic-release',
    status: 'local_review', academic_year: '2025/2026', ownership: 'Total', education_level: 'SD',
    values: { ...Object.fromEntries(core.map((key) => [key, '20'])), institutions_count: '10' },
    cells: {}, sources, limitations: ['Synthetic tests only'],
  } }));
  await page.goto('/daerah?province=11&release=synthetic-release');
  await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Alpha' })).toBeVisible();
  await expect(page.locator('.app-sidebar')).toHaveCount(0);
  const comparison = page.getByRole('combobox', { name: 'Bandingkan dengan', exact: true });
  await expect(comparison).toBeHidden();
  const toggle = page.locator('.comparison-picker > summary');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(comparison).toBeVisible();
  const facility = page.getByRole('article', { name: 'Sanitasi dasar', exact: true });
  await expect(facility.getByRole('link', { name: 'Buka sumber asli' })).toBeHidden();
  await facility.locator('.facility-source > summary').click();
  await expect(facility.getByRole('link', { name: 'Buka sumber asli' })).toBeVisible();
  await page.getByText('Bagaimana membaca persentase dan selisihnya?', { exact: true }).click();
  await expect(page.getByText(/20% berarti 20 dari setiap 100 sekolah/)).toBeVisible();
});

test('mobile workspace menu keeps keyboard focus inside until closed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockWorkspace(page);
  await page.goto('/studio');
  await expect(page.getByRole('button', { name: /Hitung/ })).toBeEnabled();
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  const sidebar = page.locator('#workspace-sidebar');
  const last = sidebar.locator('a[href]').last();
  await expect(last).toBeVisible();
  await last.focus();
  await expect(last).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sidebar.getByRole('link', { name: 'Equora, beranda' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.locator('.app-body')).not.toHaveAttribute('inert');
});
