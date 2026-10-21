<script lang="ts">
  import { onMount } from 'svelte';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
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
  {#if error}<p role="alert" class="work-error">{error}</p>{:else if !loaded}<p
      role="status"
    >
      Memuat katalog…
    </p>{/if}
  <div class="work-controls">
    <label
      >Cari judul atau penerbit<input type="search" bind:value={query} /></label
    ><button class="eq-button" onclick={() => (query = '')}
      >Hapus pencarian</button
    >
  </div>
  <div class="work-table">
    <table>
      <caption>Dataset lokal · tahun ajaran 2025/2026</caption><thead
        ><tr
          ><th>Indikator</th><th>Satuan</th><th>Cakupan</th><th>Status</th></tr
        ></thead
      ><tbody
        >{#each filtered as source}<tr
            ><td
              ><a href={'/datasets/' + source.source_id}
                >{labels[source.source_id]}</a
              >
              <p class="work-muted">{source.definition}</p></td
            ><td>{source.unit === 'percent' ? '%' : 'sekolah'}</td><td
              >38 provinsi · 6 jenjang · Total</td
            ><td>Review lokal</td></tr
          >{/each}{#if loaded && !error && filtered.length === 0}<tr
            ><td colspan="4">Belum ada dataset yang cocok.</td></tr
          >{/if}</tbody
      >
    </table>
  </div>
  <a href="/admin">Kelola impor lokal →</a>
</WorkspaceShell>
