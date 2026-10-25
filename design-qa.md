# Landing visual QA

Date: 22 October 2026

final result: passed

Scope: integrate the user-selected option 3 school illustration in place of the rejected workspace screenshot, retaining Equora blue and the existing landing layout. Tabs, caption, and destination links are native HTML.

## Evidence

- Selected reference: `C:/Users/RizalBasri/.codex/generated_images/01a162bc-690f-7482-bc9c-43963612e536/exec-218aa7bb-0d36-4848-ab1e-d2f8957403bf.png` (third displayed image, explicitly selected by user).
- Implementation: `http://localhost:5173/`.
- Current captures: `frontend/test-results/school-illustration/desktop.png` (1440), `tablet.png` (768), and `mobile.png` (390). These ignored test artifacts were captured through the in-app browser and opened for visual inspection. The selected source and implementation were viewed together.

## Findings and resolution

The first visual review found essential preview captions and disclaimers too small on mobile (10–12px). All qualification text was increased to at least 13px and the same viewports were recaptured. The finish reviewer scored this resolved. Following the user's palette clarification, blue actions and heading emphasis were restored; the reviewer reopened final desktop/mobile evidence and returned `ship` for palette and legibility.

The user subsequently rejected the dense screenshot block and selected generated option 3. Its raster controls/text were removed with ImageGen; the artwork-only export was converted to WebP (262,346 bytes). A fresh scoped review opened the approved mock and desktop/tablet/mobile captures and returned `ship` with no material visual findings. Miniature classroom details are decorative on mobile; the school context remains recognizable.

## Verification

- PASS: no horizontal overflow at 390, 768, and 1440px; image loads and retains its natural 1738:905 aspect ratio without cropping.
- PASS: Explorer/Studio selector updates selected state and real link destination; native caption remains 13px.
- PASS: selecting Studio and following “Atur simulasi anggaran” opens the actual Studio page. Existing menu/FAQ checks from the earlier landing review remain applicable; those controls were not changed.
- PASS: blue/white action contrast 5.47:1; selected-tab text 6.81:1; navy-section body 8.01:1 and disclaimer 7.83:1.
- PASS: original blue identity and Carbon dashboard navigation icons retained; no decorative icons on labeled public actions.
- PASS: `pnpm check` reports zero errors/warnings; `pnpm build` completes. Browser error log is empty. Full legacy E2E suite was not run; verification used the live in-app browser.

## Limits

The image is labeled “Ilustrasi fasilitas pendidikan” and has descriptive alt text. It represents no actual school, map, dataset, or allocation result. Previous workspace screenshots are retained as historical assets and are no longer referenced by the landing. Generation/edit provenance and exact export prompt are recorded next to the shipping image.
