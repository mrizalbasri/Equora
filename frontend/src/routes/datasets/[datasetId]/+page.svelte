<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { api, type Source } from '$lib/api/workspace';
  let source = $state<Source>();
  let error = $state('');
  onMount(async () => {
    try {
      source = await api<Source>('datasets/' + page.params.datasetId);
    } catch (e) {
      error = (e as Error).message;
    }
  });
</script>

<svelte:head><title>Detail sumber · Equora</title></svelte:head>
<WorkspaceShell
  title="Detail dan kualitas sumber"
  subtitle="Periksa definisi dan asal data sebelum menggunakannya dalam analisis."
>
  <a href="/datasets" class="eq-back-link">
    Kembali ke Katalog Dataset
  </a>

  {#if error}
    <div role="alert" class="work-error">
      <Icon name="alert" size={18} />
      <span>{error}</span>
    </div>
  {:else if !source}
    <div class="empty-state">
      <div class="empty-state-icon"><Icon name="database" size={22} /></div>
      <p>Memuat rincian sumber…</p>
    </div>
  {/if}

  {#if source}
    <section class="work-panel">
      <div class="source-header">
        <span class="eq-badge eq-badge-primary">{source.unit === 'percent' ? 'Persentase (%)' : 'Jumlah sekolah'}</span>
        <h2>{source.title}</h2>
        <p class="source-definition">{source.definition}</p>
      </div>

      <dl class="source-meta-dl">
        <dt>Penerbit</dt>
        <dd><strong>{source.publisher}</strong></dd>

        <dt>Sumber asli</dt>
        <dd>
          <a href={source.source_url} target="_blank" rel="noreferrer" class="source-external-link">
            Kunjungi portal penerbit
          </a>
        </dd>

        <dt>Checksum berkas (SHA-256)</dt>
        <dd><code class="sha256-code">{source.sha256}</code></dd>

        <dt>Skala penyimpanan</dt>
        <dd><span class="eq-badge eq-badge-neutral">{source.storage_scale}</span></dd>

        <dt>Satuan API</dt>
        <dd>{source.unit}</dd>

        <dt>Waktu unduh snapshot</dt>
        <dd>{source.retrieved_at ?? 'Disediakan pengguna pada review lokal'}</dd>

        <dt>Status lisensi</dt>
        <dd><span class="eq-badge eq-badge-warning">{source.license_status}</span></dd>
      </dl>
    </section>

    <div class="work-table">
      <table>
        <caption>Kualitas kolom Total yang digunakan</caption>
        <thead>
          <tr>
            <th>Jenjang pendidikan</th>
            <th>Data numerik valid</th>
            <th>Nilai hilang (missing)</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(source.quality) as [level, quality]}
            <tr>
              <td><strong>{level}</strong></td>
              <td><span class="eq-badge eq-badge-success">{quality.numeric} provinsi</span></td>
              <td>
                {#if quality.missing > 0}
                  <span class="eq-badge eq-badge-warning">{quality.missing} missing</span>
                {:else}
                  <span class="eq-badge eq-badge-neutral">0 missing</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="review-notice">
      Agregat Indonesia dan Luar Negeri dikeluarkan. Data missing tidak diasumsikan nol.
      Persentase dengan denominator nol tidak digunakan untuk peringkat.
    </div>
  {/if}
</WorkspaceShell>

<style>
  .source-header {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--eq-border);
  }
  .source-header h2 {
    margin: 10px 0 8px;
    font-size: 1.5rem;
  }
  .source-definition {
    color: var(--eq-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
  .source-meta-dl {
    display: grid;
    grid-template-columns: minmax(180px, 1fr) 2fr;
    gap: 14px 20px;
    font-size: 14px;
  }
  .source-external-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--eq-primary-hover);
    font-weight: 550;
    text-decoration: none;
  }
  .source-external-link:hover {
    text-decoration: underline;
  }
  .sha256-code {
    font-family: ui-monospace, monospace;
    font-size: 12px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    padding: 3px 8px;
    border-radius: 6px;
    word-break: break-all;
  }
  @media (max-width: 760px) {
    .source-meta-dl {
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .source-meta-dl dd {
      margin-bottom: 12px;
    }
  }
</style>
