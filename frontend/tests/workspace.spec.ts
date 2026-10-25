import { expect, test } from '@playwright/test';
import { mockWorkspace, snapshot } from './workspace-fixture';

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
      page.getByText('Tidak ada provinsi yang sesuai pencarian "No matching region".'),
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
      name: 'Hitung Alokasi & Simpan Snapshot',
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
      page.getByText('Solver: optimal', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Unduh Memo Kebijakan (PDF)' })).toHaveAttribute(
      'href',
      /\/pdf$/,
    );
    await expect(
      page.locator('caption').filter({ hasText: /baseline/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('table', { name: 'Perbandingan dengan baseline strategi alternatif' }).locator('.eq-badge').first(),
    ).toHaveClass(/eq-badge-success/);
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

test('scenario summary distinguishes coverage from fairness and does not invent allocation causes', async ({ page }) => {
  await mockWorkspace(page);
  const example = structuredClone({
    ...snapshot,
    priority: { ...snapshot.priority, excluded: {} },
  });
  example.parameters.budget_idr = 25;
  example.allocation.status = 'feasible';
  example.allocation.evaluation.budget_remaining_idr = 5;
  example.case.regions[0].capacity = 3;
  example.case.regions.push({ ...example.case.regions[0], region_code: '12', capacity: 1 });
  example.priority.ranked.push({ ...example.priority.ranked[0], region_code: '12', rank: 2 });
  await page.route('**/api/v1/scenarios/' + snapshot.id, route => route.fulfill({ json: example }));
  await page.goto('/scenarios/' + snapshot.id);
  const summary = page.locator('.executive-takeaway-card');
  await expect(summary).toContainText('Dari 2 provinsi yang masuk model, 1 menerima paket dan 1 belum menerima paket.');
  await expect(summary).toContainText('bukan bukti pemerataan antarsekolah');
  await expect(summary).not.toContainText('karena memiliki tingkat defisit fasilitas tertinggi');
  await expect(summary).not.toContainText('karena batas kapasitas serap daerah');
  await expect(summary).not.toContainText('efisiensi serapan');
  await expect(page.getByText('Solver: feasible', { exact: true })).toHaveClass(/eq-badge-success/);
});
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
  await page.getByLabel('Token otentikasi admin', { exact: true }).fill('invalid');
  await page.getByRole('button', { name: 'Periksa & impor snapshot' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'Token admin lokal diperlukan',
  );
  await expect(
    page.getByLabel('Token otentikasi admin', { exact: true }),
  ).toHaveValue('');
});

test('comparison load failure offers retry without claiming scenarios are empty', async ({ page }) => {
  await mockWorkspace(page);
  let calls = 0;
  await page.route('**/api/v1/scenarios', route => {
    calls++;
    return calls === 1
      ? route.fulfill({ status: 503, json: { detail: 'Daftar skenario belum tersedia' } })
      : route.fulfill({ json: [] });
  });
  await page.goto('/compare');
  await expect(page.getByRole('alert')).toContainText('Daftar skenario belum tersedia');
  await expect(page.getByRole('heading', { name: 'Perlu minimal dua skenario tersimpan' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Coba lagi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Perlu minimal dua skenario tersimpan' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('comparison reports coverage and clears stale results when selection changes', async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.route('**/api/v1/scenarios', (route) =>
    route.fulfill({
      json: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Synthetic left',
          created_at: '2026-10-21',
          status: 'optimal',
          release_id: 'synthetic-release',
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Synthetic right',
          created_at: '2026-10-21',
          status: 'optimal',
          release_id: 'synthetic-release',
        },
      ],
    }),
  );
  await page.goto('/compare');
  await page.getByRole('button', { name: 'Bandingkan', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Perubahan alokasi', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Bobot berbeda; objective tidak setara.', { exact: true }),
  ).toBeVisible();
  const coverage = page.locator('.coverage-box').first();
  await expect(coverage).toContainText('Skenario Awal');
  await expect(coverage.locator('.stat-coverage')).toHaveText(/1\s*\/\s*1 provinsi/);
  await expect(coverage).toContainText('Menerima 2 paket total.');
  await expect(coverage).toContainText('1 wilayah dikecualikan karena data tidak lengkap.');
  await page
    .getByRole('combobox', { name: 'Skenario awal', exact: true })
    .selectOption('22222222-2222-4222-8222-222222222222');
  await expect(
    page.getByRole('heading', { name: 'Perubahan alokasi', exact: true }),
  ).toHaveCount(0);
});

test('catalog search handles no matching sources', async ({ page }) => {
  await mockWorkspace(page);
  await page.goto('/datasets');
  await page
    .getByLabel('Cari judul atau penerbit', { exact: true })
    .fill('no matching source');
  await expect(
    page.getByText('Tidak ditemukan dataset dengan kata kunci "no matching source".', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Hapus filter', exact: true })
    .click();
  await expect(
    page.getByRole('link', { name: 'Sanitasi dasar', exact: true }),
  ).toBeVisible();
});

for (const width of [375, 768, 1024, 1440]) {
  test(`workspace navigation and review disclosure at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 900 });
    await mockWorkspace(page);
    await page.goto('/explore');
    await expect(
      page.getByRole('heading', { name: 'Explorer pendidikan', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Provinsi Synthetic Alpha',
        exact: true,
      }),
    ).toBeVisible();
    const navigation = page.getByRole('navigation', {
      name: 'Navigasi workspace',
      includeHidden: true,
    });
    if (width <= 900) {
      const menu = page.getByRole('button', { name: 'Menu', exact: true });
      await menu.focus();
      await page.keyboard.press('Enter');
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(
        page.getByRole('button', { name: 'Tutup menu', exact: true }),
      ).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(
        navigation.getByRole('link', { name: 'Daerah Saya', exact: true }),
      ).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(
        navigation.getByRole('link', { name: 'Explorer', exact: true }),
      ).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(navigation).not.toBeVisible();
    } else {
      await expect(
        navigation.getByRole('link', { name: 'Explorer', exact: true }),
      ).toHaveAttribute('aria-current', 'page');
      await navigation
        .getByRole('link', { name: 'Studio simulasi', exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: 'Studio simulasi', exact: true }),
      ).toBeVisible();
      await expect(
        navigation.getByRole('link', { name: 'Studio simulasi', exact: true }),
      ).toHaveAttribute('aria-current', 'page');
    }
    const context = page.locator('details.workspace-context');
    await context.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(context).toHaveAttribute('open', '');
    await expect(context).toContainText(
      'Lisensi redistribusi dan tanggal unduh pengguna belum diverifikasi',
    );
    await page.keyboard.press('Enter');
    await expect(context).not.toHaveAttribute('open', '');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`workspace-${width}.png`),
      fullPage: true,
    });
  });
}
