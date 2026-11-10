import type { Page } from '@playwright/test';
export const source = {
  source_id: 'sanitation_percent',
  title: 'Synthetic sanitation source',
  publisher: 'Synthetic test publisher',
  year: 2025,
  academic_year: '2025/2026',
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
export const insights = {
  release_id: 'synthetic-release',
  status: 'local_review',
  academic_year: '2025/2026',
  education_level: 'SD',
  ownership: 'Total',
  region: { code: '11', name: 'Provinsi Synthetic Alpha' },
  available_indicators: 4,
  total_indicators: 4,
  attention_source_id: core[0],
  strength_source_id: null,
  benchmarks: core.map((source_id) => ({
    source_id,
    value: '20',
    median: '40',
    delta_from_median: '-20',
    rank: 2,
    available_regions: 2,
    comparison: 'below',
    unavailable_reason: null,
  })),
  limitations: ['Synthetic tests only'],
};
export const mapInsights = {
  release_id: 'synthetic-release',
  status: 'local_review',
  academic_year: '2025/2026',
  education_level: 'SD',
  ownership: 'Total',
  indicator: {
    source_id: 'sanitation_percent',
    title: 'Synthetic sanitation source',
    unit: 'percent',
    definition: 'Synthetic definition for tests only',
  },
  median: '40',
  available_regions: 1,
  total_regions: 2,
  rows: [
    {
      code: '11',
      name: rows[0].name,
      value: '20',
      comparison: 'below',
      delta_from_median: '-20',
      rank: 1,
      available_indicators: 4,
      total_indicators: 4,
      completeness_ratio: '1',
      attention_source_id: 'sanitation_percent',
      unavailable_reason: null,
    },
    {
      code: '12',
      name: rows[1].name,
      value: null,
      comparison: 'unavailable',
      delta_from_median: null,
      rank: null,
      available_indicators: 2,
      total_indicators: 4,
      completeness_ratio: '0.5',
      attention_source_id: null,
      unavailable_reason: 'missing',
    },
  ],
  limitations: ['Synthetic tests only'],
};
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
  input_rows: rows.map((row) => ({
    code: row.code,
    name: row.name,
    values: {
      ...Object.fromEntries(core.map((key) => [key, row.source_value])),
      institutions_count: row.denominator,
    },
    cells: Object.fromEntries(core.map((key) => [key, row.source_cell])),
  })),
  case: {
    budget_idr: 30,
    priority_scale: 10000,
    cost_source_type: 'demo_assumption',
    regions: [
      {
        region_code: '11',
        cost_idr: 10,
        capacity: 2,
        minimum_packages: 0,
        priority_units: 8000,
      },
    ],
  },
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
    } else if (path === 'regions/insights-map') {
      const indicator =
        sources.find(
          (item) => item.source_id === url.searchParams.get('indicator'),
        ) ?? source;
      json = {
        ...mapInsights,
        education_level: url.searchParams.get('education_level') ?? 'SD',
        indicator,
      };
    } else if (/^regions\/[^/]+\/insights$/.test(path)) {
      const code = path.split('/')[1];
      json = {
        ...insights,
        education_level: url.searchParams.get('education_level') ?? 'SD',
        region: {
          code,
          name: rows.find((row) => row.code === code)?.name ?? `Synthetic ${code}`,
        },
      };
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
    else if (path === 'scenarios/compare')
      json = {
        objective_comparable: false,
        warnings: ['Bobot berbeda; objective tidak setara.'],
        budget_delta_idr: 10,
        left: snapshot,
        right: snapshot,
        coverage: {
          left: {
            eligible_regions: 1,
            receiving_regions: 1,
            total_packages: 2,
            excluded_regions: 1,
          },
          right: {
            eligible_regions: 1,
            receiving_regions: 1,
            total_packages: 2,
            excluded_regions: 1,
          },
        },
        rows: [
          {
            region_code: '11',
            left_packages: 1,
            right_packages: 2,
            delta: 1,
            left_rank: 1,
            right_rank: 1,
          },
        ],
      };
    else if (path.startsWith('scenarios/')) json = snapshot;
    else if (path === 'admin/import') {
      // Exercise the actual proxy and session checks against the test upstream.
      return route.continue();
    }
    else
      return route.fulfill({
        status: 404,
        json: { detail: 'Synthetic route not configured' },
      });
    return route.fulfill({ json });
  });
}
