# Peta Situs, Alur Peran, dan Wireframe

Dokumen ini menjawab aspek **Kejelasan Struktur (Sitemap & Wireframe)** dan **Validasi Alur Pengguna (User Flow)** pada evaluasi FDS Web In Action (WIA) 2026.

Semua rute di bawah sudah diimplementasikan di `frontend/src/routes`. Rute yang membutuhkan data memerlukan backend aktif (`API_BASE_URL`).

## 1. Peta situs

```mermaid
flowchart TD
  subgraph Publik["Akses publik · tanpa login"]
    L["/ · Landing"]
    D["/daerah · Profil daerah"]
    E["/explore · Explorer GIS"]
    R["/regions/:code · Detail wilayah"]
    DS["/datasets · Katalog dataset"]
    DSD["/datasets/:datasetId · Detail dataset"]
    M["/methodology · Metodologi"]
    A["/about · Tentang"]
  end

  subgraph Perencana["Perencana & pemerintah · snapshot tersimpan"]
    S["/studio · Studio simulasi"]
    ST["/studio#skenario-tersimpan · Skenario tersimpan"]
    SC["/scenarios/:id · Hasil skenario"]
    C["/compare · Bandingkan skenario"]
    SR["/scenarios · redirect 307"]
  end

  subgraph Admin["Administrator data · Bearer ADMIN_TOKEN"]
    AD["/admin · Impor & tata kelola data"]
  end

  subgraph Sistem["Sistem & integrasi"]
    H["/health · Liveness web"]
    HR["/health/ready · Kesiapan web + API"]
    AH["/api/health · Liveness API"]
    API["/api/v1/* · Proxy ke FastAPI"]
    SM["/sitemap.xml · Sitemap mesin"]
    RB["/robots.txt · Aturan crawler"]
  end

  L --> D
  L --> E
  L --> M
  L --> A
  D --> R
  E --> R
  E --> DS
  DS --> DSD
  D --> S
  E --> S
  S --> ST
  S --> SC
  ST --> SC
  SC --> C
  SR -.-> ST
  AD --> API
  H --> HR
  HR --> AH
  AH --> API
```

## 2. Alur pengguna per peran

### Masyarakat umum — eksplorasi terbuka

```mermaid
flowchart LR
  A["Landing /"] --> B["Pilih provinsi & jenjang di /daerah"]
  B --> C["Baca indikator & benchmark median"]
  C --> D["Periksa /methodology dan /datasets"]
  D --> E["Buka peta & tabel di /explore"]
  E --> F["Unduh CSV terbuka"]
  C --> G["Buka profil /regions/:code"]
```

Batasan: tanpa login, hanya membaca rilis data aktif, tidak dapat mengubah data dasar.

### Perencana & pemerintah — simulasi kebijakan

```mermaid
flowchart LR
  A["/explore atau /daerah"] --> B["/studio · atur bobot MCDA, anggaran, biaya, kapasitas"]
  B --> C["Hasil skor kebutuhan MCDA & alokasi CP-SAT"]
  C --> D["#peta-urgensi · peta tingkat urgensi & sebaran alokasi"]
  D --> E["Simpan snapshot (release_id)"]
  E --> F["/scenarios/:id · hasil tersimpan"]
  F --> G["/compare · bandingkan dua skenario"]
  G --> H["Unduh Memo Kebijakan PDF"]
```

Batasan: menyimpan snapshot skenario tanpa mengubah data dasar; hasil simulasi bukan keputusan anggaran resmi.

### Administrator data — impor & tata kelola

```mermaid
flowchart LR
  A["/admin"] --> B["Unggah manifest + Bearer ADMIN_TOKEN"]
  B --> C["Verifikasi SHA-256 & skema ETL Polars"]
  C -->|gagal| D["Fail-closed · impor ditolak"]
  C -->|lolos| E["Commit LocalRelease ke PostgreSQL"]
  E --> F["Data tampil di /daerah, /explore, /studio"]
```

Batasan: endpoint `POST /api/v1/admin/import` hanya menerima token admin; berkas yang gagal verifikasi ditolak otomatis.

## 3. Struktur navigasi

| Grup navigasi | Item | Rute |
| --- | --- | --- |
| Publik | Cara Kerja | `/methodology` |
| Publik | Tentang | `/about` |
| Publik | Mulai Eksplorasi (CTA utama) | `/explore` |
| Eksplorasi | Explorer | `/explore` |
| Eksplorasi | Pendidikan di Daerah Saya | `/daerah` |
| Simulasi | Studio simulasi | `/studio` |
| Simulasi | Skenario tersimpan | `/studio#skenario-tersimpan` |
| Simulasi | Bandingkan | `/compare` |
| Referensi | Metodologi | `/methodology` |
| Referensi | Katalog dataset | `/datasets` |
| Area terbatas | Impor data | `/admin` |

Sumber kebenaran navigasi: `frontend/src/lib/api/workspace.ts` (`publicNavLinks`, `workspaceNavGroups`) dan `frontend/src/lib/components/WorkspaceShell.svelte`.

## 4. Wireframe & mockup

| Halaman | Aset | Blok utama | Aksi utama |
| --- | --- | --- | --- |
| Landing `/` | [`wireframe_equora.png`](wireframe_equora.png), [`wireframe_preview.html`](wireframe_preview.html) | Header, hero, alur 3 langkah, blok skenario, kartu peran, sumber indikator, metode | `/daerah`, `/explore` |
| Profil daerah `/daerah` | Screenshot di deck presentasi | Filter provinsi & jenjang, kartu indikator, benchmark median, tabel pembanding, tautan sumber | `/regions/:code`, `/studio` |
| Explorer GIS `/explore` | Screenshot di deck presentasi | Peta choropleth, legenda, filter indikator/wilayah, tabel provinsi, ekspor CSV | `/regions/:code`, `/studio` |
| Studio `/studio` & `/scenarios/:id` | Screenshot di deck presentasi | Panel bobot MCDA, anggaran & kapasitas, ringkasan hasil, `#peta-urgensi` | Simpan snapshot, `/compare` |
| Admin `/admin` | Screenshot di deck presentasi | Unggah manifest, log audit ETL, matriks peran & keamanan | `POST /api/v1/admin/import` |

Wireframe interaktif: buka [`wireframe_preview.html`](wireframe_preview.html) di browser. Versi gambar: [`wireframe_equora.png`](wireframe_equora.png). Tangkapan layar tiap halaman tersedia di deck presentasi submisi.

## 5. Catatan konsistensi

- `/scenarios` bukan halaman mandiri; ia mengalihkan (307) ke `/studio#skenario-tersimpan`.
- Rute `/health` memeriksa server web, sedangkan `/health/ready` dan `/api/health` memeriksa koneksi ke backend.
- Peta menggunakan agregat **provinsi**, bukan titik lokasi sekolah individual.
- Semua fitur publik dapat diakses tanpa login; fitur berbasis data memerlukan backend dan rilis lokal yang aktif.
