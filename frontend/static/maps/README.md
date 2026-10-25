# Basemap Indonesia

`indonesia.pmtiles` adalah subset Protomaps Basemap 4.15.2, dari build
`20261021.pmtiles` (data OSM sampai 21 Oktober 2026 04:00 UTC).
Cakupan bbox `94,-12,142,7`, zoom 0–7. Ukuran 3.246.304 byte.
Archive berisi tiles yang beririsan dengan bbox, bukan geometri yang dipotong
persis pada batas Indonesia. Ini bukan sumber batas atau indikator pendidikan.

© [OpenStreetMap contributors](https://www.openstreetmap.org/copyright),
[Protomaps](https://protomaps.com/), dan
[Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/).
Protomaps mendistribusikan basemap sebagai Produced Work di bawah
[ODbL](https://opendatacommons.org/licenses/odbl/1-0/).

Sprite grayscale berasal dari `protomaps/basemaps-assets`, commit
`028c18f713baecad011301ff7a69acc39bcc2ae7`, direktori `sprites/v4/`.
Sprite berasal dari [tangrams/icons](https://github.com/tangrams/icons),
berlisensi MIT; lihat `sprites/LICENSE.md`.
Font glyph Noto Sans masih dimuat dari commit yang sama di GitHub saat runtime,
dengan [SIL Open Font License](https://raw.githubusercontent.com/protomaps/basemaps-assets/028c18f713baecad011301ff7a69acc39bcc2ae7/fonts/OFL.txt).

Hash archive, URL asal, versi style, dan hash sprite dicatat dalam
`data/metadata/basemap-local.json` di root proyek.

Reproduksi dengan CLI `go-pmtiles` versi 1.31.2, dari folder frontend:

```sh
pmtiles extract https://build.protomaps.com/20261021.pmtiles indonesia.pmtiles --bbox=94,-12,142,7 --maxzoom=7
```

Daily build upstream memiliki retensi terbatas. Simpan archive subset yang
disertakan di repositori; pembaruan ke build lain harus memperbarui manifest
dan menjalankan kembali pengujian. Browser membaca archive lokal melalui HTTP
Range; tidak melakukan hotlink ke bucket unduhan Protomaps.
