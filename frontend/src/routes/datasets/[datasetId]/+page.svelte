<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
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
  <a href="/datasets">← Katalog dataset</a>{#if error}<p
      role="alert"
      class="work-error"
    >
      {error}
    </p>{:else if !source}<p role="status">Memuat sumber…</p>{/if}
  {#if source}<section class="work-panel">
      <h2>{source.title}</h2>
      <p>{source.definition}</p>
      <dl>
        <dt>Penerbit</dt>
        <dd>{source.publisher}</dd>
        <dt>Sumber asli</dt>
        <dd>
          <a href={source.source_url} target="_blank" rel="noreferrer"
            >Halaman sumber ↗</a
          >
        </dd>
        <dt>SHA-256 berkas</dt>
        <dd>{source.sha256}</dd>
        <dt>Skala penyimpanan</dt>
        <dd>{source.storage_scale}</dd>
        <dt>Satuan API</dt>
        <dd>{source.unit}</dd>
        <dt>Tanggal unduh</dt>
        <dd>
          {source.retrieved_at ?? 'Belum diketahui; berkas disediakan pengguna'}
        </dd>
        <dt>Lisensi redistribusi</dt>
        <dd>{source.license_status}</dd>
      </dl>
    </section>
    <div class="work-table">
      <table>
        <caption>Kualitas kolom Total yang digunakan</caption><thead
          ><tr><th>Jenjang</th><th>Numerik</th><th>Missing</th></tr></thead
        ><tbody
          >{#each Object.entries(source.quality) as [level, quality]}<tr
              ><td>{level}</td><td>{quality.numeric}</td><td
                >{quality.missing}</td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>
    <p class="work-muted">
      Agregat Indonesia dan Luar Negeri dikeluarkan. Missing tetap kosong.
      Persentase dengan denominator nol tidak digunakan untuk peringkat.
      Pemeriksaan ini tidak membuktikan kebenaran kondisi lapangan.
    </p>
  {/if}
</WorkspaceShell>
