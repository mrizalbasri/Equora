import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

for (const width of [390, 1440]) {
  test(`map guide follows the selected mode and remembers collapse at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await mockWorkspace(page);
    await page.goto('/explore');
    const guide = page.locator('.reading-guide');
    await expect(guide).toHaveAttribute('open', '');
    await expect(guide.getByRole('heading')).toHaveText('Baca warna bersama satuannya');
    await expect(guide).toContainText('persentase akses');
    await expect(guide).toContainText('Abu-abu bukan nol.');

    await page.getByRole('button', { name: 'Terhadap median', exact: true }).click();
    await expect(guide.getByRole('heading')).toHaveText('Bandingkan dengan titik tengah');
    await page.getByRole('button', { name: 'Kelengkapan data', exact: true }).click();
    await expect(guide).toContainText('Data lebih lengkap tidak berarti fasilitas sekolah lebih baik.');
    await guide.screenshot({ path: testInfo.outputPath(`map-guide-${width}.png`) });

    await guide.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(guide).not.toHaveAttribute('open');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('equora:map-reading-guide:v1'))).toBe('closed');
    await page.reload();
    await expect(guide).toBeVisible();
    await expect(guide).not.toHaveAttribute('open');
    await guide.locator('summary').click();
    await expect(guide.getByRole('heading')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
