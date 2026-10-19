<script lang="ts">
  import { demoDatasets } from '$lib/datasets/demo';

  let query = $state('');
  let filtered = $derived(
    demoDatasets.filter((dataset) =>
      `${dataset.title} ${dataset.publisher}`.toLowerCase().includes(query.trim().toLowerCase())
    )
  );
</script>

<svelte:head>
  <title>Katalog dataset — Equora</title>
  <meta name="description" content="Katalog sumber data dan metadata Equora." />
</svelte:head>

<main>
  <nav class="nav" aria-label="Navigasi utama">
    <a class="wordmark" href="/">equora<span>.</span></a>
    <div class="nav-links">
      <a href="/">Beranda</a>
      <a class="active" href="/datasets" aria-current="page">Katalog dataset</a>
      <a href="/about">Tentang</a>
    </div>
  </nav>

  <header class="page-header">
    <div>
      <p class="eyebrow">Data intelligence</p>
      <h1>Katalog dataset</h1>
      <p class="intro">Kenali asal, cakupan, dan keterbatasan data sebelum menggunakannya untuk perbandingan.</p>
    </div>
    <span class="demo-badge">Fixture demo · belum terhubung API</span>
  </header>

  <section class="toolbar" aria-label="Pencarian dataset">
    <label for="dataset-search">Cari judul atau penerbit</label>
    <input id="dataset-search" bind:value={query} type="search" placeholder="Misalnya: sanitasi" />
    <p class="result-count">{filtered.length} dari {demoDatasets.length} dataset demo</p>
  </section>

  {#if filtered.length === 0}
    <section class="empty-state" aria-live="polite">
      <p class="eyebrow">Tidak ditemukan</p>
      <h2>Belum ada dataset yang cocok.</h2>
      <p>Coba kata kunci lain atau kosongkan pencarian. Pencarian ini hanya mencakup fixture yang dimuat.</p>
      <button type="button" onclick={() => (query = '')}>Hapus pencarian</button>
    </section>
  {:else}
    <section class="catalog" aria-label="Daftar dataset">
      {#each filtered as dataset}
        <article class="dataset-card">
          <div class="card-topline">
            <span class="dataset-type">Dataset demo</span>
            <span class="status">{dataset.quality.status}</span>
          </div>
          <h2><a href={`/datasets/${dataset.id}`}>{dataset.title}</a></h2>
          <p class="description">{dataset.description}</p>
          <dl class="metadata">
            <div><dt>Penerbit</dt><dd>{dataset.publisher}</dd></div>
            <div><dt>Periode</dt><dd>{dataset.year}</dd></div>
            <div><dt>Wilayah</dt><dd>{dataset.regionLevel}</dd></div>
            <div><dt>Unit</dt><dd>{dataset.unit}</dd></div>
          </dl>
          <a class="detail-link" href={`/datasets/${dataset.id}`}>Lihat metadata <span aria-hidden="true">→</span></a>
        </article>
      {/each}
    </section>
  {/if}

  <aside class="notice">
    <strong>Status data</strong>
    <p>Daftar ini hanya fixture untuk UI. API katalog, audit quality, dan status publish belum tersedia; metadata kosong tidak dianggap sebagai nol atau data sehat.</p>
  </aside>
</main>

<style>
  :global(body) { margin: 0; background: #e7e8ea; color: #24262b; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  :global(*) { box-sizing: border-box; }
  :global(a:focus-visible), :global(button:focus-visible), :global(input:focus-visible) { outline: 3px solid #236aab; outline-offset: 3px; }
  main { margin: 0 auto; max-width: 1180px; padding: 0 32px 72px; }
  .nav { align-items: center; display: flex; justify-content: space-between; min-height: 84px; }
  .wordmark { color: #24262b; font-size: 22px; font-weight: 800; letter-spacing: -.06em; text-decoration: none; }
  .wordmark span { color: #c94025; }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { color: #555c65; font-size: 14px; font-weight: 650; text-decoration: none; }
  .nav-links .active { color: #c94025; }
  .page-header { align-items: end; display: flex; gap: 24px; justify-content: space-between; padding: 72px 0 48px; }
  .eyebrow { color: #c94025; font-size: 12px; font-weight: 800; letter-spacing: .1em; margin: 0 0 14px; text-transform: uppercase; }
  h1, h2, p { margin-top: 0; }
  h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); letter-spacing: -.06em; line-height: 1; margin-bottom: 18px; }
  h2 { font-size: 24px; letter-spacing: -.04em; line-height: 1.15; }
  .intro { color: #555c65; font-size: 17px; line-height: 1.55; margin-bottom: 0; max-width: 600px; }
  .demo-badge, .status { background: #f7e4df; border: 1px solid #e5b5a9; border-radius: 999px; color: #8e321f; font-size: 12px; font-weight: 750; padding: 8px 12px; white-space: nowrap; }
  .toolbar { align-items: end; border-bottom: 1px solid #cfd2d6; display: grid; gap: 10px; grid-template-columns: minmax(240px, 1fr) auto; padding-bottom: 24px; }
  label { font-size: 13px; font-weight: 750; grid-column: 1 / -1; }
  input { background: #fff; border: 1px solid #cfd2d6; border-radius: 10px; color: #24262b; font: inherit; min-height: 46px; padding: 0 14px; }
  .result-count { align-self: center; color: #686e76; font-size: 13px; margin: 0; }
  .catalog { display: grid; gap: 16px; grid-template-columns: repeat(2, 1fr); padding-top: 28px; }
  .dataset-card, .empty-state { background: #f9f9fa; border: 1px solid #cfd2d6; border-radius: 14px; padding: 24px; }
  .card-topline { align-items: center; display: flex; justify-content: space-between; margin-bottom: 26px; }
  .dataset-type { color: #686e76; font-size: 12px; font-weight: 750; }
  .dataset-card h2 { margin-bottom: 12px; }
  .dataset-card h2 a { color: #24262b; text-decoration: none; }
  .description { color: #555c65; font-size: 14px; line-height: 1.55; min-height: 66px; }
  .metadata { border-top: 1px solid #cfd2d6; display: grid; gap: 14px; grid-template-columns: repeat(2, 1fr); margin: 22px 0; padding-top: 18px; }
  .metadata div { display: grid; gap: 4px; }
  dt { color: #686e76; font-size: 11px; text-transform: uppercase; }
  dd { font-size: 13px; margin: 0; }
  .detail-link { color: #c94025; font-size: 14px; font-weight: 750; text-decoration: none; }
  .empty-state { margin-top: 28px; text-align: center; }
  .empty-state p:not(.eyebrow) { color: #555c65; line-height: 1.55; }
  button { background: #c94025; border: 0; border-radius: 9px; color: white; cursor: pointer; font: inherit; font-weight: 700; min-height: 42px; padding: 0 16px; }
  .notice { background: #f0f1f2; border: 1px solid #cfd2d6; border-radius: 12px; margin-top: 28px; padding: 18px 20px; }
  .notice strong { display: block; font-size: 13px; margin-bottom: 6px; }
  .notice p { color: #555c65; font-size: 13px; line-height: 1.5; margin: 0; }
  @media (max-width: 700px) {
    main { padding: 0 20px 48px; }
    .nav { align-items: flex-start; flex-direction: column; gap: 16px; padding: 20px 0; }
    .nav-links { flex-wrap: wrap; gap: 12px 18px; }
    .page-header { align-items: flex-start; flex-direction: column; padding: 52px 0 36px; }
    .catalog { grid-template-columns: 1fr; }
    .toolbar { grid-template-columns: 1fr; }
    .result-count { grid-column: 1; }
  }
</style>
