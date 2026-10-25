import { labels, number, type Source } from './api/workspace';
import type { components } from '$lib/api/schema';

export type RegionProfile = components['schemas']['RegionProfileView'];

export function facilityValue(profile: RegionProfile, source: Source): number | null {
  const raw = profile.values[source.source_id];
  if (raw == null || raw.trim() === '') return null;
  const denominator = profile.values.institutions_count;
  if (source.unit === 'percent' && denominator != null && denominator.trim() !== '' &&
    Number(denominator) === 0) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 &&
    (source.unit !== 'percent' || value <= 100) ? value : null;
}

export function comparisonDifference(
  left: RegionProfile, right: RegionProfile, source: Source,
): { value: number | null; reason: string; compatible: boolean } {
  const other = right.sources.find((item) => item.source_id === source.source_id);
  if (left.release_id !== right.release_id || left.education_level !== right.education_level ||
    left.ownership !== right.ownership || left.academic_year !== right.academic_year || !other ||
    !source.academic_year || source.year == null || !source.definition ||
    source.academic_year !== other.academic_year || source.year !== other.year ||
    source.unit !== other.unit || source.definition !== other.definition ||
    source.storage_scale !== other.storage_scale || source.sha256 !== other.sha256) {
    return { value: null, reason: 'Periode, definisi, jenjang atau rilis tidak sepadan.', compatible: false };
  }
  const a = facilityValue(left, source);
  const b = facilityValue(right, other);
  return a === null || b === null
    ? { value: null, reason: 'Data pembanding belum lengkap atau tidak ada sekolah pada cakupan ini.', compatible: true }
    : { value: Math.round((a - b) * 1e8) / 1e8, reason: '', compatible: true };
}

export function profilePath(code: string, level: string, release: string, compare = '') {
  const params = new URLSearchParams({ province: code, level, release });
  if (compare) params.set('compare', compare);
  return '/daerah?' + params;
}

export function profileSummary(profile: RegionProfile, origin: string, comparison?: RegionProfile): string {
  const url = new URL(profilePath(profile.code, profile.education_level, profile.release_id, comparison?.code), origin);
  const lines = profile.sources.filter((source) => source.unit === 'percent').map((source) => {
    const value = facilityValue(profile, source);
    const delta = comparison ? comparisonDifference(profile, comparison, source) : undefined;
    return `${labels[source.source_id] ?? source.title}: ${value === null ? 'Tidak tersedia' : number(value) + '%'}${
      comparison ? `; dibanding ${comparison.name}: ${delta?.value == null ? delta?.reason : number(delta.value) + ' poin persentase'}` : ''
    }. Periode ${source.academic_year}; tahun data ${source.year}. Definisi: ${source.definition}. Sumber: ${source.source_url}`;
  });
  return [
    `Pendidikan di ${profile.name} | ${profile.education_level} | ${profile.academic_year} | ${profile.ownership}`,
    `Rilis: ${profile.release_id}. Status: ${profile.status}.`,
    ...lines,
    'Data agregat provinsi; tidak menggambarkan setiap sekolah atau menjelaskan penyebab kesenjangan.',
    ...profile.limitations,
    ...(profile.status !== 'published' ? ['Data review lokal; belum menjadi rilis publik terverifikasi.'] : []),
    ...(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? ['Tautan lokal hanya dapat dibuka pada lingkungan lokal yang sesuai.'] : []),
    url.href,
  ].join('\n');
}
