# Menyiapkan staging dan produksi

Hosting dan domain belum dipilih. Konfigurasi ini adalah bahan deployment,
bukan bukti aplikasi sudah online. Akses pembaca tetap publik tanpa akun.

## Gerbang data

`REQUIRE_PUBLISHED_DATA=true` wajib pada deployment publik. Mode ini menolak
rilis `local_review`, menyembunyikan daftar skenario dari rilis yang belum
diterbitkan, dan menolak pembacaan snapshot rilis tersebut. Readiness juga gagal
hingga rilis terbaru diterbitkan. Lokal tetap memakai `false` untuk review.

Sebelum penerbitan, catat untuk setiap dataset dan boundary: tautan sumber,
tanggal perolehan, hash, periode/jenjang/satuan, ketentuan penggunaan,
bukti peninjauan dan penanggung jawab. Jangan mengganti status menjadi
`published` hanya agar health check hijau. Persetujuan data aktual belum tersedia;
tidak ada perintah publikasi otomatis dalam paket ini.

## Konfigurasi deployment

Template [Compose produksi](../compose.production.yaml) menyediakan API dan
frontend Node dengan health check, restart policy, port web loopback dan volume
data baca-saja. PostgreSQL dikelola terpisah dan harus persisten. Gunakan role
runtime berizin minimum dan role migrasi tersendiri; jangan memakai superuser
database untuk aplikasi publik.

Simpan variabel ini pada secret store hosting atau berkas privat di luar Git:

- `DATABASE_URL`: URL PostgreSQL dengan driver `postgresql+psycopg` yang dapat
  dijangkau container API; gunakan TLS sesuai layanan database.
- `ADMIN_TOKEN`: token admin yang disediakan pengelola.
- `PUBLIC_ORIGIN`: origin HTTPS domain final tanpa path.
- `EQUORA_DATA_DIR`: direktori absolut data yang sudah disetujui.
- `WRITE_REQUESTS_PER_MINUTE`: default 60 POST per menit per proses API.
- `MAX_SAVED_SCENARIOS`: default 10.000 snapshot; penyimpanan baru ditolak
  setelah penuh, data lama tidak otomatis dihapus.

Validasi tanpa mencetak konfigurasi berisi secret:

```powershell
docker compose --env-file <private-env-path> -f compose.production.yaml config --quiet
docker compose --env-file <private-env-path> -f compose.production.yaml build
```

Siapkan reverse proxy HTTPS di depan port web. Jangan mengekspos port API atau
database ke Internet. Terapkan batas request per pengunjung dan batas koneksi
pada ingress yang dipercaya. Batas aplikasi bersifat per proses, tidak
terdistribusi, dan tidak menjamin pembagian adil antar pengguna. API tidak
mempercayai header IP pengunjung dari klien.

## Rilis dan pemeriksaan

1. Backup database dan verifikasi pemulihan sebelum migrasi.
2. Bangun image dengan tag commit unik; simpan image versi sebelumnya.
3. Jalankan `alembic upgrade head` menggunakan role migrasi pada target staging
   yang benar, lalu periksa skema dan rilis. Jangan menjalankan migrasi pada
   database yang belum diverifikasi identitasnya.
4. Jalankan API/web dan pantau readiness. `/health` frontend dan
   `/api/v1/health/live` backend hanya membuktikan proses hidup.
   `/health/ready` frontend dan `/api/v1/health/ready` backend membuktikan koneksi,
   versi migrasi, ketersediaan rilis dan gerbang publikasi.
5. Jalankan smoke test berikut. Tanpa `--write` hanya membaca; dengan `--write`
   membuat dua skenario bersama berlabel verifikasi, bukan data pribadi.

```powershell
backend/.venv/Scripts/python.exe scripts/smoke_api.py --base-url http://127.0.0.1:18000
backend/.venv/Scripts/python.exe scripts/smoke_api.py --base-url http://127.0.0.1:18000 --write
```

Perintah memakai API langsung. Pada domain staging, ulangi alur melalui browser
untuk membuktikan reverse proxy, origin, sumber peta, unduhan, dan HTTPS.
Periksa ulang snapshot setelah restart API/web. Uji token impor yang salah tanpa
menjalankan impor data produksi.

## Backup dan restore

Untuk container PostgreSQL lokal yang sudah ada:

```powershell
backend/.venv/Scripts/python.exe scripts/backup_database.py --output tmp/backups/equora-unique.dump --verify-restore
```

Script mengekspor database `equora` melalui `pg_dump` di dalam `postgres-local`.
Ia menolak menimpa dump, menyimpan manifest, dan memverifikasi restore di database
baru `equora_restorecheck_<uuid>`. Hanya database sementara yang baru dibuat itu
yang dibersihkan. Database aplikasi dan `equora_test` tidak menjadi target restore.
Validasi mencakup versi migrasi dan jumlah rilis/skenario, bukan seluruh invariant
domain. Jeda penyimpanan skenario ketika menguji kesamaan jumlah baris.

Untuk hosting terkelola gunakan fasilitas backup/PITR provider dan uji pemulihan
ke instance terpisah. Tetapkan jadwal, retensi, enkripsi, lokasi di luar host,
penanggung jawab, RPO dan RTO sebelum go-live. Dump lokal yang berhasil belum
menjadi backup terjadwal di luar host.

Snapshot bersifat publik dan disimpan hingga ditinjau pengelola atau kapasitas
penuh. Tidak ada penghapusan otomatis pada patch ini. Buat kebijakan retensi
yang terlihat pengguna sebelum rilis publik; arsip/penghapusan perlu backup dan
otorisasi atas data yang terdampak.

## Monitoring dan pemulihan gangguan

Pada hosting yang dipilih, hubungkan readiness ke routing dan monitor eksternal.
Alert harus mencakup readiness non-200, lonjakan 5xx/429, ruang disk/database,
kegagalan backup dan umur backup terakhir. Simpan log terstruktur yang cukup
untuk diagnosis, tanpa token, URL database atau parameter pribadi.
Tidak ada integrasi pengiriman alert yang dikonfigurasi sebelum layanan dipilih.

Saat rilis gagal, hentikan trafik tulis dan gunakan image commit sebelumnya
jika kompatibel dengan skema. Jangan otomatis downgrade migrasi: downgrade
`0003` menghapus rilis dan snapshot. Untuk perubahan skema yang tidak kompatibel,
pulihkan backup ke target terpisah, verifikasi, kemudian alihkan koneksi secara
terencana. Uji kapasitas sesuai jumlah pengguna sasaran sebelum membuka publik.
