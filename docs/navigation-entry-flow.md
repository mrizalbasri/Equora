# Local navigation and entry flow

The public header previously linked primarily to landing-page sections. Studio
was available through a conditional preview, and the methodology page used a
different menu. This made working pages difficult to discover from the entry page.

The public header now consistently links to Explorer, Studio simulasi,
Perbandingan, Katalog dataset, Metodologi, and Tentang Equora. Landing-page section
links remain in a separate navigation labelled “Di beranda ini”.

## Paths through the application

| User intention | Entry | Next step |
| --- | --- | --- |
| Read education data | Explorer | Choose a province, then open its detail and sources |
| Inspect provenance | Katalog dataset | Choose a dataset to read its metadata and quality |
| Test allocation assumptions | Studio simulasi | Set scope, weights and budget; calculate and save a snapshot |
| Reopen a result | Buka skenario tersimpan | Jump to the saved list in Studio and choose a snapshot |
| Compare results | Perbandingan | Choose two saved snapshots |
| Understand calculations | Metodologi | Read definitions, coverage, assumptions and limitations |
| Import reviewed local data | Pengelolaan lokal → Impor data | Supply the existing admin token |

The reusable “Mulai dari mana?” guide is visible on the landing page and available
under “Panduan alur dan halaman” in the workspace. Detail pages are reached from
their parent lists; their individual identifiers do not belong in the main menu.
HTTP API operations remain internal to these user interactions.

Local analysis does not require login. Import still requires the existing admin
token; a separate navigation group does not change its authentication or create
user accounts. Hosting and public redistribution remain outside this change.

## Verification

- Before the fix, `node tmp/navigation-repro.mjs` failed because the Studio link
  was absent from the public header. The same browser assertion passes afterwards.
- Three new Playwright cases cover entry from the landing, about and methodology
  pages at 390, 1024 and 1440 pixels, all public menu destinations, the saved-list
  anchor, and the guide link to comparison. Existing landing interactions remain
  covered at five viewport widths.
- All 23 browser tests and two unit tests passed; Svelte check reported zero
  errors and warnings, and the production build passed.
- Desktop and mobile screenshots were visually inspected. The 1024-pixel header
  fits, and the new guide stacks on mobile without horizontal overflow.

There was no `.codegraph/` index at inspection time. In accordance with the
repository instructions, route inspection and browser checks were used instead;
no index was created.
