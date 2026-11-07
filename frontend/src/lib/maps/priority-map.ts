import type {
  Observation,
  RegionMapInsights,
  Snapshot,
} from '$lib/api/workspace';

export type PriorityMapMode = 'value' | 'median' | 'completeness';
export type ScenarioMapMode = 'urgency' | 'allocation';

export type PriorityMapDisplayRow = {
  code: string;
  name: string;
  fill: string;
  tooltip: string;
};

export type PriorityMapLegend = {
  items: { color: string; label: string }[];
  description: string;
};

export type PriorityMapPresentation = {
  available: boolean;
  unavailableReason: string;
  rows: PriorityMapDisplayRow[];
  legend: PriorityMapLegend;
};

const missingColor = '#d8dce0';
const valueColors = ['#e8f1fa', '#b4d1e8', '#74a9cf', '#367fb5', '#14507c'];
const belowColors = ['#fbe9d6', '#f7cfaa', '#efad6e', '#e38a32', '#d97706'];
const aboveColors = ['#e8f1fa', '#b4d1e8', '#74a9cf', '#367fb5', '#2563a6'];
const completenessColors = ['#eef5f5', '#d9e9e8', '#9fc6c4', '#659d9c', '#2f6f73'];

const format = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);

function scaleColor(colors: string[], value: number, maximum = 1) {
  const ratio = maximum > 0 ? Math.max(0, Math.min(1, value / maximum)) : 0;
  return colors[Math.min(colors.length - 1, Math.floor(ratio * colors.length))];
}

function valueLegend(percent: boolean, maximum: number): PriorityMapLegend {
  return {
    items: [
      { color: valueColors[0], label: 'Rendah' },
      { color: valueColors[4], label: 'Tinggi' },
      { color: missingColor, label: 'Tidak tersedia' },
    ],
    description: percent
      ? 'Skala nilai indikator 0–100%.'
      : `Skala nilai indikator 0–${format(maximum)} sekolah pada hasil filter.`,
  };
}

function medianLegend(): PriorityMapLegend {
  return {
    items: [
      { color: belowColors[4], label: 'Di bawah median' },
      { color: '#dfe4e8', label: 'Setara median' },
      { color: aboveColors[4], label: 'Di atas median' },
      { color: missingColor, label: 'Tidak tersedia' },
    ],
    description:
      'Intensitas menunjukkan besar selisih yang diamati, bukan tingkat urgensi kebijakan.',
  };
}

function completenessLegend(): PriorityMapLegend {
  return {
    items: [
      { color: completenessColors[0], label: 'Belum lengkap' },
      { color: completenessColors[4], label: 'Lengkap' },
      { color: missingColor, label: 'Tidak diketahui' },
    ],
    description: 'Skala kelengkapan indikator yang dapat dibandingkan.',
  };
}

export function buildPriorityMapView(
  observations: Observation[],
  percent: boolean,
  mode: PriorityMapMode,
  insights?: RegionMapInsights,
): PriorityMapPresentation {
  const values = observations
    .map((row) => (row.value == null ? null : Number(row.value)))
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const maximum = percent ? 100 : Math.max(1, ...values);
  const insightRows = new Map(insights?.rows.map((row) => [row.code, row]) ?? []);

  if (mode === 'median' && (!insights || insights.indicator.unit !== 'percent')) {
    return {
      available: false,
      unavailableReason:
        'Perbandingan median hanya tersedia untuk indikator akses persentase.',
      rows: [],
      legend: medianLegend(),
    };
  }
  if (mode === 'completeness' && !insights) {
    return {
      available: false,
      unavailableReason: 'Kelengkapan indikator belum dapat dimuat.',
      rows: [],
      legend: completenessLegend(),
    };
  }

  const maxDelta = Math.max(
    1,
    ...(insights?.rows.map((row) => Math.abs(Number(row.delta_from_median ?? 0))) ?? []),
  );
  const rows = observations.map((observation) => {
    const insight = insightRows.get(observation.code);
    if (mode === 'value') {
      const value = observation.value == null ? null : Number(observation.value);
      return {
        code: observation.code,
        name: observation.name,
        fill:
          value === null || !Number.isFinite(value)
            ? missingColor
            : scaleColor(valueColors, value, maximum),
        tooltip: `${observation.name} · ${
          value === null || !Number.isFinite(value)
            ? 'Data tidak tersedia / di luar filter'
            : `${format(value)}${percent ? '%' : ' sekolah'}`
        }`,
      };
    }
    if (mode === 'median') {
      const delta = insight?.delta_from_median == null ? null : Number(insight.delta_from_median);
      const comparison = insight?.comparison ?? 'unavailable';
      const fill =
        delta === null || !Number.isFinite(delta)
          ? missingColor
          : comparison === 'equal'
            ? '#dfe4e8'
            : scaleColor(comparison === 'below' ? belowColors : aboveColors, Math.abs(delta), maxDelta);
      const direction = comparison === 'below' ? 'di bawah' : comparison === 'above' ? 'di atas' : 'setara dengan';
      return {
        code: observation.code,
        name: observation.name,
        fill,
        tooltip:
          delta === null || !Number.isFinite(delta)
            ? `${observation.name} · Data tidak dapat dibandingkan`
            : comparison === 'equal'
              ? `${observation.name} · Setara dengan median`
              : `${observation.name} · ${format(Math.abs(delta))} poin persentase ${direction} median`,
      };
    }
    const ratio = insight?.completeness_ratio == null ? null : Number(insight.completeness_ratio);
    return {
      code: observation.code,
      name: observation.name,
      fill:
        ratio === null || !Number.isFinite(ratio)
          ? missingColor
          : scaleColor(completenessColors, ratio),
      tooltip:
        ratio === null || !Number.isFinite(ratio) || !insight
          ? `${observation.name} · Kelengkapan data tidak tersedia`
          : `${observation.name} · ${insight.available_indicators} dari ${insight.total_indicators} indikator dapat dibandingkan`,
    };
  });

  return {
    available: true,
    unavailableReason: '',
    rows,
    legend:
      mode === 'value'
        ? valueLegend(percent, maximum)
        : mode === 'median'
          ? medianLegend()
          : completenessLegend(),
  };
}

