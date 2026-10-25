import type { components } from './schema';
export type Source = components['schemas']['SourceView'];
export type Workspace = components['schemas']['WorkspaceView'];
export type Observation = components['schemas']['ObservationView'];
export type Observations = components['schemas']['ObservationsView'];
export type Snapshot = components['schemas']['ScenarioView'];
export type SavedScenario = components['schemas']['SavedScenarioView'];
export type Review = components['schemas']['DecisionReview'];
export type ReviewTrial = components['schemas']['ReviewTrial'];
export const labels: Record<string, string> = {
  institutions_count: 'Jumlah sekolah',
  internet_count: 'Sekolah dengan internet',
  computers_count: 'Sekolah dengan ≥5 komputer',
  electricity_count: 'Sekolah dengan listrik',
  water_count: 'Sekolah dengan air',
  handwashing_count: 'Sekolah dengan fasilitas cuci tangan',
  internet_percent: 'Akses internet',
  computers_percent: 'Ketersediaan komputer',
  water_percent: 'Ketersediaan air',
  sanitation_percent: 'Sanitasi dasar',
};
export type NavigationItem = {
  label: string;
  href: string;
  description: string;
  icon: 'map' | 'database' | 'sliders' | 'compare' | 'book';
};
export type NavigationEntry =
  | { label: string; items: NavigationItem[]; href?: never }
  | { label: string; href: string; items?: never };

export const navigation: NavigationEntry[] = [
  {
    label: 'Eksplorasi',
    items: [
      { label: 'Pendidikan di Daerah Saya', href: '/daerah', icon: 'map', description: 'Pahami kondisi fasilitas dan bandingkan provinsi Anda.' },
      { label: 'Peta & Data Pendidikan', href: '/explore', icon: 'map', description: 'Lihat akses fasilitas pendidikan antarprovinsi.' },
      { label: 'Katalog Dataset', href: '/datasets', icon: 'database', description: 'Periksa sumber dan cakupan data.' },
    ],
  },
  {
    label: 'Simulasi',
    items: [
      { label: 'Studio Simulasi', href: '/studio', icon: 'sliders', description: 'Atur sumber daya, bobot, dan batas alokasi.' },
      { label: 'Bandingkan Skenario', href: '/compare', icon: 'compare', description: 'Tinjau perbedaan hasil dua skenario.' },
      { label: 'Metodologi', href: '/methodology', icon: 'book', description: 'Pahami perhitungan dan asumsi simulasi.' },
    ],
  },
  { label: 'Tentang', href: '/about' },
];
export const number = (value: string | number | null | undefined, digits = 2) =>
  value == null
    ? 'Tidak tersedia'
    : new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(
        Number(value),
      );
export const rupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
export async function api<T>(
  path: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  const response = await fetch('/api/v1/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : response.status === 422
          ? 'Input belum valid. Periksa angka, bobot, dan batas kapasitas.'
          : 'Layanan belum tersedia. Coba kembali.',
    );
  return data as T;
}

export async function downloadComparison(left: string, right: string) {
  const response = await fetch('/api/v1/scenarios/compare/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ left, right }),
  });
  if (!response.ok)
    throw new Error(
      'PDF perbandingan belum dapat dibuat. Periksa kompatibilitas snapshot.',
    );
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = 'equora-comparison.pdf';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
