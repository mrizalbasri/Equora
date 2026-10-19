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

http://localhost:5173/ saat ini mengembalikan JSON status fondasi. Halaman produk belum dibuat. `/health` memeriksa server web; `/api/health` memeriksa koneksi server web ke liveness backend dan mengembalikan 503 jika backend tidak tersedia. `API_BASE_URL` hanya dipakai server, sehingga tidak mengirim alamat internal lewat konfigurasi browser.

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

Playwright saat ini memeriksa endpoint HTTP dari hasil build dan tidak memerlukan browser binary. Tes browser untuk alur produk ditambahkan bersama halaman produknya.

`src/lib/api/schema.d.ts` dihasilkan dari `backend/openapi.json`. Setelah backend mengekspor schema baru:

```powershell
pnpm generate:api
pnpm check:api
```

Konfigurasi SvelteKit berada di `vite.config.ts` (didukung sejak 2.62), dan alias internal menggunakan `#lib/*`. Lihat [panduan konfigurasi resmi](https://svelte.dev/docs/kit/migrating-to-sveltekit-3).
