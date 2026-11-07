import { describe, expect, it } from 'vitest';
import type { Observation, RegionMapInsights, Snapshot } from '$lib/api/workspace';
import { buildPriorityMapView, buildScenarioMapView } from './priority-map';

const observations: Observation[] = [
  {
    code: '11',
    name: 'Provinsi Alpha',
    value: '20',
    source_value: '20',
    denominator: '10',
    source_cell: 'I5',
    status: 'available',
  },
  {
    code: '12',
    name: 'Provinsi Beta',
    value: '60',
    source_value: '60',
    denominator: '20',
    source_cell: 'I6',
    status: 'available',
  },
  {
    code: '13',
    name: 'Provinsi Gamma',
    value: null,
    source_value: null,
    denominator: '10',
    source_cell: 'I7',
    status: 'missing',
  },
];

const insights = {
  release_id: 'synthetic-release',
  status: 'local_review',
  academic_year: '2025/2026',
  education_level: 'SD',
  ownership: 'Total',
  indicator: {
    source_id: 'sanitation_percent',
    title: 'Sanitasi dasar',
    unit: 'percent',
    definition: 'Synthetic only',
  },
  median: '40',
  available_regions: 2,
  total_regions: 3,
  rows: [
    {
      code: '11',
      name: 'Provinsi Alpha',
      value: '20',
      comparison: 'below',
      delta_from_median: '-20',
      rank: 2,
      available_indicators: 4,
      total_indicators: 4,
      completeness_ratio: '1',
      attention_source_id: 'sanitation_percent',
      unavailable_reason: null,
    },
    {
      code: '12',
      name: 'Provinsi Beta',
      value: '60',
      comparison: 'above',
      delta_from_median: '20',
      rank: 1,
      available_indicators: 2,
      total_indicators: 4,
      completeness_ratio: '0.5',
      attention_source_id: null,
      unavailable_reason: null,
    },
    {
      code: '13',
      name: 'Provinsi Gamma',
      value: null,
      comparison: 'unavailable',
      delta_from_median: null,
      rank: null,
      available_indicators: 0,
      total_indicators: 4,
      completeness_ratio: '0',
      attention_source_id: null,
      unavailable_reason: 'missing',
    },
  ],
  limitations: ['Synthetic only'],
} satisfies RegionMapInsights;

describe('buildPriorityMapView', () => {
  it('uses the fixed percent scale and keeps missing values distinct', () => {
    const result = buildPriorityMapView(observations, true, 'value', insights);

    expect(result.available).toBe(true);
    expect(result.rows[0]).toMatchObject({
      code: '11',
      fill: '#b4d1e8',
      tooltip: 'Provinsi Alpha · 20%',
    });
    expect(result.rows[2]).toMatchObject({
      fill: '#d8dce0',
      tooltip: 'Provinsi Gamma · Data tidak tersedia / di luar filter',
    });
    expect(result.legend.description).toContain('0–100%');
  });

  it('presents relative direction without turning it into a policy score', () => {
    const result = buildPriorityMapView(observations, true, 'median', insights);

    expect(result.available).toBe(true);
    expect(result.rows[0].fill).toBe('#d97706');
    expect(result.rows[0].tooltip).toBe(
      'Provinsi Alpha · 20 poin persentase di bawah median',
    );
    expect(result.rows[1].fill).toBe('#2563a6');
    expect(result.rows[1].tooltip).toBe(
      'Provinsi Beta · 20 poin persentase di atas median',
    );
    expect(result.legend.items.map((item) => item.label)).toEqual([
      'Di bawah median',
      'Setara median',
      'Di atas median',
      'Tidak tersedia',
    ]);
  });

  it('shows comparable indicator coverage without a danger scale', () => {
    const result = buildPriorityMapView(
      observations,
      true,
      'completeness',
      insights,
    );

    expect(result.rows[0].fill).toBe('#2f6f73');
    expect(result.rows[0].tooltip).toBe(
      'Provinsi Alpha · 4 dari 4 indikator dapat dibandingkan',
    );
    expect(result.rows[1].fill).toBe('#9fc6c4');
    expect(result.rows[2].fill).toBe('#eef5f5');
    expect(result.legend.description).toContain('kelengkapan indikator');
  });

  it('disables the median mode for a non-percent indicator', () => {
    const nonPercent: RegionMapInsights = structuredClone(insights);
    nonPercent.indicator.unit = 'school_count';
    nonPercent.median = null;

    const result = buildPriorityMapView(observations, false, 'median', nonPercent);

    expect(result.available).toBe(false);
    expect(result.unavailableReason).toBe(
      'Perbandingan median hanya tersedia untuk indikator akses persentase.',
    );
  });
});

