import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`methodology tracks reading position and anchor navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/methodology');
    const toc = page.getByRole('complementary', { name: 'Daftar isi' });
    const current = toc.locator('[aria-current="location"]');
    await expect(current).toHaveText('Sumber dan kesiapan data');
    for (const [id, label] of [['priority', 'Skor prioritas'], ['missing', 'Missing dan coverage'], ['allocation', 'Alokasi sandbox'], ['glossary', 'Glosarium'], ['limits', 'Batasan'], ['sources', 'Sumber dan kesiapan data']]) {
      await page.locator(`#${id}`).evaluate((element) => element.scrollIntoView());
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(label);
      if (width > 860) {
        await expect(current).toBeInViewport();
        const bounds = await toc.boundingBox();
        expect(bounds!.y).toBeGreaterThanOrEqual(112);
        expect(bounds!.y).toBeLessThanOrEqual(129);
      }
    }
    if (width <= 860) await toc.scrollIntoViewIfNeeded();
    await toc.getByRole('link', { name: 'Skor prioritas', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#priority$/);
    await expect(current).toHaveText('Skor prioritas');
    const heading = await page.locator('#priority-title').boundingBox();
    expect(heading!.y).toBeGreaterThanOrEqual(88);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/methodology#glossary');
    await expect(current).toHaveText('Glosarium');
  });
}
