import { expect, test } from '@playwright/test';
import { mockWorkspace } from './workspace-fixture';

for (const width of [390, 1440]) {
  test(`explorer filters, missing values, source and map fallback at ${width}px`, async ({
    page,
  }, testInfo) => {
    await mockWorkspace(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/explore');
    await expect(
      page.getByRole('button', {
        name: 'Provinsi Synthetic Alpha',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText('Data tidak tersedia', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Peta tidak dapat ditampilkan pada perangkat ini.', {
        exact: false,
      }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Provinsi Synthetic Alpha', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Provinsi Synthetic Alpha' }),
    ).toBeVisible();
    await page.getByLabel('Cari provinsi').fill('Beta');
    await expect(
      page.getByRole('button', {
        name: 'Provinsi Synthetic Alpha',
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Unduh CSV hasil filter' }),
    ).toHaveAttribute('href', /q=Beta/);
    await page.getByLabel('Cari provinsi').fill('No matching region');
    await expect(
      page.getByText('Tidak ada provinsi yang sesuai pencarian.'),
    ).toBeVisible();
    await page.getByLabel('Cari provinsi').fill('');
    await page
      .getByRole('combobox', { name: 'Jenjang', exact: true })
      .selectOption('SMP');
    await expect(page.locator('caption')).toContainText('SMP');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`explorer-${width}.png`),
      fullPage: true,
    });
  });
  test(`studio validates weights and presents saved result at ${width}px`, async ({
    page,
  }, testInfo) => {
    await mockWorkspace(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/studio');
    const submit = page.getByRole('button', {
      name: 'Hitung & simpan snapshot',
    });
    await expect(submit).toBeEnabled();
    await page.getByLabel('Sanitasi dasar (%)', { exact: true }).fill('30');
    await expect(submit).toBeDisabled();
    await page.getByLabel('Sanitasi dasar (%)', { exact: true }).fill('25');
    await submit.click();
    await expect(
      page.getByRole('heading', { name: 'Synthetic saved scenario' }),
    ).toBeVisible();
    await expect(
      page.getByText('optimal', { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Unduh PDF' })).toHaveAttribute(
      'href',
      /\/pdf$/,
    );
    await expect(
      page.locator('caption').filter({ hasText: 'Baseline' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`studio-${width}.png`),
      fullPage: true,
    });
  });
}
test('explorer API failure is explicit and retryable', async ({ page }) => {
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({
      status: 503,
      json: { detail: 'API lokal belum tersedia' },
    }),
  );
  await page.goto('/explore');
  await expect(page.getByRole('alert')).toContainText(
    'API lokal belum tersedia',
  );
  await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
});
test('admin rejects an invalid token and clears the input', async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto('/admin');
  await page.getByLabel('Token admin lokal', { exact: true }).fill('invalid');
  await page.getByRole('button', { name: 'Periksa & impor snapshot' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Token admin lokal diperlukan',
  );
  await expect(
    page.getByLabel('Token admin lokal', { exact: true }),
  ).toHaveValue('');
});

test('comparison reports coverage and clears stale results when selection changes', async ({page}) => {
  await mockWorkspace(page);
  await page.route('**/api/v1/scenarios',route => route.fulfill({json:[
    {id:'11111111-1111-4111-8111-111111111111',name:'Synthetic left',created_at:'2026-10-21',status:'optimal',release_id:'synthetic-release'},
    {id:'22222222-2222-4222-8222-222222222222',name:'Synthetic right',created_at:'2026-10-21',status:'optimal',release_id:'synthetic-release'}
  ]}));
  await page.goto('/compare'); await page.getByRole('button',{name:'Bandingkan',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Perubahan alokasi',exact:true})).toBeVisible();
  await expect(page.getByText('Bobot berbeda; objective tidak setara.',{exact:true})).toBeVisible();
  await expect(page.getByText(/1 dari 1 wilayah layak menerima paket/).first()).toBeVisible();
  await page.getByRole('combobox',{name:'Skenario awal',exact:true}).selectOption('22222222-2222-4222-8222-222222222222');
  await expect(page.getByRole('heading',{name:'Perubahan alokasi',exact:true})).toHaveCount(0);
});

test('catalog search handles no matching sources', async ({page}) => {
  await mockWorkspace(page); await page.goto('/datasets');
  await page.getByLabel('Cari judul atau penerbit',{exact:true}).fill('no matching source');
  await expect(page.getByText('Belum ada dataset yang cocok.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Hapus pencarian',exact:true}).click();
  await expect(page.getByRole('link',{name:'Sanitasi dasar',exact:true})).toBeVisible();
});
