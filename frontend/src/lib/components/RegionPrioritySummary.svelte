<script lang="ts">
  import Icon from './Icon.svelte';
  import {
    labels,
    number,
    type RegionInsights,
    type Source,
  } from '$lib/api/workspace';

  let {
    insights,
    sources,
  }: { insights: RegionInsights; sources: Source[] } = $props();

  const sourceById = $derived(
    Object.fromEntries(sources.map((source) => [source.source_id, source])),
  );
  const attention = $derived(
    insights.benchmarks.find(
      (item) => item.source_id === insights.attention_source_id,
    ),
  );
  const strength = $derived(
    insights.benchmarks.find(
      (item) => item.source_id === insights.strength_source_id,
    ),
  );
  const focusHref = $derived(
    attention
      ? '/studio?' +
          new URLSearchParams({
            level: insights.education_level,
            release: insights.release_id,
            province: insights.region.code,
            focus: attention.source_id,
          })
      : '',
  );

  function name(sourceId: string) {
    return labels[sourceId] ?? sourceById[sourceId]?.title ?? sourceId;
  }

  function unavailableReason(reason: string | null) {
    if (reason === 'no_schools') return 'Tidak ada sekolah pada cakupan ini.';
    if (reason === 'invalid') return 'Nilai tidak valid untuk dibandingkan.';
    return 'Data belum tersedia; bukan berarti aksesnya 0%.';
  }
</script>

