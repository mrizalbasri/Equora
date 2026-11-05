import { describe, expect, it } from 'vitest';
import {
  compareSummary,
  equityConcentration,
  focusIndicator,
  schoolImpact,
} from './insight';

const balancedWeights = {
  sanitation_percent: 25,
  water_percent: 25,
  computers_percent: 25,
  internet_percent: 25,
};
const sanitationWeights = {
  sanitation_percent: 50,
  water_percent: 30,
  computers_percent: 10,
  internet_percent: 10,
};

function inputRow(code: string, institutions: string, sanitation: string | null) {
  return {
    code,
    values: {
      institutions_count: institutions,
      sanitation_percent: sanitation,
      water_percent: '80',
      computers_percent: '50',
      internet_percent: '60',
    },
  };
}

describe('focusIndicator', () => {
  it('picks the highest weighted indicator', () => {
    expect(focusIndicator(sanitationWeights)).toBe('sanitation_percent');
    expect(
      focusIndicator({
        sanitation_percent: 10,
        water_percent: 20,
        computers_percent: 30,
        internet_percent: 40,
      }),
    ).toBe('internet_percent');
  });
  it('breaks ties in sanitasi → air → komputer → internet order', () => {
    expect(focusIndicator(balancedWeights)).toBe('sanitation_percent');
    expect(
      focusIndicator({
        sanitation_percent: 0,
        water_percent: 25,
        computers_percent: 25,
        internet_percent: 25,
      }),
    ).toBe('water_percent');
  });
  it('returns null for missing, invalid, or all-zero weights', () => {
    expect(focusIndicator({})).toBeNull();
    expect(focusIndicator({ ...balancedWeights, water_percent: 'abc' })).toBeNull();
    expect(focusIndicator({ ...balancedWeights, water_percent: NaN })).toBeNull();
    expect(
      focusIndicator({
        sanitation_percent: 0,
        water_percent: 0,
        computers_percent: 0,
        internet_percent: 0,
      }),
    ).toBeNull();
  });
});

describe('equityConcentration', () => {
  const ranked = [
    { region_code: 'A', rank: 1 },
    { region_code: 'B', rank: 2 },
    { region_code: 'C', rank: 3 },
    { region_code: 'D', rank: 4 },
    { region_code: 'E', rank: 5 },
    { region_code: 'F', rank: 6 },
  ];
  it('measures the share of packages flowing to the top-ranked regions', () => {
    const result = equityConcentration(
      ranked,
      { A: 30, B: 20, C: 10, D: 0, E: 0, F: 40 },
      5,
    );
    expect(result).toEqual({ regions: ['A', 'B', 'C', 'D', 'E'], packages: 60, total: 100, percent: 60 });
  });
  it('returns null when nothing is allocated or no ranking exists', () => {
    expect(equityConcentration(ranked, {}, 5)).toBeNull();
    expect(equityConcentration(ranked, null, 5)).toBeNull();
    expect(equityConcentration(ranked, undefined, 5)).toBeNull();
    expect(equityConcentration([], { A: 5 }, 5)).toBeNull();
  });
  it('ignores null and undefined package counts in the share', () => {
    const result = equityConcentration(
      ranked,
      { A: null, B: undefined, C: 10, D: 20, E: 20 },
      5,
    );
    expect(result).toEqual({ regions: ['A', 'B', 'C', 'D', 'E'], packages: 50, total: 50, percent: 100 });
  });
});

describe('schoolImpact', () => {
  const rows = [
    inputRow('A', '1000', '40'), // need 600
    inputRow('B', '500', '80'), // need 100
    inputRow('C', '200', null), // missing focus value → skipped
    inputRow('D', '300', '100'), // need 0 → skipped
    inputRow('E', '', '10'), // institutions missing → skipped
    inputRow('F', '0', '10'), // institutions 0 → skipped
  ];
  it('estimates facilitated schools per receiving region', () => {
    const impact = schoolImpact(rows, sanitationWeights, { A: 60, B: 50, C: 10, D: 10, E: 5, F: 5 });
    expect(impact?.focus).toBe('sanitation_percent');
    expect(impact?.totalPackages).toBe(140); // paket dari wilayah terlewat tetap dihitung
    expect(impact?.schoolsInNeed).toBe(700); // 600 + 100
    expect(impact?.percent).toBeCloseTo(20, 5);
    expect(impact?.skippedRegions).toBe(4);
    expect(impact?.regions).toEqual([
      { code: 'B', packages: 50, schoolsInNeed: 100, coveragePercent: 50 },
      { code: 'A', packages: 60, schoolsInNeed: 600, coveragePercent: 10 },
    ]);
  });
  it('allows coverage above 100 percent and keeps it as-is', () => {
    const impact = schoolImpact(rows, sanitationWeights, { B: 150 });
    expect(impact?.regions[0]?.coveragePercent).toBe(150);
    expect(impact?.percent).toBe(150);
  });
  it('returns null percent when no receiving region has usable data', () => {
    const impact = schoolImpact(rows, sanitationWeights, { C: 10 });
    expect(impact?.schoolsInNeed).toBe(0);
    expect(impact?.percent).toBeNull();
    expect(impact?.regions).toEqual([]);
  });
  it('returns null without a determinable focus indicator', () => {
    expect(schoolImpact(rows, {}, { A: 10 })).toBeNull();
  });
  it('skips zero, negative, and missing package counts', () => {
    const impact = schoolImpact(rows, sanitationWeights, { A: 0, C: null, D: -5, B: 3 });
    expect(impact?.totalPackages).toBe(3);
    expect(impact?.schoolsInNeed).toBe(100);
    expect(impact?.regions).toEqual([
      { code: 'B', packages: 3, schoolsInNeed: 100, coveragePercent: 3 },
    ]);
  });
  it('tolerates null allocations', () => {
    const impact = schoolImpact(rows, sanitationWeights, null);
    expect(impact?.totalPackages).toBe(0);
    expect(impact?.schoolsInNeed).toBe(0);
    expect(impact?.percent).toBeNull();
  });
});

