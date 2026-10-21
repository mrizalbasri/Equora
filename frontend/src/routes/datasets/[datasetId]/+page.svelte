<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.dataset.title} — Equora</title>
</svelte:head>

<main>
  <nav class="nav" aria-label="Navigasi utama">
    <a class="wordmark" href="/">equora<span>.</span></a>
    <a class="back-link" href="/datasets">← Kembali ke katalog</a>
  </nav>

  <header class="page-header">
    <p class="eyebrow">Dataset demo · {data.dataset.version}</p>
    <h1>{data.dataset.title}</h1>
    <p class="description">{data.dataset.description}</p>
    <a class="source-link" href={data.dataset.sourceUrl} target="_blank" rel="noreferrer">Buka halaman sumber <span aria-hidden="true">↗</span></a>
  </header>

  <div class="layout">
    <section class="panel" aria-labelledby="metadata-title">
      <p class="eyebrow">Provenance</p>
      <h2 id="metadata-title">Metadata sumber</h2>
      <dl class="metadata">
        <div><dt>Penerbit</dt><dd>{data.dataset.publisher}</dd></div>
        <div><dt>Periode</dt><dd>{data.dataset.year}</dd></div>
        <div><dt>Jenjang</dt><dd>{data.dataset.educationLevel}</dd></div>
        <div><dt>Level wilayah</dt><dd>{data.dataset.regionLevel}</dd></div>
        <div><dt>Unit</dt><dd>{data.dataset.unit}</dd></div>
        <div><dt>Lisensi / ketentuan</dt><dd>{data.dataset.license}</dd></div>
        <div><dt>Waktu pengambilan</dt><dd>{data.dataset.retrievedAt}</dd></div>
        <div><dt>Versi</dt><dd>{data.dataset.version}</dd></div>
      </dl>
    </section>

    <section class="panel" aria-labelledby="quality-title">
      <p class="eyebrow">Quality report</p>
      <h2 id="quality-title">Ringkasan kualitas</h2>
      <div class="quality-list">
        <div><span>Missing</span><strong>{data.dataset.quality.missing}</strong></div>
        <div><span>Duplikat</span><strong>{data.dataset.quality.duplicates}</strong></div>
        <div><span>Cakupan</span><strong>{data.dataset.quality.coverage}</strong></div>
      </div>
      <p class="quality-note">Audit API belum tersedia. Nilai “belum diaudit” tidak berarti dataset bebas masalah.</p>
    </section>
  </div>

  <aside class="notice">
    <strong>Fixture demo</strong>
    <p>Halaman ini menunjukkan rancangan metadata katalog. Data observasi, quality report, dan status publish belum terhubung ke API nyata.</p>
  </aside>
</main>

<style>
  :global(body) { margin: 0; background: #e7e8ea; color: #24262b; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  :global(*) { box-sizing: border-box; }
  :global(a:focus-visible) { outline: 3px solid #236aab; outline-offset: 3px; }
  main { margin: 0 auto; max-width: 1180px; padding: 0 32px 72px; }
  .nav { align-items: center; display: flex; justify-content: space-between; min-height: 84px; }
  .wordmark { color: #24262b; font-size: 22px; font-weight: 800; letter-spacing: -.06em; text-decoration: none; }
  .wordmark span { color: #c94025; }
  .back-link, .source-link { color: #c94025; font-size: 14px; font-weight: 750; text-decoration: none; }
  .page-header { border-bottom: 1px solid #cfd2d6; padding: 76px 0 48px; }
  .eyebrow { color: #c94025; font-size: 12px; font-weight: 800; letter-spacing: .1em; margin: 0 0 14px; text-transform: uppercase; }
  h1, h2, p { margin-top: 0; }
  h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); letter-spacing: -.06em; line-height: 1; margin-bottom: 20px; max-width: 800px; }
  h2 { font-size: 25px; letter-spacing: -.04em; margin-bottom: 26px; }
  .description { color: #555c65; line-height: 1.6; max-width: 700px; }
  .layout { display: grid; gap: 16px; grid-template-columns: 1.2fr .8fr; padding-top: 28px; }
  .panel { background: #f9f9fa; border: 1px solid #cfd2d6; border-radius: 14px; padding: 28px; }
  .metadata { display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); margin: 0; }
  .metadata div { display: grid; gap: 5px; }
  dt { color: #686e76; font-size: 11px; text-transform: uppercase; }
  dd { font-size: 14px; margin: 0; }
  .quality-list { display: grid; gap: 12px; }
  .quality-list div { background: #f0f1f2; border-radius: 10px; display: flex; justify-content: space-between; padding: 13px; }
  .quality-list span { color: #686e76; font-size: 13px; }
  .quality-list strong { font-size: 13px; }
  .quality-note { color: #555c65; font-size: 13px; line-height: 1.5; margin: 20px 0 0; }
  .notice { background: #f7e4df; border: 1px solid #e5b5a9; border-radius: 12px; margin-top: 28px; padding: 18px 20px; }
  .notice strong { display: block; margin-bottom: 6px; }
  .notice p { color: #555c65; font-size: 13px; line-height: 1.5; margin: 0; }
  @media (max-width: 700px) {
    main { padding: 0 20px 48px; }
    .nav { align-items: flex-start; flex-direction: column; gap: 16px; padding: 20px 0; }
    .page-header { padding: 52px 0 36px; }
    .layout { grid-template-columns: 1fr; }
  }
</style>
