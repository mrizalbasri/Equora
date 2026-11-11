export interface RouteSeo {
  title: string;
  description: string;
  ogType: 'website' | 'article';
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
}

const DEFAULT_SEO: RouteSeo = {
  title: 'Equora | Data pendidikan untuk keputusan yang lebih terarah',
  description:
    'Telusuri fasilitas pendidikan antarprovinsi, atur prioritas kebutuhan, dan uji skenario alokasi anggaran dengan data serta asumsi yang bisa ditelusuri.',
  ogType: 'website',
  image: '/images/brand/equora-og.jpg',
  imageAlt:
    'Equora - Wawasan Data untuk Indonesia | Peta & Analisis Fasilitas Pendidikan 38 Provinsi',
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
  if (ROUTE_SEO[clean]) return { ...DEFAULT_SEO, ...ROUTE_SEO[clean] };
  if (clean.startsWith('/admin/')) return { ...DEFAULT_SEO, ...ROUTE_SEO['/admin'], noindex: true };
  if (clean.startsWith('/datasets/')) {
    return {
      ...DEFAULT_SEO,
      title: 'Detail sumber · Equora',
      description:
        'Periksa definisi indikator, asal berkas, satuan pengukuran, dan ringkasan kualitas sumber data pendidikan di Equora.',
      ogType: 'website',
    };
  }
  if (clean.startsWith('/regions/')) {
    return {
      ...DEFAULT_SEO,
      title: 'Detail wilayah · Equora',
      description:
        'Profil indikator fasilitas sekolah, denominator institusi, dan referensi sel sumber untuk wilayah provinsi.',
      ogType: 'website',
    };
  }
  if (clean.startsWith('/scenarios/')) {
    return {
      ...DEFAULT_SEO,
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
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'Equora',
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/images/brand/equora-logo.webp`,
      },
      image: `${origin}/images/brand/equora-og.jpg`,
      description:
        'Platform analisis data terbuka fasilitas pendidikan dan simulasi alokasi sumber daya sekolah di 38 provinsi Indonesia.',
      areaServed: {
        '@type': 'Country',
        name: 'Indonesia',
      },
      knowsAbout: [
        'Data Pendidikan Indonesia',
        'Fasilitas Sekolah',
        'Sanitasi Dasar Sekolah',
        'Akses Internet Pengajaran',
        'Komputer Pembelajaran',
        'Simulasi Kebijakan Anggaran',
        'Optimasi Alokasi Sumber Daya',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: origin,
      name: 'Equora',
      inLanguage: 'id-ID',
      description: DEFAULT_SEO.description,
      publisher: {
        '@id': `${origin}/#organization`,
      },
      image: `${origin}/images/brand/equora-og.jpg`,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${origin}/explore?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
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
      image: `${origin}/images/brand/equora-og.jpg`,
      screenshot: `${origin}/images/brand/equora-og.jpg`,
      provider: {
        '@id': `${origin}/#organization`,
      },
      featureList: [
        'Peta tematik fasilitas sekolah 38 provinsi di Indonesia',
        'Analisis sanitasi, air minum, akses internet, dan komputer sekolah',
        'Simulasi prioritas kebutuhan MCDA dan optimasi alokasi anggaran CP-SAT',
        'Perbandingan data relatif terhadap median nasional',
        'Katalog dataset terbuka dengan verifikasi provenance',
      ],
    },
  ];

  if (clean === '/') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${origin}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Apa itu platform Equora?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Equora adalah aplikasi web analisis data publik untuk menelusuri kondisi fasilitas pendidikan antarprovinsi di Indonesia, membaca posisi relatif terhadap median provinsi pada jenjang yang sepadan, dan menguji skenario alokasi sumber daya secara transparan.',
          },
        },
        {
          '@type': 'Question',
          name: 'Fasilitas pendidikan apa saja yang dianalisis oleh Equora?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Equora memetakan empat indikator fasilitas penting di seluruh 38 provinsi Indonesia: akses sanitasi dasar, ketersediaan air minum layak, jaringan internet untuk pengajaran, dan komputer untuk pembelajaran pada jenjang SD, SMP, SMA, dan SMK.',
          },
        },
        {
          '@type': 'Question',
          name: 'Dari mana sumber data yang digunakan Equora?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Data Equora bersumber dari data statistik resmi terbuka Kemendikbudristek dan BPS (Badan Pusat Statistik). Setiap angka indikator dilengkapi metadata provenance, tahun ajaran, tautan berkas resmi, dan checksum SHA-256 untuk verifikasi integritas data.',
          },
        },
        {
          '@type': 'Question',
          name: 'Bagaimana cara menggunakan Studio Simulasi alokasi di Equora?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Di Studio Simulasi, pengguna dapat memilih jenjang sekolah, menentukan bobot prioritas indikator (MCDA), mengatur pagu anggaran serta biaya paket, dan menjalankan solver optimasi matematis CP-SAT (OR-Tools) untuk mengeksplorasi skenario bantuan sekolah yang paling berdampak.',
          },
        },
      ],
    });
  } else {
    const pageTitle = seo.title.split('|')[0].split('·')[0].split('—')[0].trim();
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Beranda',
          item: origin,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageTitle,
          item: canonicalUrl,
        },
      ],
    });
  }

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