describe('compareSummary', () => {
  const names = { A: 'Aceh', B: 'Jawa Barat' };
  const base = {
    coverage: {
      left: { total_packages: 100 },
      right: { total_packages: 130 },
    },
    rows: [
      { region_code: 'A', delta: 40 },
      { region_code: 'B', delta: -10 },
    ],
    budget_delta_idr: 200_000_000,
    objective_comparable: true,
  };

  it('describes totals, concentration, and budget direction', () => {
    const sentences = compareSummary(base, names);
    expect(sentences[0]).toBe(
      'Skenario pembanding mengalokasikan 130 paket — lebih banyak 30 paket dibanding Skenario awal (100 paket).',
    );
    expect(sentences[1]).toBe('Perubahan paling terkonsentrasi di Aceh (+40 paket) dan Jawa Barat (-10 paket).');
    expect(sentences[2]).toContain('naik');
    expect(sentences[2]).toContain('200.000.000');
    expect(sentences).toHaveLength(3);
  });
  it('uses scenario names when provided', () => {
    const [first] = compareSummary(base, names, 'Berimbang', 'Afirmasi');
    expect(first).toContain('Afirmasi mengalokasikan 130 paket');
    expect(first).toContain('dibanding Berimbang');
  });
  it('handles equal totals, no movers, and stable budgets', () => {
    const sentences = compareSummary(
      { ...base, coverage: { left: { total_packages: 100 }, right: { total_packages: 100 } }, rows: [{ region_code: 'A', delta: 0 }], budget_delta_idr: 0 },
      names,
    );
    expect(sentences[0]).toContain('jumlah yang sama dengan');
    expect(sentences[1]).toBe('Tidak ada pergeseran paket antarwilayah pada kedua skenario ini.');
    expect(sentences[2]).toBe('Anggaran terpakai tidak berubah antara kedua skenario.');
  });
  it('describes fewer packages and a falling budget', () => {
    const sentences = compareSummary(
      { ...base, coverage: { left: { total_packages: 120 }, right: { total_packages: 70 } }, budget_delta_idr: -50_000_000 },
      names,
    );
    expect(sentences[0]).toContain('lebih sedikit 50 paket');
    expect(sentences[2]).toContain('turun');
    expect(sentences[2]).toContain('50.000.000');
  });
  it('adds the comparability caveat when objective_comparable is false', () => {
    const sentences = compareSummary({ ...base, objective_comparable: false }, names);
    expect(sentences[3]).toContain('tidak diperbandingkan');
  });
  it('tolerates missing sides, malformed rows, and absent budgets', () => {
    const more = compareSummary(
      {
        coverage: { left: { total_packages: null }, right: { total_packages: 100 } },
        rows: [],
        budget_delta_idr: undefined,
        objective_comparable: false,
      },
      names,
    );
    expect(more[0]).toContain('mengalokasikan 100 paket');
    expect(more[0]).toContain('lebih banyak');
    expect(more[2]).toBe('Anggaran terpakai tidak berubah antara kedua skenario.');
    expect(more[3]).toContain('tidak diperbandingkan');

    const fewer = compareSummary(
      {
        coverage: { left: { total_packages: 100 }, right: undefined },
        rows: [{ region_code: 'A', delta: null }],
        budget_delta_idr: undefined,
        objective_comparable: false,
      },
      names,
    );
    expect(fewer[0]).toContain('mengalokasikan 0 paket');
    expect(fewer[0]).toContain('lebih sedikit');
    expect(fewer[1]).toBe('Tidak ada pergeseran paket antarwilayah pada kedua skenario ini.');
  });
  it('falls back to region codes when names are missing', () => {
    const sentences = compareSummary(base);
    expect(sentences[1]).toContain('A (+40 paket)');
  });
});
