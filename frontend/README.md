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

Route `/datasets` dan `/datasets/[datasetId]` menampilkan fixture berlabel, pencarian dan metadata; `/methodology` menjelaskan rumus dan batas sandbox. Keduanya dapat dicapai dari footer Landing/About. Pratinjau hero hanya contoh antarmuka, belum hasil data atau solver. Internet/komputer masih memerlukan denominator untuk proporsi; bobot contoh pada hero bukan konfigurasi engine.

Tema publik mengikuti [DESIGN v1.2 Clean Education Blue](../docs/DESIGN_Equora.md): latar abu-abu sangat muda, panel putih, tombol biru dan ilustrasi sekolah SVG lokal. Token, frame publik dan status ketersediaan dipakai bersama oleh Landing/About. Katalog/detail/metodologi masih memiliki CSS lama; penyatuan shell/token tercatat di [backlog](../docs/implementation-readiness.md). Tidak ada aset font/gambar eksternal yang harus diunduh agar halaman tampil.

ECharts, MapLibre dan PMTiles sudah menjadi dependensi, tetapi grafik, peta, basemap, boundary dan dataset belum dimuat. Integrasi tersebut mengikuti audit data/lisensi dan desain produk.

Frontend dijalankan langsung melalui pnpm. Isi `API_BASE_URL` pada `.env` sesuai port backend, misalnya `http://localhost:18000` untuk konfigurasi lokal mesin ini.

## Akun Clerk

Halaman `/sign-in`, `/sign-up`, dan `/account` terhubung ke Clerk. Tombol Masuk
atau Akun saya/Keluar tersedia pada navigasi publik dan workspace. Halaman akun
memverifikasi cookie sesi di server; login tidak otomatis memberikan izin impor
admin. Eksplorasi publik dan simulasi yang sudah ada tetap tersedia tanpa login.

Keys development disimpan pada `.env.local` yang diabaikan Git. Jalankan Clerk
CLI dari folder `frontend` untuk menarik keys, lalu tambahkan
`PUBLIC_CLERK_PUBLISHABLE_KEY` dan `CLERK_AUTHORIZED_PARTIES` sesuai
[panduan autentikasi](../docs/clerk-auth.md). Jangan menyalin secret ke variabel
berawalan `PUBLIC_` atau `VITE_`.

Tes verifikasi JWT berjalan melalui `pnpm test`. Tes Clerk nyata memerlukan
instance development serta opt-in berikut, setelah `pnpm build`:

```powershell
$env:EQUORA_CLERK_LIVE='1'
node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/clerk-auth.live.spec.ts --workers=1
```

Tes membuat akun sintetis melalui UI, memakai kode verifikasi khusus testing
Clerk, dan menghapus akun sintetis setelah pengujian. `CLERK_AUTHORIZED_PARTIES`
harus mencakup origin preview `http://127.0.0.1:4173` untuk tes tersebut.

## Pemeriksaan dan kontrak

```powershell
pnpm check
pnpm test
pnpm check:api
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

Tes E2E menggunakan Playwright pada hasil build. Jalankan `pnpm exec playwright install chromium` sekali sebelum tes lokal; workflow GitHub Actions mengunduh Chromium secara otomatis dengan dependensi sistemnya. Pada Windows dengan Microsoft Edge terpasang, dapat memakai `$env:PLAYWRIGHT_CHANNEL = 'msedge'`. Screenshot disimpan pada `test-results/` (diabaikan Git). CI memasang Chromium sebelum tes. Jalankan `pnpm build` terlebih dahulu; tes memakai preview hasil build.

`src/lib/api/schema.d.ts` dihasilkan dari `backend/openapi.json`. Setelah backend mengekspor schema baru:

```powershell
pnpm generate:api
pnpm check:api
```

Konfigurasi SvelteKit berada di `vite.config.ts` (didukung sejak 2.62), dan alias internal menggunakan `#lib/*`. Lihat [panduan konfigurasi resmi](https://svelte.dev/docs/kit/migrating-to-sveltekit-3).
