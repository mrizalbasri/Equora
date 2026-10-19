# Gaya diagram Equora

Sumber: `docs/DESIGN_Equora.md`, dikonfirmasi pengguna pada 19 Oktober 2026. Gaya ini berlaku untuk artefak Equora; file gaya bawaan skill tidak diubah.

| Peran | Nilai | Dasar |
|---|---|---|
| Canvas halaman | `#E7E8EA` | Token bg |
| Paper diagram | `#F9F9FA` | Token surface |
| Paper sekunder | `#F0F1F2` | Token surface-subtle |
| Ink | `#24262B` | Token text |
| Muted dan label teknis | `#555C65` | Token text-secondary |
| Accent | `#C94025` | Token primary |
| Accent tint | `#F7E4DF` | Token primary-tint |
| Rule dekoratif | `#CFD2D6` | Token border |
| Link HTTP | `#2E668C` | Token info |

Judul dan nama komponen memakai Inter. Label teknis memakai Geist Mono karena baseline proyek tidak menetapkan font monospace; ini mengikuti fallback peran teknis skill diagram-design. Font publik dimuat dari Google Fonts; fallback sistem tetap dideklarasikan. Node dibatasi radius 6px dan tanpa bayangan agar hubungan tetap jelas. Coral hanya menyorot batas API dan optimasi. Garis putus-putus serta label teks menandai bagian yang belum diimplementasikan atau belum diisi.

Preset HTML: fit, viewBox 960 x 492, satu diagram statis dengan tujuh node dan enam konektor ortogonal. Kanvas disesuaikan dengan rasio slot gambar template supaya dokumen Word mempertahankan ukuran gambar tanpa merentangkan diagram. Label teknis diperbesar agar tetap terbaca pada dokumen.
