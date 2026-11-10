export interface RouteSeo {
  title: string;
  description: string;
  ogType: 'website' | 'article';
  noindex?: boolean;
}

const DEFAULT_SEO: RouteSeo = {
  title: 'Equora | Data pendidikan untuk keputusan yang lebih terarah',
  description:
    'Telusuri fasilitas pendidikan antarprovinsi, atur prioritas kebutuhan, dan uji skenario alokasi anggaran dengan data serta asumsi yang bisa ditelusuri.',
  ogType: 'website',
};

const ROUTE_SEO: Record<string, RouteSeo> = {
  '/': DEFAULT_SEO,
  '/about': {
    title: 'Tentang Equora | Data publik dan keputusan yang terukur',
    description:
      'Kenali Equora: pahami fasilitas pendidikan di provinsi Anda, telusuri sumber data, dan jelajahi pilihan melalui simulasi.',
    ogType: 'website',
  },
  '/methodology': {
    title: 'Metodologi — Equora',
    description:
      'Penjelasan metode skor prioritas MCDA, optimasi alokasi CP-SAT, penanganan data hilang, asumsi, dan batas interpretasi Equora.',
    ogType: 'article',
  },
  '/daerah': {
    title: 'Pendidikan di Daerah Saya · Equora',
    description:
      'Pahami fasilitas pendidikan provinsi Anda, bandingkan dengan provinsi lain dan telusuri sumber datanya.',
    ogType: 'website',
  },
  '/explore': {
    title: 'Explorer pendidikan · Equora',
    description:
      'Telusuri peta tematik dan tabel indikator fasilitas sekolah antarprovinsi berdasarkan jenjang serta periksa bukti sumbernya.',
    ogType: 'website',
  },
  '/studio': {
    title: 'Studio simulasi · Equora',
    description:
      'Atur bobot prioritas indikator, cakupan wilayah, dan batasan anggaran untuk menguji skenario alokasi fasilitas pendidikan.',
    ogType: 'website',
  },
  '/compare': {
    title: 'Perbandingan skenario · Equora',
    description:
      'Bandingkan dua snapshot skenario alokasi yang kompatibel untuk menganalisis perubahan paket, peringkat provinsi, dan jangkauan anggaran.',
    ogType: 'website',
  },
  '/datasets': {
    title: 'Katalog dataset · Equora',
    description:
      'Telusuri katalog indikator fasilitas pendidikan beserta definisi, satuan, periode, checksum SHA-256, dan catatan kualitas data.',
    ogType: 'website',
  },
  '/admin': {
    title: 'Impor lokal · Equora',
    description:
      'Halaman administrasi untuk memeriksa dan mengimpor manifest data pendidikan lokal terverifikasi.',
    ogType: 'website',
    noindex: true,
  },
};

export const PUBLIC_SITEMAP_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/daerah', changefreq: 'weekly', priority: '0.9' },
  { path: '/explore', changefreq: 'weekly', priority: '0.9' },
  { path: '/studio', changefreq: 'weekly', priority: '0.8' },
  { path: '/compare', changefreq: 'weekly', priority: '0.7' },
  { path: '/datasets', changefreq: 'monthly', priority: '0.8' },
  { path: '/methodology', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
] as const;

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function resolveSeo(pathname: string): RouteSeo {
  const clean = normalizePathname(pathname);
  if (ROUTE_SEO[clean]) return ROUTE_SEO[clean];
  if (clean.startsWith('/admin/')) return { ...ROUTE_SEO['/admin'], noindex: true };
  if (clean.startsWith('/datasets/')) {
    return {
      title: 'Detail sumber · Equora',
      description:
        'Periksa definisi indikator, asal berkas, satuan pengukuran, dan ringkasan kualitas sumber data pendidikan di Equora.',
      ogType: 'website',
    };
  }
  if (clean.startsWith('/regions/')) {
    return {
      title: 'Detail wilayah · Equora',
      description:
        'Profil indikator fasilitas sekolah, denominator institusi, dan referensi sel sumber untuk wilayah provinsi.',
      ogType: 'website',
    };
  }
  if (clean.startsWith('/scenarios/')) {
    return {
      title: 'Snapshot skenario · Equora',
      description:
        'Tautan snapshot parameter dan hasil perhitungan skenario alokasi fasilitas pendidikan.',
      ogType: 'website',
      noindex: true,
    };
  }
  return DEFAULT_SEO;
}

export function buildStructuredData(origin: string, pathname: string): string {
  const clean = normalizePathname(pathname);
  const seo = resolveSeo(clean);
  const canonicalUrl = `${origin}${clean === '/' ? '' : clean}`;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: 'Equora',
      inLanguage: 'id-ID',
      description: DEFAULT_SEO.description,
    },
    {
      '@type': 'WebApplication',
      '@id': `${origin}/#application`,
      name: 'Equora',
      url: origin,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'id-ID',
      description: DEFAULT_SEO.description,
      isAccessibleForFree: true,
    },
  ];

  if (clean === '/methodology') {
    graph.push({
      '@type': 'TechArticle',
      headline: seo.title,
      description: seo.description,
      url: canonicalUrl,
      inLanguage: 'id-ID',
      isPartOf: { '@id': `${origin}/#website` },
    });
  } else if (clean === '/datasets') {
    graph.push({
      '@type': 'DataCatalog',
      name: seo.title,
      description: seo.description,
      url: canonicalUrl,
      inLanguage: 'id-ID',
      isPartOf: { '@id': `${origin}/#website` },
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  });
}
