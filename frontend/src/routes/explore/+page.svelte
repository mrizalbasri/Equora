<script lang="ts">
  import { onMount } from 'svelte';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import ProvinceMap from '$lib/components/ProvinceMap.svelte';
  import {
    api,
    labels,
    number,
    type Workspace,
    type Observations,
  } from '$lib/api/workspace';
  let workspace = $state<Workspace>();
  let data = $state<Observations>();
  let indicator = $state('sanitation_percent');
  let level = $state('SD');
  let query = $state('');
  let selected = $state('');
  let error = $state('');
  let loading = $state(true);
  let descending = $state(false);
  let requestId = 0;
  let mapAttempt = $state(0);
  const filtered = $derived(
    (data?.rows ?? [])
      .filter((row) =>
        row.name
          .toLocaleLowerCase('id')
          .includes(query.toLocaleLowerCase('id')),
      )
      .toSorted((a, b) =>
        a.value === null
          ? 1
          : b.value === null
            ? -1
            : (Number(a.value) - Number(b.value)) * (descending ? -1 : 1),
      ),
  );
  const detail = $derived(data?.rows.find((row) => row.code === selected));
  const max = $derived(
    data?.source.unit === 'percent'
      ? 100
      : Math.max(1, ...filtered.map((row) => Number(row.value ?? 0))),
  );
  const exportUrl = $derived(
    '/api/v1/observations/export?' +
      new URLSearchParams({ indicator, education_level: level, q: query }),
  );
  async function load() {
    const id = ++requestId;
    loading = true;
    error = '';
    data = undefined;
    try {
      if (!workspace) workspace = await api<Workspace>('workspace');
      const result = await api<Observations>(
        'observations?' +
          new URLSearchParams({ indicator, education_level: level }),
      );
      if (id === requestId) data = result;
    } catch (e) {
      if (id === requestId) error = (e as Error).message;
    } finally {
      if (id === requestId) loading = false;
    }
  }
  onMount(load);
</script>

<svelte:head><title>Explorer pendidikan · Equora</title></svelte:head>
<WorkspaceShell
  title="Baca datanya. Kenali kesenjangannya."
  subtitle="Telusuri akses fasilitas sekolah pada 38 provinsi, lalu lihat sumber angka sebelum menyusun prioritas."
>
  <div class="work-controls">
    <label
      >Indikator<select bind:value={indicator} onchange={load}
        >{#each workspace?.sources ?? [] as source}<option
            value={source.source_id}
            >{labels[source.source_id] ?? source.title}</option
          >{/each}</select
      ></label
    >
    <label
      >Jenjang<select bind:value={level} onchange={load}
        >{#each workspace?.education_levels ?? ['SD'] as item}<option
            >{item}</option
          >{/each}</select
      ></label
    >
    <label
      >Cari provinsi<input
        type="search"
        bind:value={query}
        placeholder="Nama provinsi"
      /></label
    >
    <p class="work-muted">2025/2026 · Negeri + Swasta</p>
  </div>
  {#if loading}<p role="status">Memuat observasi…</p>{/if}
  {#if error}<p role="alert" class="work-error">{error}</p>
    <button class="eq-button" onclick={load}>Coba lagi</button>{/if}
  {#if data}
    <div class="work-panel">
      <h2>{labels[indicator]}</h2>
      <p>{data.source.definition}</p>
      <div class="work-actions">
        <a class="eq-button" href={exportUrl}>Unduh CSV hasil filter</a><a
          class="eq-button"
          href={'/datasets/' + indicator}>Sumber & kualitas</a
        >
      </div>
      {#key mapAttempt}<ProvinceMap
          onretry={() => mapAttempt++}
          rows={filtered}
          percent={data.source.unit === 'percent'}
          {selected}
          onselect={(code) => (selected = code)}
        />{/key}
    </div>
    {#if detail}<section class="work-panel" aria-live="polite">
        <h2>{detail.name}</h2>
        <p class="stat">
          {number(detail.value)}{data.source.unit === 'percent' &&
          detail.value !== null
            ? '%'
            : ''}
        </p>
        <p class="work-muted">
          {level} · {detail.status} · Sel sumber {detail.source_cell} · Denominator
          {number(detail.denominator, 0)} sekolah
        </p>
        <a href={'/regions/' + detail.code + '?level=' + level}
          >Lihat seluruh indikator wilayah →</a
        >
      </section>{/if}
    <div class="work-actions">
      <button class="eq-button" onclick={() => (descending = !descending)}
        >Urutan: {descending ? 'nilai tertinggi' : 'nilai terendah'} ↕</button
      ><span>{filtered.length} provinsi</span>
    </div>
    <div class="work-table">
      <table>
        <caption
          >Nilai akses / ketersediaan · {level} · {data.academic_year}</caption
        ><thead
          ><tr
            ><th>Provinsi</th><th
              >Nilai {data.source.unit === 'percent' ? '(%)' : '(sekolah)'}</th
            ><th>Kualitas</th><th>Sel sumber</th></tr
          ></thead
        ><tbody>
          {#each filtered as row}<tr class:selected={selected === row.code}
              ><td
                ><button
                  class="region-pick"
                  onclick={() => (selected = row.code)}>{row.name}</button
                ></td
              ><td
                >{number(row.value)}{#if row.value !== null}<div
                    class="bar"
                    style:width={Math.max(
                      0.5,
                      (Number(row.value) / max) * 100,
                    ) + '%'}
                  ></div>{/if}</td
              ><td
                >{row.status === 'available'
                  ? 'Tersedia'
                  : row.status === 'no_schools'
                    ? 'Tidak ada sekolah pada scope ini'
                    : 'Data tidak tersedia'}</td
              ><td>{row.source_cell}</td></tr
            >{/each}
          {#if filtered.length === 0}<tr
              ><td colspan="4">Tidak ada provinsi yang sesuai pencarian.</td
              ></tr
            >{/if}
        </tbody>
      </table>
    </div>
    <p class="work-muted">
      Nilai akses lebih rendah menunjukkan kebutuhan lebih besar; jumlah sekolah
      adalah konteks, bukan skor prioritas. Nol sekolah dikeluarkan dari
      perhitungan persentase dan peringkat.
    </p>
    <p class="work-muted">
      Snapshot {data.release_id} ·
      <a href={data.source.source_url} target="_blank" rel="noreferrer"
        >Sumber asli ↗</a
      >
    </p>
  {/if}
</WorkspaceShell>

<style>
  .region-pick {
    background: none;
    border: 0;
    padding: 4px 0;
    min-height: 36px;
    text-align: left;
    color: var(--eq-primary-hover);
    text-decoration: underline;
  }
  td:nth-child(2) {
    min-width: 180px;
  }
</style>