export function buildScenarioMapView(
  snapshot: Snapshot,
  mode: ScenarioMapMode,
  regionNames: Record<string, string> = {},
): PriorityMapPresentation {
  const names: Record<string, string> = {
    ...Object.fromEntries(snapshot.input_rows.map((row) => [row.code, row.name])),
    ...(snapshot.region_names ?? {}),
    ...regionNames,
  };
  const allocations = snapshot.allocation.allocations ?? {};
  const solverOk =
    snapshot.allocation.status === 'optimal' ||
    snapshot.allocation.status === 'feasible';

  if (mode === 'allocation' && !solverOk) {
    return {
      available: false,
      unavailableReason:
        'Skenario ini belum memiliki solusi alokasi paket yang layak.',
      rows: [],
      legend: {
        items: [
          { color: '#eef2f6', label: '0 paket' },
          { color: valueColors[4], label: 'Alokasi paket' },
          { color: missingColor, label: 'Dikecualikan' },
        ],
        description: 'Sebaran paket intervensi hasil optimasi CP-SAT.',
      },
    };
  }

  const maxPackages = Math.max(
    1,
    ...Object.values(allocations).map((count) => Number(count ?? 0)),
  );

  const rankedRows: PriorityMapDisplayRow[] = snapshot.priority.ranked.map(
    (row) => {
      const name = names[row.region_code] ?? row.region_code;
      const score = Number(row.score);
      const packages = Number(allocations[row.region_code] ?? 0);
      if (mode === 'urgency') {
        return {
          code: row.region_code,
          name,
          fill: Number.isFinite(score)
            ? scaleColor(belowColors, score, 1)
            : missingColor,
          tooltip: `${name} · Peringkat #${row.rank} · Skor urgensi ${format(score)}${
            solverOk ? ` · Alokasi ${format(packages)} paket` : ''
          }`,
        };
      }
      return {
        code: row.region_code,
        name,
        fill:
          packages <= 0
            ? '#eef2f6'
            : scaleColor(valueColors, packages, maxPackages),
        tooltip: `${name} · ${format(packages)} paket dialokasikan · Peringkat urgensi #${row.rank}`,
      };
    },
  );

  const excludedRows: PriorityMapDisplayRow[] = Object.keys(
    snapshot.priority.excluded,
  ).map((code) => {
    const name = names[code] ?? code;
    return {
      code,
      name,
      fill: missingColor,
      tooltip: `${name} · Dikecualikan dari peringkat (data belum lengkap)`,
    };
  });

  return {
    available: true,
    unavailableReason: '',
    rows: [...rankedRows, ...excludedRows],
    legend:
      mode === 'urgency'
        ? {
            items: [
              { color: belowColors[0], label: 'Urgensi rendah' },
              { color: belowColors[2], label: 'Urgensi sedang' },
              { color: belowColors[4], label: 'Urgensi tertinggi' },
              { color: missingColor, label: 'Dikecualikan' },
            ],
            description:
              'Skala skor kebutuhan/urgensi MCDA (0–1) sesuai bobot prioritas skenario.',
          }
        : {
            items: [
              { color: '#eef2f6', label: '0 paket' },
              { color: valueColors[2], label: 'Alokasi sedang' },
              { color: valueColors[4], label: 'Alokasi tertinggi' },
              { color: missingColor, label: 'Dikecualikan' },
            ],
            description: `Sebaran alokasi paket hasil solver CP-SAT (0–${format(maxPackages)} paket).`,
          },
  };
}
