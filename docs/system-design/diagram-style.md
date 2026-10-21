# Gaya diagram Equora

Sumber: `docs/DESIGN_Equora.md` v1.2 Clean Education Blue, dikonfirmasi pengguna pada 20 Oktober 2026. Gaya ini berlaku untuk artefak Equora; file gaya bawaan skill tidak diubah. Tanggal status arsitektur pada gambar tetap 19 Oktober karena perubahan ini hanya tema, bukan perubahan implementasi komponen.

| Peran | Nilai | Dasar |
|---|---|---|
| Canvas halaman | `#F3F5F8` | Token bg |
| Paper diagram | `#FFFFFF` | Token surface |
| Paper sekunder | `#F5F8FC` | Token surface-subtle |
| Ink | `#1F2D3D` | Token text |
| Muted dan label teknis | `#536276` | Token text-secondary |
| Accent | `#1264D8` | Token primary |
| Accent tint | `#EAF3FF` | Token primary-tint |
| Rule dekoratif | `#DCE4EE` | Token border |
| Link HTTP | `#205F9A` | Token info |

Judul dan nama komponen memakai Inter. Label teknis memakai Geist Mono karena baseline proyek tidak menetapkan font monospace; ini mengikuti fallback peran teknis skill diagram-design. Font publik dimuat dari Google Fonts; fallback sistem tetap dideklarasikan. Node diagram tetap radius 6px dan tanpa bayangan agar hubungan terlihat jelas pada ukuran cetak. Biru menyorot batas API dan optimasi, bukan menandai kondisi berhasil atau kebutuhan tinggi. Garis putus-putus serta label teks menandai bagian yang belum diimplementasikan atau belum diisi.

Preset HTML: fit, viewBox 960 x 492, satu diagram statis dengan tujuh node dan enam konektor ortogonal. Kanvas disesuaikan dengan rasio slot gambar template supaya dokumen Word mempertahankan ukuran gambar tanpa merentangkan diagram. Label teknis diperbesar agar tetap terbaca pada dokumen.
