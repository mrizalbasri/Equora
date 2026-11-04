/**
 * Pembangun narasi murni (tanpa state) untuk kartu ringkasan Studio dan Compare.
 * Semua fungsi hanya membaca field snapshot yang sudah ada — tanpa endpoint baru.
 */

import { rupiah } from '../api/workspace';

/** Urutan seri indikator persentase, mengikuti CORE di backend. */
export const PERCENT_INDICATORS = [
  'sanitation_percent',
  'water_percent',
  'computers_percent',
  'internet_percent',
] as const;

export type PercentIndicator = (typeof PERCENT_INDICATORS)[number];

export type WeightMap = Record<string, string | number>;

/**
 * Indikator dengan bobot tertinggi; seri mengikuti urutan
 * sanitasi → air → komputer → internet. Mengembalikan null bila bobot
 * tidak lengkap, tidak valid, atau seluruhnya 0.
 */
export function focusIndicator(weights: WeightMap): PercentIndicator | null {
  let focus: PercentIndicator | null = null;
  let best = 0;
  for (const key of PERCENT_INDICATORS) {
    const value = Number(weights[key]);
    if (!Number.isFinite(value)) return null;
    if (value > best) {
      best = value;
      focus = key;
    }
  }
  return focus;
}

export type EquityConcentration = {
  /** Kode wilayah berperingkat teratas yang dihitung. */
  regions: string[];
  /** Paket yang mengalir ke wilayah teratas. */
  packages: number;
  /** Total paket teralokasi. */
  total: number;
  /** packages / total × 100. */
  percent: number;
};

/**
 * Berapa persen paket mengalir ke N provinsi dengan skor kebutuhan tertinggi.
 * Mengembalikan null bila tidak ada paket teralokasi atau peringkat kosong.
 */
export function equityConcentration(
  ranked: { region_code: string; rank: number | string }[],
  allocations: Record<string, number> | null | undefined,
  topCount = 5,
): EquityConcentration | null {
  const total = Object.values(allocations ?? {}).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );
  if (total <= 0 || ranked.length === 0) return null;
  const regions = [...ranked]
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .slice(0, topCount)
    .map((row) => row.region_code);
  const top = new Set(regions);
  const packages = Object.entries(allocations ?? {})
    .filter(([code]) => top.has(code))
    .reduce((sum, [, count]) => sum + (count ?? 0), 0);
  return { regions, packages, total, percent: (packages / total) * 100 };
}

export type InputRow = { code: string; values: Record<string, string | null> };

export type SchoolImpactRegion = {
  code: string;
  packages: number;
  /** institutions_count × (1 − nilai indikator fokus/100), dibulatkan. */
  schoolsInNeed: number;
  /** packages / schoolsInNeed × 100; boleh > 100 (paket bukan spesifik indikator). */
  coveragePercent: number;
};

export type SchoolImpact = {
  focus: PercentIndicator;
  totalPackages: number;
  /** Σ kebutuhan di provinsi penerima yang datanya valid. */
  schoolsInNeed: number;
  /** totalPackages / schoolsInNeed × 100; null bila tidak ada kebutuhan terdata. */
  percent: number | null;
  regions: SchoolImpactRegion[];
  /** Provinsi penerima yang dilewati dari hitung kebutuhan (data kosong/100%). */
  skippedRegions: number;
};

/**
 * Estimasi sekolah difasilitasi dengan asumsi eksplisit:
 * 1 paket = rehabilitasi untuk 1 satuan pendidikan.
 * Provinsi penerima tanpa data valid (indikator fokus kosong atau
 * institutions_count ≤ 0) tetap dihitung paketnya tapi dilewati dari Σ kebutuhan.
 * Mengembalikan null bila indikator fokus tidak dapat ditentukan.
 */
