# QA E2E Readiness

## Ringkasan

Pemeriksaan dilakukan pada branch `test/e2e-readiness` yang berbasis
`origin/main` pada commit `f468ad4b7a85f26912bbbe9ad6d692258c9a2f6d`.
Tujuannya adalah memetakan alur demo yang benar-benar tersedia di branch utama,
bukan menganggap branch atau PR yang belum di-merge sebagai bagian dari build
rilis.

## Lingkungan

| Field | Isi |
|---|---|
| Build / commit | `f468ad4b7a85f26912bbbe9ad6d692258c9a2f6d` |
| URL | Preview lokal Playwright pada `http://127.0.0.1:4173` |
| Runtime | Node.js 24, pnpm 11.18.0 |
| Browser / viewport | Playwright request checks; tidak ada browser UI atau viewport karena test foundation berbasis HTTP |
| Data | Tidak ada data release; hanya status foundation |
| Tanggal | 20 Oktober 2026 |

## Kasus uji

| ID / fitur | Prasyarat | Langkah | Ekspektasi | Hasil aktual | Status | Tindak lanjut |
|---|---|---|---|---|---|---|
| E2E-01 / root foundation | Frontend berhasil dibuild | Jalankan `pnpm test:e2e` dan GET `/` | Root mengembalikan status foundation yang valid | JSON `service: Equora frontend`, `status: ok`, `stage: foundation` | Lulus | Tidak ada |
| E2E-02 / health route | Frontend berhasil dibuild | Jalankan `pnpm test:e2e` dan GET `/health` | Health route mengembalikan status `ok` | JSON `{ "status": "ok" }` | Lulus | Tidak ada |
| E2E-03 / landing page | Route produk tersedia di `main` | Periksa route inventory dan jalankan build | Landing page HTML tersedia | `main` masih mengembalikan JSON foundation; halaman landing belum tersedia di branch ini | Terblokir | Menunggu PR landing/about di-merge |
| E2E-04 / dataset catalog | Route katalog tersedia di `main` | Periksa route inventory | `/datasets` dan detail dataset dapat dibuka | Route belum tersedia di `main` | Terblokir | Menunggu PR dataset catalog di-merge |
| E2E-05 / methodology | Route metodologi tersedia di `main` | Periksa route inventory | `/methodology` dapat dibuka dan anchor utamanya tersedia | Route belum tersedia di `main` | Terblokir | Menunggu PR methodology di-merge |
| E2E-06 / explorer dan detail wilayah | API/data release tersedia | Periksa sitemap dan route inventory | Filter, tabel, detail wilayah, provenance, dan ekspor dapat diuji | Belum ada route, API data, atau release produksi | Terblokir | Menunggu owner menyelesaikan data/API/integrasi |
| E2E-07 / scenario, compare, export | Kontrak scenario tersedia | Periksa sitemap dan route inventory | Skenario dapat dibuat, dibandingkan, dan diekspor | Belum ada route atau kontrak integrasi | Terblokir | Menunggu owner menyelesaikan integrasi Scenario Studio |
| E2E-08 / mobile, keyboard, loading/error | Halaman produk dan state UI tersedia | Uji viewport 360px, fokus keyboard, loading/empty/error | Alur produk dapat dipakai secara responsif dan aksesibel | Belum dapat dijalankan karena route produk belum ada di `main` | Terblokir | Uji ulang setelah route dan API tersedia |

## Validasi baseline

Perintah berikut dijalankan dari folder `frontend/` sesuai dokumentasi:

```text
pnpm check
svelte-check found 0 errors and 0 warnings

pnpm test
1 test file passed, 2 tests passed

pnpm build
Build berhasil

pnpm test:e2e
1 passed
```

## Keterbatasan dan narasi demo

1. Hasil ini menggambarkan `main` saat pemeriksaan dilakukan; PR yang masih
   terbuka tidak dihitung sebagai build terintegrasi.
2. Lulus pada root dan health hanya membuktikan fondasi web, bukan lulusnya
   alur produk.
3. Belum ada screenshot produk, browser viewport test, API data, data release,
   explorer, scenario, compare, atau ekspor yang dapat dibuktikan dari `main`.
4. Setelah PR fitur di-merge dan kontrak API/data tersedia, kasus terblokir
   harus dijalankan ulang dengan browser, viewport 360px/desktop, keyboard,
   loading/empty/error, provenance, dan atribut sumber.

Narasi demo yang aman saat ini hanya mencakup status fondasi dan health check.
Narasi landing, katalog, metodologi, explorer, scenario, compare, dan export
belum boleh dipresentasikan sebagai alur `main` sampai hasil integrasi dan
pengujian ulang tersedia.
