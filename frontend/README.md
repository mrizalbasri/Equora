# Frontend Equora

Fondasi SvelteKit 2.70, Svelte 5, TypeScript 5.9, Tailwind CSS 4, ECharts, MapLibre GL JS dan PMTiles. Node.js 24 dan pnpm 11.18.0 diperlukan. Versi pnpm ditetapkan di `packageManager`, dan versi paket dikunci di `pnpm-lock.yaml`. SvelteKit 2 dipakai karena generator OpenAPI saat setup masih mensyaratkan TypeScript 5, sedangkan SvelteKit 3 memerlukan TypeScript 6.

## Development

Jalankan dari folder `frontend/`:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
```

Jangan menimpa `.env` yang sudah disesuaikan. Untuk macOS/Linux, ganti `Copy-Item` dengan `cp`.

Jika pnpm belum tersedia, aktifkan versi proyek melalui Corepack:

```powershell
corepack enable
corepack prepare pnpm@11.18.0 --activate
```

Gunakan pnpm untuk semua operasi frontend. Konfigurasi override dependency berada di `pnpm-workspace.yaml`. Saat menambah paket, gunakan `pnpm add` atau `pnpm add -D`, lalu commit perubahan manifest dan lockfile bersama.

Alternatif dari root dengan PowerShell: `.\scripts\equora.ps1 frontend`. Perintah gabungan tersedia di [panduan scripts](../scripts/README.md).

http://localhost:5173/ menampilkan landing page dan `/about` menjelaskan tujuan proyek. Landing menjelaskan perbandingan akses fasilitas pendidikan, alur simulasi, calon sumber, dan batas metode. Explorer/studio belum tersedia; CTA menuju penjelasan pada halaman yang sama. Tidak ada statistik atau hasil alokasi rekaan. `/health` memeriksa server web; `/api/health` memeriksa koneksi server web ke liveness backend dan mengembalikan 503 jika backend tidak tersedia. `API_BASE_URL` hanya dipakai server, sehingga tidak mengirim alamat internal lewat konfigurasi browser.

Tema publik mengikuti [DESIGN v1.2 Clean Education Blue](../docs/DESIGN_Equora.md): latar abu-abu sangat muda, panel putih, tombol biru dan ilustrasi sekolah SVG lokal. Token, frame publik dan status ketersediaan dipakai bersama oleh Landing/About. Tidak ada aset font/gambar eksternal yang harus diunduh agar halaman tampil.

ECharts, MapLibre dan PMTiles sudah menjadi dependensi, tetapi grafik, peta, basemap, boundary dan dataset belum dimuat. Integrasi tersebut mengikuti audit data/lisensi dan desain produk.

Frontend dijalankan langsung melalui pnpm. Isi `API_BASE_URL` pada `.env` sesuai port backend, misalnya `http://localhost:18000` untuk konfigurasi lokal mesin ini.

## Pemeriksaan dan kontrak

```powershell
pnpm check
pnpm test
pnpm check:api
pnpm build
pnpm test:e2e
```

Playwright memeriksa HTML landing, health, interaksi, keyboard, serta overflow pada lebar 360/390/768/1024/1440px. Pasang browser dengan `pnpm exec playwright install chromium` sebelum `pnpm test:e2e`. Pada Windows dengan Microsoft Edge terpasang, dapat memakai `$env:PLAYWRIGHT_CHANNEL = 'msedge'`. Screenshot disimpan pada `test-results/` (diabaikan Git). CI memasang Chromium sebelum tes. Jalankan `pnpm build` terlebih dahulu; tes memakai preview hasil build.

`src/lib/api/schema.d.ts` dihasilkan dari `backend/openapi.json`. Setelah backend mengekspor schema baru:

```powershell
pnpm generate:api
pnpm check:api
```

Konfigurasi SvelteKit berada di `vite.config.ts` (didukung sejak 2.62), dan alias internal menggunakan `#lib/*`. Lihat [panduan konfigurasi resmi](https://svelte.dev/docs/kit/migrating-to-sveltekit-3).
