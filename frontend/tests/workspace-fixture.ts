import type { Page } from '@playwright/test';
export const source = {
  source_id: 'sanitation_percent',
  title: 'Synthetic sanitation source',
  publisher: 'Synthetic test publisher',
  source_url: 'https://example.org/synthetic',
  sha256: 'a'.repeat(64),
  unit: 'percent',
  definition: 'Synthetic definition for tests only',
  license_status: 'synthetic_fixture_only',
  retrieved_at: null,
  storage_scale: 'percentage_points',
  quality: { SD: { numeric: 2, missing: 0 } },
};
export const core = [
  'sanitation_percent',
  'water_percent',
  'internet_percent',
  'computers_percent',
];
export const sources = core.map((key) => ({ ...source, source_id: key }));
export const rows = [
  {
    code: '11',
    name: 'Provinsi Synthetic Alpha',
    value: '20',
    source_value: '20',
    denominator: '10',
    source_cell: 'I5',
    status: 'available',
  },
  {
    code: '12',
    name: 'Provinsi Synthetic Beta',
    value: null,
    source_value: null,
    denominator: '20',
    source_cell: 'I6',
    status: 'missing',
  },
];
export const allocation = {
  status: 'optimal',
  allocations: { '11': 2 },
  evaluation: {
    budget_used_idr: 20,
    budget_remaining_idr: 10,
    objective_units: 16000,
  },
  model_version: 'synthetic-model',
  reason: null,
  solver_version: 'synthetic',
  best_bound_units: 16000,
  absolute_gap_units: 0,
  max_time_seconds: 5,
};
export const snapshot = {
  id: '11111111-1111-4111-8111-111111111111',
  release_id: 'synthetic-release',
  data_status: 'local_review',
  created_at: '2026-10-21T00:00:00Z',
  region_names: { '11': rows[0].name },
  parameters: {
    name: 'Synthetic saved scenario',
    education_level: 'SD',
    budget_idr: 30,
    cost_idr: 10,
    capacity: 2,
    minimum_packages: 0,
    weights: Object.fromEntries(core.map((key) => [key, '0.25'])),
  },
  priority: {
    method_version: 'synthetic-method',
    excluded: { '12': ['water_percent'] },
    ranked: [
      {
        region_code: '11',
        rank: 1,
        score: '0.8',
        contributions: { sanitation_percent: '0.2' },
      },
    ],
  },
  allocation,
  baselines: { equal: allocation, greedy: allocation },
  sources,
  limitations: ['Synthetic tests only'],
};
export async function mockWorkspace(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v1/', '');
    if (path === 'geometry')
      return route.fulfill({ status: 503, json: { detail: 'Test fallback' } });
    let json: unknown;
    if (path === 'workspace')
      json = {
        id: 'synthetic-release',
        status: 'local_review',
        academic_year: '2025/2026',
        education_levels: ['SD', 'SMP'],
        region_count: 2,
        core_indicators: core,
        sources,
        limitations: ['Synthetic tests only'],
      };
    else if (path === 'datasets') json = { items: sources };
    else if (path.startsWith('datasets/')) {
      const found = sources.find(
        (item) => item.source_id === path.split('/')[1],
      );
      if (!found)
        return route.fulfill({
          status: 404,
          json: { detail: 'Dataset tidak ditemukan' },
        });
      json = found;
    } else if (path === 'regions')
      json = rows.map(({ code, name }) => ({ code, name }));
    else if (path === 'observations')
      json = {
        release_id: 'synthetic-release',
        academic_year: '2025/2026',
        education_level: url.searchParams.get('education_level'),
        source:
          sources.find(
            (item) => item.source_id === url.searchParams.get('indicator'),
          ) ?? source,
        rows,
        limitations: [],
      };
    else if (path === 'scenarios' && route.request().method() === 'POST')
      json = snapshot;
    else if (path === 'scenarios')
      json = [
        {
          id: snapshot.id,
          name: snapshot.parameters.name,
          created_at: snapshot.created_at,
          status: 'optimal',
          release_id: snapshot.release_id,
        },
      ];
    else if (path === 'scenarios/compare') json = {
      objective_comparable: false, warnings: ['Bobot berbeda; objective tidak setara.'],
      budget_delta_idr: 10, coverage: {left:{eligible_regions:1,receiving_regions:1,total_packages:2,excluded_regions:1}, right:{eligible_regions:1,receiving_regions:1,total_packages:2,excluded_regions:1}},
      rows: [{region_code:'11',left_packages:1,right_packages:2,delta:1,left_rank:1,right_rank:1}]
    };
    else if (path.startsWith('scenarios/')) json = snapshot;
    else if (path === 'admin/import')
      return route.fulfill({
        status: 401,
        json: { detail: 'Token admin lokal diperlukan' },
      });
    else
      return route.fulfill({
        status: 404,
        json: { detail: 'Synthetic route not configured' },
      });
    return route.fulfill({ json });
  });
}
