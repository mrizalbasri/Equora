import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`public pages and interactions at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockWorkspace(page);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Beda wilayah.Beda kebutuhan.');
    await expect(page.getByRole('main')).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Lewati ke konten utama' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    const hero = page.locator('.hero-actions');
    await expect(hero.getByRole('link', { name: 'Pendidikan di Daerah Saya' })).toHaveAttribute('href', '/daerah');
    await hero.getByRole('link', { name: 'Pendidikan di Daerah Saya' }).click();
    await expect(page.getByRole('heading', { name: 'Pendidikan di Daerah Saya', exact: true })).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('img', { name: /Ilustrasi sekolah/ })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Pilih mode pratinjau antarmuka' })).toHaveCount(0);
    await expect(page.getByText('78.4%', { exact: true })).toHaveCount(0);
    await expect(page.getByText('94.8%', { exact: true })).toHaveCount(0);

    for (const [name, destination] of [
      ['Lihat kondisi daerah', '/daerah'],
      ['Atur simulasi', '/studio'],
      ['Bandingkan skenario', '/compare'],
    ] as const) {
      await page.locator('.workflow-list').getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${destination}(?:\\?|$)`));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.goto('/');
    }

    for (const label of ['Bagaimana data kosong diperlakukan?', 'Apa arti hasil alokasi?', 'Apakah semua skenario memiliki solusi?']) {
      const summary = page.getByText(label, { exact: true });
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(summary.locator('..')).toHaveAttribute('open', '');
      await page.keyboard.press('Enter');
      await expect(summary.locator('..')).not.toHaveAttribute('open', '');
    }
    const firstSummary = page.getByText('Bagaimana prioritas disusun?', { exact: true });
    await firstSummary.click();
    await expect(firstSummary.locator('..')).not.toHaveAttribute('open', '');
    await firstSummary.click();
    await expect(firstSummary.locator('..')).toHaveAttribute('open', '');
    await page.locator('#sumber').scrollIntoViewIfNeeded();
    await expect(page.locator('#sumber a[href^="https://data.kemendikdasmen.go.id/"]')).toHaveCount(4);
    await expect(page.getByText('Data lokal berstatus review.', { exact: false })).toBeVisible();
    await expect(page.getByText('Simulasi berbasis data dan asumsi. Bukan keputusan anggaran resmi.')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true });

    await page.locator('footer').getByRole('link', { name: 'Katalog dataset', exact: true }).click();
    await expect(page).toHaveURL(/\/datasets$/);
    await page.goto('/');
    await page.locator('#metode').getByRole('link', { name: 'Baca metodologi', exact: true }).click();
    await expect(page).toHaveURL(/\/methodology$/);
    await page.getByRole('link', { name: 'Kembali ke beranda', exact: true }).click();
    if (width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const nav = page.getByRole('navigation', { name: 'Navigasi utama', exact: true });
    await nav.getByRole('link', { name: 'Tentang', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    if (width < 1024) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(nav.getByRole('link', { name: 'Tentang', exact: true })).toHaveAttribute('aria-current', 'page');
    if (width < 1024) await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'Kenali alur analisis', exact: true }).click();
    await expect(page).toHaveURL(/\/#pratinjau$/);
    expect(errors).toEqual([]);
  });
}