const scenarioFixture = {
  id: '11111111-1111-4111-8111-111111111111',
  release_id: 'synthetic-release',
  data_status: 'local_review',
  created_at: '2026-10-21T00:00:00Z',
  region_names: { '11': 'Provinsi Alpha' },
  input_rows: [
    {
      code: '11',
      name: 'Provinsi Alpha',
      values: { sanitation_percent: '20', institutions_count: '10' },
      cells: { sanitation_percent: 'I5' },
    },
    {
      code: '12',
      name: 'Provinsi Beta',
      values: { sanitation_percent: '60', institutions_count: '20' },
      cells: { sanitation_percent: 'I6' },
    },
    {
      code: '13',
      name: 'Provinsi Gamma',
      values: { sanitation_percent: null, institutions_count: '10' },
      cells: { sanitation_percent: 'I7' },
    },
  ],
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
      {
        region_code: '12',
        cost_idr: 10,
        capacity: 2,
        minimum_packages: 0,
        priority_units: 4000,
      },
    ],
  },
  parameters: {
    name: 'Synthetic scenario',
    education_level: 'SD',
    budget_idr: 30,
    cost_idr: 10,
    capacity: 2,
    minimum_packages: 0,
    weights: { sanitation_percent: '1.0' },
  },
  priority: {
    method_version: 'synthetic-method',
    excluded: { '13': ['sanitation_percent'] },
    ranked: [
      {
        region_code: '11',
        rank: 1,
        score: '0.85',
        contributions: { sanitation_percent: '0.85' },
      },
      {
        region_code: '12',
        rank: 2,
        score: '0.35',
        contributions: { sanitation_percent: '0.35' },
      },
    ],
  },
  allocation: {
    status: 'optimal',
    allocations: { '11': 2, '12': 0 },
    evaluation: {
      budget_used_idr: 20,
      budget_remaining_idr: 10,
      objective_units: 17000,
    },
    model_version: 'synthetic-model',
    reason: null,
    solver_version: 'synthetic',
    best_bound_units: 17000,
    absolute_gap_units: 0,
    max_time_seconds: 5,
  },
  baselines: {},
  sources: [],
  limitations: [],
} as unknown as Snapshot;

describe('buildScenarioMapView', () => {
  it('maps MCDA urgency scores and marks excluded regions', () => {
    const view = buildScenarioMapView(scenarioFixture, 'urgency', {
      '13': 'Provinsi Gamma',
    });

    expect(view.available).toBe(true);
    expect(view.rows).toHaveLength(3);
    expect(view.rows[0]).toMatchObject({
      code: '11',
      fill: '#d97706',
      tooltip: 'Provinsi Alpha · Peringkat #1 · Skor urgensi 0,85 · Alokasi 2 paket',
    });
    expect(view.rows[1]).toMatchObject({
      code: '12',
      fill: '#f7cfaa',
      tooltip: 'Provinsi Beta · Peringkat #2 · Skor urgensi 0,35 · Alokasi 0 paket',
    });
    expect(view.rows[2]).toMatchObject({
      code: '13',
      fill: '#d8dce0',
      tooltip: 'Provinsi Gamma · Dikecualikan dari peringkat (data belum lengkap)',
    });
    expect(view.legend.description).toContain('urgensi MCDA');
  });

  it('maps CP-SAT package allocations and distinguishes zero-package regions', () => {
    const view = buildScenarioMapView(scenarioFixture, 'allocation');

    expect(view.available).toBe(true);
    expect(view.rows[0]).toMatchObject({
      code: '11',
      fill: '#14507c',
      tooltip: 'Provinsi Alpha · 2 paket dialokasikan · Peringkat urgensi #1',
    });
    expect(view.rows[1]).toMatchObject({
      code: '12',
      fill: '#eef2f6',
      tooltip: 'Provinsi Beta · 0 paket dialokasikan · Peringkat urgensi #2',
    });
    expect(view.rows[2].fill).toBe('#d8dce0');
    expect(view.legend.description).toContain('0–2 paket');
  });

  it('disables allocation map when solver status is infeasible and falls back to code when name is unmapped', () => {
    const infeasible = structuredClone(scenarioFixture);
    infeasible.allocation.status = 'infeasible';
    infeasible.allocation.allocations = null as unknown as Record<string, number>;
    infeasible.input_rows = [];
    infeasible.region_names = {};

    const allocView = buildScenarioMapView(infeasible, 'allocation');
    expect(allocView.available).toBe(false);
    expect(allocView.unavailableReason).toContain('belum memiliki solusi alokasi');

    const urgencyView = buildScenarioMapView(infeasible, 'urgency');
    expect(urgencyView.available).toBe(true);
    expect(urgencyView.rows[0].tooltip).toBe(
      '11 · Peringkat #1 · Skor urgensi 0,85',
    );
    expect(urgencyView.rows[2].tooltip).toBe(
      '13 · Dikecualikan dari peringkat (data belum lengkap)',
    );

    const feasible = structuredClone(scenarioFixture);
    feasible.allocation.status = 'feasible';
    feasible.allocation.allocations = { '11': 5 };
    const feasibleUrgency = buildScenarioMapView(feasible, 'urgency');
    expect(feasibleUrgency.rows[1].tooltip).toContain('Alokasi 0 paket');
  });
});