<section class="relative-summary" aria-labelledby="relative-summary-title">
  <header class="summary-heading">
    <div>
      <span class="eq-kicker">BENCHMARK ANTARPROVINSI</span>
      <h2 id="relative-summary-title">Ringkasan kondisi relatif</h2>
    </div>
    <p>
      Dibandingkan dengan median provinsi pada rilis, jenjang, periode, dan
      definisi yang sama. Perbedaan angka tidak menjelaskan penyebabnya.
    </p>
  </header>

  <div class="summary-grid">
    <article class="summary-card attention-card">
      <span class="card-label"><Icon name="chart" size={18} />Perlu diperhatikan</span>
      {#if attention}
        <h3>{name(attention.source_id)}</h3>
        <p class="metric">
          {number(attention.value)}% <span>vs median {number(attention.median)}%</span>
        </p>
        <p>
          Akses relatif lebih rendah
          <strong>{number(Math.abs(Number(attention.delta_from_median)))} poin persentase</strong>
          dibanding median provinsi pada cakupan yang sama.
        </p>
        {#if attention.rank && attention.available_regions > 1}
          <small>Urutan akses {attention.rank} dari {attention.available_regions} provinsi dengan data valid; nilai tertinggi berada di urutan 1.</small>
        {/if}
        <div class="card-actions">
          <a class="eq-button eq-button-primary" href={focusHref}>
            <Icon name="sliders" size={18} />Coba fokus ini di Studio
          </a>
          <a class="detail-link" href={'#indicator-' + attention.source_id}>Lihat rincian indikator</a>
        </div>
      {:else}
        <h3>Tidak ada indikator di bawah median</h3>
        <p>Data yang tersedia tidak menunjukkan nilai di bawah median provinsi. Ini bukan penilaian bahwa seluruh sekolah memiliki fasilitas yang memadai.</p>
      {/if}
    </article>

    <article class="summary-card strength-card">
      <span class="card-label"><Icon name="check" size={18} />Relatif kuat</span>
      {#if strength}
        <h3>{name(strength.source_id)}</h3>
        <p class="metric">
          {number(strength.value)}% <span>vs median {number(strength.median)}%</span>
        </p>
        <p>
          Akses relatif lebih tinggi
          <strong>{number(Math.abs(Number(strength.delta_from_median)))} poin persentase</strong>
          dibanding median provinsi pada cakupan yang sama.
        </p>
        <small>Nilai lebih tinggi tidak membuktikan kualitas layanan atau pemerataan antarsekolah.</small>
      {:else}
        <h3>Tidak ada indikator di atas median</h3>
        <p>Belum ada nilai yang lebih tinggi dari median pada indikator yang dapat dibandingkan.</p>
      {/if}
    </article>

    <article class="summary-card completeness-card">
      <span class="card-label"><Icon name="database" size={18} />Kelengkapan data</span>
      <h3>{insights.available_indicators} dari {insights.total_indicators} indikator</h3>
      <p>Dapat dibaca untuk {insights.region.name} pada jenjang {insights.education_level}.</p>
      {#if insights.benchmarks.some((item) => item.available_regions < 2)}
        <small>Sebagian indikator belum memiliki cukup wilayah pembanding untuk menghasilkan klaim relatif.</small>
      {:else}
        <small>Median hanya menjadi pembanding deskriptif, bukan ambang kelayakan kebijakan.</small>
      {/if}
    </article>
  </div>

  <details class="benchmark-details">
    <summary><Icon name="info" size={18} /><span>Lihat semua benchmark dan sumber</span></summary>
    <div class="table-scroll" role="region" aria-label="Tabel benchmark indikator">
      <table>
        <caption>Benchmark {insights.region.name} · {insights.education_level} · {insights.academic_year}</caption>
        <thead>
          <tr><th>Indikator</th><th>Provinsi</th><th>Median</th><th>Selisih</th><th>Posisi</th><th>Sumber</th></tr>
        </thead>
        <tbody>
          {#each insights.benchmarks as benchmark}
            {@const source = sourceById[benchmark.source_id]}
            <tr>
              <th scope="row">{name(benchmark.source_id)}</th>
              {#if benchmark.value === null}
                <td colspan="4">{unavailableReason(benchmark.unavailable_reason)}</td>
              {:else}
                <td>{number(benchmark.value)}%</td>
                <td>{number(benchmark.median)}%</td>
                <td>{Number(benchmark.delta_from_median) > 0 ? '+' : ''}{number(benchmark.delta_from_median)} pp</td>
                <td>{benchmark.available_regions > 1 ? `${benchmark.rank} dari ${benchmark.available_regions}` : 'Pembanding belum cukup'}</td>
              {/if}
              <td>
                {#if source}<a href={source.source_url} target="_blank" rel="noreferrer">{source.publisher}<span class="eq-sr-only"> (tab baru)</span></a>{:else}Tidak tersedia{/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="benchmark-note">
      Status {insights.status} · Rilis {insights.release_id}. Data agregat provinsi
      tidak menggambarkan kondisi setiap sekolah dan tidak menetapkan penerima bantuan.
    </p>
  </details>
</section>

<style>
  .relative-summary { margin-bottom: 36px; }
  .summary-heading { display: grid; grid-template-columns: minmax(0, .8fr) minmax(280px, 1.2fr); gap: 24px; align-items: end; margin-bottom: 20px; }
  .summary-heading h2 { margin-top: 8px; }
  .summary-heading p { color: var(--eq-text-secondary); line-height: 1.65; }
  .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .summary-card { border: 1px solid var(--eq-border); border-radius: 14px; padding: 22px; background: var(--eq-surface); min-width: 0; }
  .attention-card { border-top: 4px solid var(--eq-warning); }
  .strength-card { border-top: 4px solid var(--eq-primary); }
  .completeness-card { grid-column: 1 / -1; background: var(--eq-surface-subtle); }
  .card-label { display: flex; align-items: center; gap: 8px; color: var(--eq-text-secondary); font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
  .summary-card h3 { margin-top: 14px; font-size: 21px; }
  .summary-card p { margin-top: 10px; line-height: 1.65; }
  .summary-card small { display: block; margin-top: 12px; color: var(--eq-text-secondary); line-height: 1.55; }
  .metric { font-size: 28px; font-weight: 750; font-variant-numeric: tabular-nums; }
  .metric span { display: block; margin-top: 3px; color: var(--eq-text-secondary); font-size: 14px; font-weight: 500; }
  .card-actions { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; margin-top: 18px; }
  .detail-link { display: inline-flex; align-items: center; min-height: 44px; color: var(--eq-primary-hover); font-weight: 600; }
  .benchmark-details { margin-top: 16px; border-block: 1px solid var(--eq-border); }
  .benchmark-details summary { display: flex; align-items: center; gap: 8px; min-height: 52px; padding: 12px 4px; cursor: pointer; font-weight: 650; }
  .table-scroll { overflow-x: auto; outline-offset: 3px; }
  table { width: 100%; min-width: 760px; border-collapse: collapse; font-size: 14px; }
  caption { text-align: left; padding: 12px 0; color: var(--eq-text-secondary); }
  th, td { padding: 12px 10px; border-top: 1px solid var(--eq-border); text-align: left; vertical-align: top; }
  thead th { color: var(--eq-text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  tbody th { font-weight: 650; }
  td a { color: var(--eq-primary-hover); font-weight: 600; }
  .benchmark-note { padding: 14px 0 18px; color: var(--eq-text-secondary); font-size: 14px; line-height: 1.6; }
  @media (max-width: 700px) {
    .summary-heading, .summary-grid { grid-template-columns: minmax(0, 1fr); }
    .completeness-card { grid-column: auto; }
    .summary-card { padding: 18px; }
    .card-actions > * { width: 100%; justify-content: center; text-align: center; }
  }
</style>
