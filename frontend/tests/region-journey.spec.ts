import { expect, test, type Page } from '@playwright/test';
import { mockWorkspace, sources, core } from './workspace-fixture';

async function mockProfiles(page: Page) {
  await mockWorkspace(page);
  await page.route('**/api/v1/regions/*?*', async (route) => {
    const url = new URL(route.request().url());
    const code = url.pathname.split('/').at(-1);
    if (!['11', '12'].includes(code ?? '')) return route.fulfill({ status: 404, json: { detail: 'Wilayah tidak ditemukan' } });
    const level = url.searchParams.get('education_level') ?? 'SD';
    return route.fulfill({ json: {
      code, name: `Provinsi Synthetic ${code === '11' ? 'Alpha' : 'Beta'}`,
      release_id: 'synthetic-release', status: 'local_review', academic_year: '2025/2026',
      ownership: 'Total', education_level: level,
      values: { ...Object.fromEntries(core.map((key) => [key, code === '11' ? '20' : '60'])), institutions_count: '10' },
      cells: Object.fromEntries(core.map((key) => [key, 'I5'])), sources, limitations: ['Synthetic tests only'],
    } });
  });
}

for (const width of [360, 390, 768, 1440]) {
  test(`public region journey, comparison, sharing and Studio at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await mockProfiles(page);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.getByRole('link', { name: 'Pendidikan di Daerah Saya', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Mulai dari satu provinsi', exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'Provinsi Anda', exact: true }).fill('Alpha');
    await page.getByRole('option', { name: 'Provinsi Synthetic Alpha', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Alpha' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Jenjang sekolah', exact: true }).selectOption('SMP');
    await page.getByText('Bandingkan dengan provinsi lain', { exact: false }).click();
    await page.getByRole('combobox', { name: 'Bandingkan dengan', exact: true }).fill('Beta');
    await page.getByRole('option', { name: 'Provinsi Synthetic Beta', exact: true }).click();
    const facility = page.getByRole('article', { name: 'Sanitasi dasar', exact: true });
    await expect(facility.getByText('40 poin persentase lebih rendah dari pembanding.')).toBeVisible();
    const source = facility.locator('.facility-source > summary');
    await source.focus();
    await page.keyboard.press('Enter');
    await expect(facility.getByRole('link', { name: 'Buka sumber asli' })).toHaveAttribute('href', 'https://example.org/synthetic');
    await page.getByText('Lihat jumlah sekolah dan konteks lainnya', { exact: true }).click();
    await page.getByText('Batas penggunaan data ini', { exact: true }).click();
    await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Unavailable')) } }));
    await page.reload();
    await page.getByRole('button', { name: 'Bagikan temuan', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Salin teks di bawah secara manual');
    const summary = page.getByRole('textbox', { name: 'Ringkasan dan tautan temuan', exact: true });
    await expect(summary).toHaveValue(/Sumber: https:\/\/example.org\/synthetic/);
    const text = await summary.inputValue();
    expect(text).toContain('Tautan lokal');
    const shared = text.split('\n').at(-1)!;
    expect(new URL(shared).searchParams.get('release')).toBe('synthetic-release');
    await page.goto(shared);
    await expect(page.getByRole('combobox', { name: 'Jenjang sekolah', exact: true })).toHaveValue('SMP');
    await expect(page.getByRole('combobox', { name: 'Bandingkan dengan', exact: true })).toHaveValue('Provinsi Synthetic Beta');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`region-${width}.png`), fullPage: true });
    await page.getByRole('link', { name: 'Coba prioritas fasilitas' }).click();
    await expect(page.getByRole('heading', { name: 'Studio simulasi', exact: true })).toBeVisible();
    await expect(page.getByLabel('Konteks dari profil wilayah')).toContainText('synthetic-release');
    await expect(page.locator('select').first()).toHaveValue('SMP');
    expect(errors).toEqual([]);
  });
}

test('missing release stays explicit and retry can recover without switching versions', async ({ page }) => {
  await mockProfiles(page);
  let unavailable = true;
  await page.route('**/api/v1/workspace?*', async (route) => {
    if (unavailable) return route.fulfill({ status: 404, json: { detail: 'Rilis tidak ditemukan' } });
    await route.fallback();
  });
  await page.goto('/daerah?province=11&release=synthetic-release');
  await expect(page.getByRole('alert')).toContainText('Rilis tidak ditemukan');
  await expect(page.getByRole('link', { name: 'Pilih dari rilis aktif' })).toHaveAttribute('href', '/daerah');
  unavailable = false;
  await page.getByRole('button', { name: 'Coba lagi' }).click();
  await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Alpha' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('release')).toBe('synthetic-release');
});

test('missing values and incompatible source periods are explained, and sharing can copy', async ({ page }) => {
  await mockProfiles(page);
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: () => Promise.resolve() },
  }));
  await page.route('**/api/v1/regions/12?*', async (route) => {
    await route.fulfill({ json: {
      code: '12', name: 'Provinsi Synthetic Beta', release_id: 'synthetic-release',
      status: 'local_review', academic_year: '2025/2026', ownership: 'Total', education_level: 'SD',
      values: { ...Object.fromEntries(core.map((key) => [key, null])), institutions_count: '0' },
      cells: {}, sources: sources.map((item) => ({ ...item, academic_year: '2024/2025' })), limitations: [],
    } });
  });
  await page.goto('/daerah?province=11&compare=12');
  const facility = page.getByRole('article', { name: 'Sanitasi dasar', exact: true });
  await expect(facility).toContainText('Periode, definisi, jenjang atau rilis tidak sepadan.');
  await expect(facility).toContainText('Pembanding: Tidak tersedia');
  await page.getByRole('button', { name: 'Bagikan temuan', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Ringkasan dan tautan berhasil disalin.');
});

test('late region response does not overwrite a newer selection', async ({ page }) => {
  await mockProfiles(page);
  let delayed = false;
  let releaseResponse: () => void = () => {};
  const barrier = new Promise<void>((resolve) => { releaseResponse = resolve; });
  await page.route('**/api/v1/regions/11?*', async (route) => {
    delayed = true;
    await barrier;
    await route.fallback();
  });
  await page.goto('/daerah');
  await page.getByRole('combobox', { name: 'Provinsi Anda', exact: true }).fill('Alpha');
  await page.getByRole('option', { name: 'Provinsi Synthetic Alpha', exact: true }).click();
  await expect.poll(() => delayed).toBe(true);
  await page.getByRole('combobox', { name: 'Provinsi Anda', exact: true }).fill('Beta');
  await page.getByRole('option', { name: 'Provinsi Synthetic Beta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Beta' })).toBeVisible();
  releaseResponse();
  await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Alpha' })).toHaveCount(0);
});

test('technical detail keeps its requested release when opening the public profile', async ({ page }) => {
  await mockProfiles(page);
  const requests: URL[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/regions/11?')) requests.push(new URL(request.url()));
  });
  await page.goto('/regions/11?level=SMP&release=synthetic-release');
  const publicLink = page.getByRole('link', { name: 'Pahami dan bandingkan kondisi wilayah' });
  await expect(publicLink).toHaveAttribute('href', '/daerah?province=11&level=SMP&release=synthetic-release');
  expect(requests.at(-1)?.searchParams.get('release_id')).toBe('synthetic-release');
  expect(requests.at(-1)?.searchParams.get('education_level')).toBe('SMP');
  await publicLink.click();
  await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Alpha' })).toBeVisible();
});

test('opening an unpinned profile records its resolved release in the URL', async ({ page }) => {
  await mockProfiles(page);
  await page.goto('/daerah?province=11&level=SMP');
  await expect(page).toHaveURL(/release=synthetic-release/);
  await expect(page.getByRole('heading', { name: 'Kondisi fasilitas di Provinsi Synthetic Alpha' })).toBeVisible();
});

test('unknown province remains explicit instead of showing another profile', async ({ page }) => {
  await mockProfiles(page);
  await page.goto('/daerah?province=99&release=synthetic-release');
  await expect(page.getByRole('alert')).toContainText('Wilayah tidak ditemukan');
  await expect(page.getByRole('heading', { name: /Kondisi fasilitas di/ })).toHaveCount(0);
  await expect(page).toHaveURL(/province=99&release=synthetic-release/);
});

test('Studio reloads the province scope for a new level using the same release', async ({ page }) => {
  await mockProfiles(page);
  let releaseResponse: () => void = () => {};
  const barrier = new Promise<void>((resolve) => { releaseResponse = resolve; });
  let requested = false;
  await page.route('**/api/v1/regions?*', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('education_level') !== 'SMP') return route.fallback();
    expect(url.searchParams.get('release_id')).toBe('synthetic-release');
    requested = true;
    await barrier;
    await route.fulfill({ json: [{ code: '12', name: 'Provinsi Synthetic Beta' }] });
  });
  await page.goto('/studio?level=SD&release=synthetic-release');
  const calculate = page.getByRole('button', { name: /Hitung/ });
  await expect(calculate).toBeEnabled();
  await page.getByRole('combobox', { name: 'Jenjang', exact: true }).selectOption('SMP');
  await expect.poll(() => requested).toBe(true);
  await expect(calculate).toBeDisabled();
  releaseResponse();
  await expect(page.locator('summary').filter({ hasText: '1 dari 1 terpilih' })).toBeVisible();
  await expect(calculate).toBeEnabled();
  await expect(page.getByLabel('Konteks dari profil wilayah')).toContainText('synthetic-release · Jenjang SMP');
  const calculation = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/v1/scenarios');
  await calculate.click();
  expect((await calculation).postDataJSON()).toMatchObject({
    release_id: 'synthetic-release', education_level: 'SMP', region_codes: ['12'],
  });
});
