import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

const geometry = {
  type: 'FeatureCollection',
  attribution: 'Synthetic geometry for browser tests only',
  features: [{
    type: 'Feature',
    properties: { code: '11', name: 'Provinsi Synthetic Alpha' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[110, -8], [130, -8], [130, 4], [110, 4], [110, -8]]],
    },
  }],
};

test('PMTiles is served with partial content and a valid archive header', async ({ request }) => {
  const response = await request.get('/maps/indonesia.pmtiles', {
    headers: { Range: 'bytes=0-126' },
  });
  expect(response.status()).toBe(206);
  expect(response.headers()['content-range']).toMatch(/^bytes 0-126\/\d+$/);
  const header = await response.body();
  expect(header.length).toBe(127);
  expect(header.subarray(0, 7).toString()).toBe('PMTiles');
});

for (const width of [360, 1440]) {
  test(`basemap renders and keeps province selection at ${width}px`, async ({ page }, testInfo) => {
    await mockWorkspace(page);
    await page.route('**/api/v1/geometry', route => route.fulfill({ json: geometry }));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/explore');
    const map = page.getByRole('img', { name: /Peta sebaran indikator/ });
    await expect(page.getByText('Basemap OpenStreetMap · Protomaps · zoom hingga 7.')).toBeVisible();
    await expect(map).toHaveAttribute('aria-busy', 'false');
    await expect(map.locator('canvas')).toBeVisible();
    if (!await map.getByRole('link', { name: 'OpenStreetMap contributors' }).isVisible()) {
      await map.locator('.maplibregl-ctrl-attrib-button').click();
    }
    await expect(map.getByRole('link', { name: 'OpenStreetMap contributors' })).toBeVisible();
    await map.click({ position: { x: (await map.boundingBox())!.width / 2, y: 160 } });
    await expect(page.getByRole('heading', { name: 'Provinsi Synthetic Alpha' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await map.screenshot({ path: testInfo.outputPath(`basemap-${width}.png`) });
  });
}

test('basemap failure preserves the interactive province layer and table', async ({ page }) => {
  await mockWorkspace(page);
  await page.route('**/api/v1/geometry', route => route.fulfill({ json: geometry }));
  await page.route('**/maps/indonesia.pmtiles', route => route.abort());
  await page.goto('/explore');
  await expect(page.getByText('Basemap gagal dimuat. Layer indikator dan tabel tetap tersedia.')).toBeVisible();
  const map = page.getByRole('img', { name: /Peta sebaran indikator/ });
  await expect(map).toBeVisible();
  await expect(map).toHaveAttribute('aria-busy', 'false');
  await map.click({ position: { x: (await map.boundingBox())!.width / 2, y: 160 } });
  await expect(page.getByRole('heading', { name: 'Provinsi Synthetic Alpha' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Provinsi Synthetic Alpha', exact: true })).toBeVisible();
  await page.unroute('**/maps/indonesia.pmtiles');
  await page.getByRole('button', { name: 'Coba lagi basemap' }).click();
  await expect(page.getByText('Basemap OpenStreetMap · Protomaps · zoom hingga 7.')).toBeVisible();
});
