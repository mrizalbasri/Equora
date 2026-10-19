# Pembagian kerja dua orang

Sebelum mulai, baca [aturan kontributor](ATURAN-KONTRIBUTOR.md): batas file, branch/PR, review, pengujian dan keamanan repository publik.

Disepakati pengguna pada 19 Oktober 2026: pemilik project (kamu) memegang pekerjaan utama, teman memegang fitur pendukung dengan kompleksitas terbatas. Nama anggota dan kapasitas jam belum dicatat. Fondasi backend/frontend sudah tersedia; halaman produk dan engine belum diimplementasikan. Mulai dari [panduan mengambil fondasi](MULAI-NGODING.md).

Perkiraan beban: **75-80% pemilik / 20-25% teman** berdasarkan kompleksitas, integrasi, dan tanggung jawab. Ini perkiraan scope, bukan pengukuran jam atau jumlah fitur. Teman memiliki kemampuan full-stack; pembagian dibuat untuk mengurangi ketergantungan dan risiko, bukan berdasarkan anggapan bahwa dia pemula.

## Siapa mengerjakan apa

| PIC | Paket | Alasan |
|---|---|---|
| Kamu | [Sistem inti dan integrasi](pemilik/README.md) | Data, rumus dan constraint saling terkait; satu penanggung jawab menjaga konsistensi |
| Teman | [01 Landing dan About](teman/01-landing-about/README.md) | Halaman publik dengan logika terbatas, bisa disiapkan sebelum engine selesai |
| Teman | [02 Katalog dataset](teman/02-katalog-dataset/README.md) | Fitur baca data dengan kontrak jelas, tanpa pipeline import atau database |
| Teman | [03 Metodologi](teman/03-metodologi/README.md) | Menyajikan rumus dan batasan yang sudah kamu tetapkan |
| Teman | [04 QA dan bukti demo](teman/04-qa-demo/README.md) | Pemeriksaan oleh orang kedua membantu menemukan masalah alur dan tampilan |

## Urutan mulai

1. Kamu menetapkan app shell, tokens/desain bersama, komponen dasar, struktur route dan kontrak katalog. Setup mengikuti [PRD](../PRD_Equora.md) dan [desain](../DESIGN_Equora.md).
2. Teman mulai landing/about. Sebelum shell tersedia, dia bisa menyiapkan outline konten dan daftar aset/sumber tanpa membuat aplikasi kedua.
3. Kamu memberikan contoh kontrak katalog. Teman membangun katalog dengan fixture sintetis berlabel, lalu menghubungkannya ke API setelah tersedia.
4. Kamu memberikan naskah formula, contoh perhitungan, kebijakan missing dan batasan. Teman membuat halaman metodologi.
5. Teman menguji setiap fitur yang sudah berjalan; QA alur lengkap dilakukan setelah integrasi.

Paket 01 didahulukan untuk First Draft; paket lainnya mengikuti kesiapan input. Tidak ada deadline baru yang ditetapkan tanpa kapasitas kerja aktual. Jadwal kompetisi/usulan internal tetap mengacu pada [project plan](../project-plan.md).

## Aturan bekerja bersama

- Satu branch per paket: `feat/landing-about`, `feat/dataset-catalog`, `feat/methodology`, dan `test/demo-qa`. Branch dibuat saat pengerjaan dimulai, bukan oleh dokumen ini.
- Tiap paket mencantumkan lokasi kode di `frontend/`; folder route dan komponen fitur dibuat saat paket tersebut dikerjakan.
- Teman memiliki kode halaman paketnya. Kamu memiliki layout global, navigasi, tokens/komponen bersama, konfigurasi dependensi, kontrak/API dan integrasi. Perubahan lintas kepemilikan dibahas sebelum diedit agar tidak bentrok.
- Jika kontrak API kurang, teman melaporkan kebutuhan field; jangan mengubah schema atau menambahkan backend sendiri di paket UI.
- Teman memperbaiki bug di halaman miliknya; bug engine/API/peta ditangani kamu. QA tidak berarti semua perbaikan menjadi tugas teman.
- Setelah satu paket selesai, ajukan PR dengan ringkasan, screenshot, cara uji dan keterbatasan. Kamu review kesesuaian sumber/kontrak lalu integrasikan.
- Tidak ada akun admin, impor data, geolocation, routing peta, RAG atau fitur baru yang otomatis menjadi tugas teman.

## Kriteria serah terima bersama

- [ ] Route dan interaksi sesuai paket; tidak ada tautan atau tombol palsu.
- [ ] Data fixture terlihat sebagai demo dan tidak dipresentasikan sebagai sumber resmi.
- [ ] Layout diperiksa pada lebar 360px dan desktop; navigasi keyboard/fokus diperiksa.
- [ ] Pemeriksaan build/type/lint yang tersedia pada skeleton dijalankan; hasil aktual dicatat. Jika belum tersedia, laporkan belum diuji.
- [ ] Screenshot dan langkah uji dilampirkan tanpa token/data sensitif.
- [ ] Pemilik meninjau hasil dan mengintegrasikan; checklist tidak dicentang sebelum bukti tersedia.
