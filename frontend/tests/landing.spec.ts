import { expect, test } from '@playwright/test';

for (const width of [360, 768, 1440]) {
  test(`public pages and interactions at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page).toHaveTitle(/Equora/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByText('Explorer belum tersedia.')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Lewati ke konten utama' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    await page.getByRole('button', { name: 'Simulasi alokasi', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Studio skenario belum tersedia.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Simulasi alokasi', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('link', { name: 'Baca batas penggunaan simulasi' }).click();
    await expect(page).toHaveURL(/#metode$/);
    await page.getByRole('button', { name: 'Perbandingan akses', exact: true }).click();
    await expect(page.getByText('Explorer belum tersedia.')).toBeVisible();

    for (const label of ['Bagaimana data kosong diperlakukan?', 'Apa arti hasil alokasi?', 'Apakah semua skenario memiliki solusi?']) {
      const summary = page.getByText(label, { exact: true });
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(summary.locator('..')).toHaveAttribute('open', '');
      await page.keyboard.press('Enter');
      await expect(summary.locator('..')).not.toHaveAttribute('open', '');
    }
    await page.getByText('Bagaimana prioritas disusun?', { exact: true }).click();
    await expect(page.locator('details').first()).not.toHaveAttribute('open', '');
    await page.getByText('Bagaimana prioritas disusun?', { exact: true }).click();

    for (const label of ['Lihat alur perbandingan', 'Pahami cara simulasi']) {
      await page.getByRole('link', { name: label, exact: true }).click();
    }
    if (width < 768) {
      const menu = page.locator('button[aria-controls="public-navigation"]');
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
    }
    for (const label of ['Alur analisis', 'Sumber data', 'Metode & batasan']) {
      if (width < 768) await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click();
      const fragment = new URL(page.url()).hash;
      await expect(page.locator(fragment)).toBeVisible();
    }
    await expect(page.locator('a[href^="https://data.kemendikdasmen.go.id/"]')).toHaveCount(4);
    await expect(page.locator('a[href="/explore"], a[href="/studio"], a[href="/datasets"], a[href="/methodology"]')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true });

    if (width < 768) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('link', { name: 'Tentang Equora', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`about-${width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'Kenali alur analisis', exact: true }).click();
    await expect(page).toHaveURL(/\/#pratinjau$/);
    expect(errors).toEqual([]);
  });
}
