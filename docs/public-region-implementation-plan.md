# Rencana implementasi Pendidikan di Daerah Saya

23 Oktober 2026. Acuan: [rancangan yang disetujui](superpowers/specs/2026-10-23-pendidikan-daerah-saya-design.md).

1. Tambahkan parameter opsional `release_id` pada workspace, daftar provinsi dan
   profil provinsi. Sertakan periode serta status rilis pada profil.
2. Buat helper interpretasi nilai dan kompatibilitas perbandingan dengan tes
   untuk missing, nol, denominator nol dan perbedaan periode/definisi.
3. Bangun alur `/daerah`: pilih provinsi/jenjang, penjelasan kondisi, pembanding
   dan sumber. Pertahankan detail teknis `/regions/[code]` dengan tautan ke alur
   publik yang membawa rilis yang sama.
4. Simpan konteks pada URL, sediakan ringkasan berbagi serta fallback clipboard.
   Bawa jenjang dan rilis yang sama ke Studio; jelaskan cakupan simulasinya.
5. Tambahkan akses dari beranda, navigasi publik/workspace dan Explorer.
6. Verifikasi tipe, kontrak API, build, backend dan alur browser pada mobile serta
   desktop, termasuk respons terlambat, error/retry, keyboard dan tautan berbagi.

Perubahan workspace lain yang telah ada tetap dipertahankan. Status rilis lokal
tetap berlabel review; implementasi fitur tidak menerbitkan data atau hosting.
