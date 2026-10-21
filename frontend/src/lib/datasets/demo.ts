export type DatasetQuality = {
  missing: string;
  duplicates: string;
  coverage: string;
  status: 'Belum diaudit' | 'Demo';
};

export type Dataset = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  educationLevel: string;
  regionLevel: string;
  unit: string;
  license: string;
  version: string;
  retrievedAt: string;
  sourceUrl: string;
  description: string;
  quality: DatasetQuality;
};

export const demoDatasets: Dataset[] = [
  {
    id: 'sanitasi-dasar-2025',
    title: 'Akses fasilitas sanitasi dasar',
    publisher: 'Contoh katalog Equora',
    year: '2025',
    educationLevel: 'Semua jenjang',
    regionLevel: 'Provinsi',
    unit: 'Persentase sekolah',
    license: 'Belum tersedia',
    version: 'Demo v0.1',
    retrievedAt: 'Belum tersedia',
    sourceUrl: 'https://data.kemendikdasmen.go.id/',
    description: 'Contoh metadata untuk menunjukkan bentuk katalog. Bukan data resmi yang telah diimpor atau diaudit.',
    quality: { missing: 'Belum diaudit', duplicates: 'Belum diaudit', coverage: 'Belum ditetapkan', status: 'Demo' }
  },
  {
    id: 'air-minum-layak-2025',
    title: 'Akses air minum layak',
    publisher: 'Contoh katalog Equora',
    year: '2025',
    educationLevel: 'Semua jenjang',
    regionLevel: 'Provinsi',
    unit: 'Persentase sekolah',
    license: 'Belum tersedia',
    version: 'Demo v0.1',
    retrievedAt: 'Belum tersedia',
    sourceUrl: 'https://data.kemendikdasmen.go.id/',
    description: 'Contoh metadata katalog dengan provenance yang belum diverifikasi ulang pada repository.',
    quality: { missing: 'Belum diaudit', duplicates: 'Belum diaudit', coverage: 'Belum ditetapkan', status: 'Demo' }
  },
  {
    id: 'internet-pengajaran-2025',
    title: 'Sekolah dengan akses internet untuk pengajaran',
    publisher: 'Contoh katalog Equora',
    year: '2025',
    educationLevel: 'Semua jenjang',
    regionLevel: 'Provinsi',
    unit: 'Jumlah sekolah',
    license: 'Belum tersedia',
    version: 'Demo v0.1',
    retrievedAt: 'Belum tersedia',
    sourceUrl: 'https://data.kemendikdasmen.go.id/',
    description: 'Contoh metadata katalog; angka observasi dan ringkasan kualitas belum tersedia.',
    quality: { missing: 'Belum diaudit', duplicates: 'Belum diaudit', coverage: 'Belum ditetapkan', status: 'Demo' }
  }
];