export function schoolImpact(
  inputRows: InputRow[],
  weights: WeightMap,
  allocations: Record<string, number> | null | undefined,
): SchoolImpact | null {
  const focus = focusIndicator(weights);
  if (!focus) return null;
  const valuesByCode = new Map(inputRows.map((row) => [row.code, row.values]));
  const regions: SchoolImpactRegion[] = [];
  let totalPackages = 0;
  let schoolsInNeed = 0;
  let skippedRegions = 0;
  for (const [code, packages] of Object.entries(allocations ?? {})) {
    const count = packages ?? 0;
    if (count <= 0) continue;
    totalPackages += count;
    const values = valuesByCode.get(code);
    const rawInstitutions = values?.institutions_count;
    const rawValue = values?.[focus];
    const institutions =
      rawInstitutions == null || rawInstitutions === ''
        ? NaN
        : Number(rawInstitutions);
    const value = rawValue == null || rawValue === '' ? NaN : Number(rawValue);
    const inNeed =
      values &&
      Number.isFinite(institutions) &&
      institutions > 0 &&
      Number.isFinite(value) &&
      value < 100
        ? Math.round(institutions * (1 - value / 100))
        : 0;
    if (inNeed <= 0) {
      skippedRegions += 1;
      continue;
    }
    schoolsInNeed += inNeed;
    regions.push({
      code,
      packages: count,
      schoolsInNeed: inNeed,
      coveragePercent: (count / inNeed) * 100,
    });
  }
  regions.sort((a, b) => b.coveragePercent - a.coveragePercent);
  return {
    focus,
    totalPackages,
    schoolsInNeed,
    percent: schoolsInNeed > 0 ? (totalPackages / schoolsInNeed) * 100 : null,
    regions,
    skippedRegions,
  };
}

export type CompareSummaryInput = {
  coverage: Record<string, { total_packages: number } | undefined>;
  rows: { region_code: string; delta: number }[];
  budget_delta_idr: number;
  objective_comparable: boolean;
};

const formatInt = (value: number) => new Intl.NumberFormat('id-ID').format(value);

/**
 * Kalimat narasi perbandingan dua skenario (3–4 kalimat), dipakai
 * CompareSummary.svelte. Label skenario boleh disesuaikan pemanggil.
 */
export function compareSummary(
  input: CompareSummaryInput,
  names: Record<string, string> = {},
  leftLabel = 'Skenario awal',
  rightLabel = 'Skenario pembanding',
): string[] {
  const sentences: string[] = [];
  const leftTotal = input.coverage.left?.total_packages ?? 0;
  const rightTotal = input.coverage.right?.total_packages ?? 0;
  const diff = rightTotal - leftTotal;
  if (diff === 0) {
    sentences.push(
      `${rightLabel} mengalokasikan ${formatInt(rightTotal)} paket — jumlah yang sama dengan ${leftLabel}.`,
    );
  } else {
    sentences.push(
      `${rightLabel} mengalokasikan ${formatInt(rightTotal)} paket — ${
        diff > 0 ? 'lebih banyak' : 'lebih sedikit'
      } ${formatInt(Math.abs(diff))} paket dibanding ${leftLabel} (${formatInt(leftTotal)} paket).`,
    );
  }
  const movers = input.rows
    .filter((row) => (row.delta ?? 0) !== 0)
    .sort((a, b) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0))
    .slice(0, 2);
  if (movers.length === 0) {
    sentences.push('Tidak ada pergeseran paket antarwilayah pada kedua skenario ini.');
  } else {
    const detail = movers
      .map(
        (row) =>
          `${names[row.region_code] ?? row.region_code} (${
            row.delta > 0 ? '+' : ''
          }${formatInt(row.delta ?? 0)} paket)`,
      )
      .join(' dan ');
    sentences.push(`Perubahan paling terkonsentrasi di ${detail}.`);
  }
  const budgetDelta = input.budget_delta_idr ?? 0;
  if (budgetDelta === 0) {
    sentences.push('Anggaran terpakai tidak berubah antara kedua skenario.');
  } else {
    sentences.push(
      `Anggaran terpakai ${budgetDelta > 0 ? 'naik' : 'turun'} sebesar ${rupiah(
        Math.abs(budgetDelta),
      )} (${leftLabel} → ${rightLabel}).`,
    );
  }
  if (!input.objective_comparable) {
    sentences.push(
      'Kedua skenario memakai bobot atau lingkup wilayah yang berbeda, sehingga skor prioritasnya tidak diperbandingkan — bandingkan hanya perubahan jumlah paket.',
    );
  }
  return sentences;
}
