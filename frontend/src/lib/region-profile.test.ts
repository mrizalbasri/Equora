import { describe, expect, it } from 'vitest';
import { comparisonDifference, facilityValue, profilePath, profileSummary, type RegionProfile } from './region-profile';
import type { Source } from './api/workspace';

const source: Source = {
  source_id: 'sanitation_percent', title: 'Synthetic sanitation', publisher: 'Synthetic',
  source_url: 'https://example.org/synthetic', sha256: 'a'.repeat(64), unit: 'percent',
  year: 2025, academic_year: '2025/2026', definition: 'Synthetic tests only',
  storage_scale: 'percentage_points', license_status: 'synthetic_fixture_only', quality: {},
};
function profile(value: string | null, denominator = '10'): RegionProfile {
  return {
    code: '11', name: 'Synthetic', release_id: 'synthetic', status: 'local_review',
    academic_year: '2025/2026', ownership: 'Total', education_level: 'SD',
    values: { sanitation_percent: value, institutions_count: denominator },
    cells: { sanitation_percent: 'I5' }, sources: [source], limitations: [],
  };
}

describe('public region interpretation', () => {
  it('preserves a measured zero and excludes missing, invalid and zero-denominator percentages', () => {
    expect(facilityValue(profile('0'), source)).toBe(0);
    for (const raw of [null, '', 'NaN', '101', '-1']) expect(facilityValue(profile(raw), source)).toBeNull();
    expect(facilityValue(profile('25', '0'), source)).toBeNull();
    expect(facilityValue(profile('25', ''), source)).toBe(25);
    expect(facilityValue(profile('0', '0'), { ...source, source_id: 'institutions_count', unit: 'school_count' })).toBe(0);
  });
  it('compares the same indicator in percentage points without rounding noise', () => {
    expect(comparisonDifference(profile('20.3'), profile('60.1'), source).value).toBe(-39.8);
    expect(comparisonDifference(profile('0'), profile('0'), source).value).toBe(0);
    expect(comparisonDifference(profile('20'), profile(null), source).value).toBeNull();
  });
  it('refuses differences across releases, periods, levels or source definitions', () => {
    const changes: Partial<RegionProfile>[] = [
      { release_id: 'other' }, { academic_year: '2024/2025' }, { education_level: 'SMP' },
      { ownership: 'Negeri' }, { sources: [{ ...source, definition: 'Other definition' }] },
      { sources: [{ ...source, academic_year: '2024/2025' }] },
    ];
    for (const change of changes) {
      expect(comparisonDifference(profile('20'), { ...profile('60'), ...change }, source)).toMatchObject({ value: null });
    }
  });
  it('encodes enough context to reproduce a shared comparison', () => {
    const url = new URL(profilePath('11', 'SMP', 'release/one', '12'), 'https://example.org');
    expect(Object.fromEntries(url.searchParams)).toEqual({ province: '11', level: 'SMP', release: 'release/one', compare: '12' });
  });
  it('shares the release, definitions, comparison and limitations with a reproducible URL', () => {
    const left = { ...profile('0'), limitations: ['Synthetic limitation'] };
    const right = { ...profile('20'), code: '12', name: 'Synthetic comparison' };
    const text = profileSummary(left, 'http://localhost:4173', right);
    expect(text).toContain('0%');
    expect(text).toContain('-20 poin persentase');
    expect(text).toContain('2025/2026');
    expect(text).toContain('Synthetic tests only');
    expect(text).toContain('Sumber: https://example.org/synthetic');
    expect(text).toContain('Synthetic limitation');
    expect(text).toContain('Data review lokal');
    expect(text).toContain('Tautan lokal');
    expect(new URL(text.split('\n').at(-1)!).searchParams.get('compare')).toBe('12');
  });
  it('shares incompatible and missing data without inventing a difference', () => {
    const text = profileSummary(profile(null), 'https://example.org', { ...profile('60'), release_id: 'other' });
    expect(text).toContain('Tidak tersedia');
    expect(text).toContain('tidak sepadan');
    expect(text).not.toContain('poin persentase');
    expect(text).not.toContain('Tautan lokal');
  });
});
