<script lang="ts">
  import { onMount } from 'svelte';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { api, labels, type Source } from '$lib/api/workspace';
  let sources = $state<Source[]>([]);
  let error = $state('');
  let loaded = $state(false);
  let query = $state('');
  const filtered = $derived(
    sources.filter((source) =>
      [source.title, source.publisher, labels[source.source_id] ?? '']
        .join(' ')
        .toLocaleLowerCase('id')
        .includes(query.toLocaleLowerCase('id')),
    ),
  );
  onMount(async () => {
    try {
      sources = (await api<{ items: Source[] }>('datasets')).items;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loaded = true;
    }
  });
</script>

<svelte:head><title>Katalog dataset · Equora</title></svelte:head>
<WorkspaceShell
  title="Katalog dataset"
  subtitle="Sepuluh indikator dari berkas pendidikan yang Anda sediakan, dengan definisi, skala, hash, dan pemeriksaan kualitas."
>
  {#if error}
    <div role="alert" class="work-error">
      <Icon name="alert" size={18} />
      <span>{error}</span>
    </div>
  {:else if !loaded}
    <div class="empty-state">
      <div class="empty-state-icon"><Icon name="database" size={22} /></div>
      <p>Memuat katalog dataset…</p>
    </div>
  {/if}

  <div class="datasets-toolbar">
    <div class="datasets-search">
      <Icon name="search" size={16} />
      <input
        type="search"
        aria-label="Cari judul atau penerbit"
        placeholder="Cari judul indikator atau penerbit..."
        bind:value={query}
      />
    </div>
    <div class="datasets-meta">
      <span class="eq-badge eq-badge-neutral">
        {filtered.length} dari {sources.length} indikator
      </span>
      {#if query}
        <button class="eq-button clear-btn" onclick={() => (query = '')}>
          Hapus filter
        </button>
      {/if}
    </div>
  </div>

  <div class="work-table">
    <table>
      <caption>Dataset lokal · Tahun ajaran 2025/2026</caption>
      <thead>
        <tr>
          <th>Indikator</th>
          <th>Satuan</th>
          <th>Cakupan data</th>
          <th>Status verifikasi</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as source}
          <tr>
            <td>
              <a href={'/datasets/' + source.source_id} class="dataset-title-link">
                <strong>{labels[source.source_id]}</strong>
              </a>
              <p class="work-muted dataset-desc">{source.definition}</p>
            </td>
            <td>
              <span class="eq-badge eq-badge-primary">
                {source.unit === 'percent' ? 'Persentase (%)' : 'Jumlah sekolah'}
              </span>
            </td>
            <td>
              <span class="work-muted">38 provinsi · 6 jenjang · Total</span>
            </td>
            <td>
              <span class="eq-badge eq-badge-warning">Review lokal</span>
            </td>
          </tr>
        {/each}
        {#if loaded && !error && filtered.length === 0}
          <tr>
            <td colspan="4">
              <div class="empty-state" style="margin: 20px 0; border: none;">
                <p>Tidak ditemukan dataset dengan kata kunci "{query}".</p>
                <button class="eq-button" onclick={() => (query = '')}>Reset pencarian</button>
              </div>
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>

  <div class="admin-link-card">
    <div>
      <strong>Kelola berkas sumber</strong>
      <p class="work-muted">Ingin memverifikasi ulang hash SHA-256 atau menjalankan impor snapshot baru?</p>
    </div>
    <a class="eq-button" href="/admin"> Kelola impor lokal
    </a>
  </div>
</WorkspaceShell>

<style>
  .datasets-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    padding: 12px 18px;
    margin-bottom: 20px;
  }
  .datasets-search {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 280px;
  }
  .datasets-search :global(svg) {
    position: absolute;
    left: 12px;
    color: var(--eq-text-secondary);
    pointer-events: none;
  }
  .datasets-search input {
    width: 100%;
    min-height: 48px;
    padding-left: 36px;
    padding-right: 12px;
    border: 1px solid var(--eq-control-border);
    border-radius: 8px;
    font-size: 13px;
    background: white;
  }
  .datasets-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .clear-btn {
    min-height: 48px;
    padding: 6px 12px;
    font-size: 12px;
  }
  .dataset-title-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--eq-text);
    text-decoration: none;
    font-size: 14px;
  }
  .dataset-title-link:hover {
    color: var(--eq-primary-hover);
    text-decoration: underline;
  }
  .dataset-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
  }
  .admin-link-card {
    background: var(--eq-surface);
    border: 1px solid var(--eq-border);
    border-radius: var(--eq-radius-sm);
    padding: 18px 20px;
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .admin-link-card strong {
    font-size: 14px;
  }
  .admin-link-card p {
    font-size: 13px;
    margin-top: 4px;
  }
</style>
