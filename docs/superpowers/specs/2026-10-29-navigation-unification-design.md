# Desain penyatuan navigasi Equora

## Tujuan

Navbar pada landing dan sidebar pada dashboard harus membantu pengguna mengikuti
alur produk yang sama tanpa menampilkan tujuan atau endpoint teknis dua kali.
Menu harus mengikuti urutan penggunaan:

1. Daerah Saya
2. Explorer
3. Studio
4. Perbandingan
5. Dataset
6. Metodologi
7. Tentang

## Desain yang disetujui

### Sumber navigasi bersama

Satu konfigurasi navigasi menjadi sumber kebenaran untuk `PublicShell` dan
`WorkspaceShell`. Setiap item memiliki label, URL, dan ikon yang konsisten.
Komponen tidak boleh mendefinisikan daftar tujuan yang sama secara terpisah.

Endpoint API, route health check, route admin, dan identifier detail tidak
ditampilkan sebagai menu pengguna. Admin tetap dapat diakses melalui mekanisme
pengelolaan lokal yang tidak menjadi bagian navigasi publik utama.

### Navbar landing

Navbar landing menampilkan tujuh tujuan dalam urutan yang disetujui. Pada layar
sempit, tujuan tersebut berada di dalam satu menu mobile. Tidak ada dropdown
yang mengulang item yang juga ditampilkan sebagai link utama.

### Sidebar dashboard

Sidebar dashboard memakai konfigurasi tujuh tujuan yang sama. Sidebar hanya
menambahkan status aktif dan tidak mengulang menu melalui bagian “Referensi”,
shortcut Studio, atau daftar kedua di topbar.

Topbar dashboard dipertahankan untuk identitas konteks: breadcrumb halaman,
status workspace, dan kontrol menu mobile. Topbar bukan sumber navigasi kedua.

### Detail route dan alur

- `/regions/...` dan halaman detail terkait ditandai sebagai bagian dari
  **Explorer**.
- `/scenarios/...` dan halaman detail terkait ditandai sebagai bagian dari
  **Studio**.
- Halaman anak tetap dapat dibuka dari daftar atau tombol kontekstual, tetapi
  tidak mendapat item baru di navbar/sidebar.
- Urutan pengguna yang ditonjolkan adalah data → simulasi → perbandingan;
  Dataset, Metodologi, dan Tentang menjadi tujuan pendukung dalam struktur yang
  sama.

## Perilaku responsif dan aksesibilitas

Navbar desktop dan sidebar desktop menggunakan label yang sama. Pada mobile,
masing-masing konteks memiliki satu kontrol menu yang jelas, fokus tetap
terperangkap saat menu terbuka, Escape menutup menu, dan fokus kembali ke tombol
pembuka.

Setiap item aktif memiliki `aria-current="page"` hanya pada tujuan yang cocok.
Route detail mewarisi item induknya, sehingga pengguna tidak kehilangan konteks.

## Kriteria penerimaan

- Tujuh tujuan utama muncul dalam urutan yang sama pada landing dan dashboard.
- Tidak ada tujuan yang sama ditampilkan dua kali dalam satu konteks navigasi.
- Tidak ada endpoint teknis/API di navbar atau sidebar pengguna.
- Route detail tetap memiliki penanda menu induk yang benar.
- Navigasi mobile, keyboard, Escape, dan focus return tetap berfungsi.
- Link landing ke dashboard dan perpindahan antarhalaman mempertahankan struktur
  menu yang sama.
- Pemeriksaan Svelte, unit test navigasi, dan build frontend lulus.

## Di luar cakupan

Perubahan ini tidak menambah login, akun pengguna, route baru, perubahan API,
perubahan rumus simulasi, atau perubahan model data.
