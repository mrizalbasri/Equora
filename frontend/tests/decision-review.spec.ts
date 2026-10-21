import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { mockWorkspace, snapshot } from './workspace-fixture';

const summary = {
  eligible_regions: 1,
  excluded_regions: 1,
  receiving_regions: 1,
  total_packages: 2,
  budget_used_idr: 20,
  budget_remaining_idr: 10,
  objective_units: 16000,
};
const trial = {
  label: 'Pilihan asumsi Anda',
  budget_idr: 33,
  weights: snapshot.parameters.weights,
  objective_comparable: true,
  priority: snapshot.priority,
  case: snapshot.case,
  allocation: snapshot.allocation,
  summary,
  changes: [
    {
      region_code: '11',
      before_packages: 2,
      after_packages: 2,
      delta: 0,
      before_rank: 1,
      after_rank: 1,
    },
  ],
};
const review = {
  snapshot_id: snapshot.id,
  release_id: snapshot.release_id,
  review_version: 'synthetic-review',
  computed_at: '2026-10-22T00:00:00Z',
  changes: { budget_change_percent: 10 },
  original: summary,
  what_if: trial,
  coverage: { ...trial, label: 'Jangkauan wilayah terlebih dahulu' },
  coverage_status: 'optimal',
  sensitivity: [
    { ...trial, label: 'Anggaran -10%' },
    {
      ...trial,
      label: 'Bobot sanitation_percent +10% relatif',
      objective_comparable: false,
    },
  ],
  stability: [
    {
      region_code: '11',
      evaluated_trials: 2,
      same_packages_trials: 2,
      receiving_trials: 2,
      eligible_trials: 2,
      min_packages: 2,
      max_packages: 2,
      min_rank: 1,
      max_rank: 1,
    },
  ],
  limitations: ['Synthetic tests only'],
};

for (const width of [390, 1440]) {
  test(`decision review, evidence, and download at ${width}px`, async ({
    page,
  }, testInfo) => {
    await mockWorkspace(page);
    await page.route('**/scenarios/*/review', (route) =>
      route.fulfill({ json: review }),
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/scenarios/' + snapshot.id);
    await page
      .getByRole('link', { name: 'Uji keputusan & pemerataan', exact: true })
      .click();
    const request = page.waitForRequest('**/scenarios/*/review');
    await page
      .getByRole('button', { name: 'Jalankan uji keputusan', exact: true })
      .click();
    expect((await request).postDataJSON()).toEqual({
      budget_change_percent: 10,
      cost_change_percent: 0,
      weight_indicator: 'sanitation_percent',
      weight_change_percent: 0,
    });
    await expect(
      page.getByRole('heading', {
        name: 'Cek pemerataan antarprovinsi',
        exact: true,
      }),
    ).toBeVisible();
    await page.getByLabel('Telusuri perubahan per provinsi').selectOption('1');
    await expect(
      page
        .locator('caption')
        .filter({ hasText: 'Bobot Sanitasi dasar +10% relatif: perubahan' }),
    ).toBeVisible();
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Unduh bukti uji (JSON)' }).click();
    const downloaded = await downloadEvent;
    const artifact = JSON.parse(
      await readFile((await downloaded.path())!, 'utf8'),
    );
    expect(artifact.snapshot.id).toBe(snapshot.id);
    expect(artifact.review.snapshot_id).toBe(snapshot.id);
    await page
      .getByRole('link', { name: 'Telusur bukti', exact: true })
      .click();
    await expect(
      page.getByText('Peringkat 1 · Skor 0,8', { exact: true }),
    ).toBeVisible();
    const evidence = page.locator('#telusur-bukti');
    await evidence.getByText('Sel I5', { exact: true }).first().click();
    await expect(
      evidence
        .getByRole('link', { name: 'Synthetic sanitation source' })
        .first(),
    ).toHaveAttribute('href', 'https://example.org/synthetic');
    await evidence.getByLabel('Provinsi yang diperiksa').selectOption('12');
    await expect(
      evidence.getByText('Dikeluarkan dari peringkat', { exact: true }),
    ).toBeVisible();
    await evidence.getByLabel('Provinsi yang diperiksa').selectOption('');
    await page.getByLabel('Perubahan anggaran (%)').fill('20');
    await expect(
      page.getByRole('heading', {
        name: 'Cek pemerataan antarprovinsi',
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText(
        'Asumsi berubah. Jalankan ulang untuk melihat hasil yang sesuai.',
      ),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`decision-review-${width}.png`),
      fullPage: true,
    });
  });
}

test('review failure is retryable and keyboard can submit the form', async ({
  page,
}) => {
  await mockWorkspace(page);
  let fail = true;
  await page.route('**/scenarios/*/review', (route) =>
    fail
      ? route.fulfill({
          status: 503,
          json: { detail: 'Layanan uji belum tersedia' },
        })
      : route.fulfill({ json: review }),
  );
  await page.goto('/scenarios/' + snapshot.id);
  const submit = page.getByRole('button', {
    name: 'Jalankan uji keputusan',
    exact: true,
  });
  await submit.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText(
    'Layanan uji belum tersedia',
  );
  fail = false;
  await submit.click();
  await expect(
    page.getByRole('heading', {
      name: 'Cek pemerataan antarprovinsi',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('an older review response does not appear under a different snapshot', async ({
  page,
}) => {
  await mockWorkspace(page);
  let respond: (() => void) | undefined;
  await page.route('**/scenarios/*/review', async (route) => {
    await new Promise<void>((resolve) => {
      respond = resolve;
    });
    await route.fulfill({ json: review });
  });
  await page.goto('/scenarios/' + snapshot.id);
  await page.getByRole('button', { name: 'Jalankan uji keputusan' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Menghitung pilihan asumsi',
  );
  await page
    .getByRole('link', { name: 'Studio', exact: false })
    .first()
    .click();
  respond?.();
  await expect(
    page.getByRole('heading', { name: 'Studio simulasi', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: 'Cek pemerataan antarprovinsi',
      exact: true,
    }),
  ).toHaveCount(0);
});
