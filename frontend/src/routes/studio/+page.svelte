<script lang="ts">
  import { onMount } from 'svelte';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import ScenarioResult from '$lib/components/ScenarioResult.svelte';
  import {
    api,
    labels,
    type Workspace,
    type Snapshot,
    type SavedScenario,
  } from '$lib/api/workspace';
  let workspace = $state<Workspace>();
  let regions = $state<{ code: string; name: string }[]>([]);
  let saved = $state<SavedScenario[]>([]);
  let name = $state('Simulasi fasilitas sekolah');
  let level = $state('SD');
  let budget = $state<number | undefined>(1000000000);
  let cost = $state<number | undefined>(10000000);
  let capacity = $state<number | undefined>(10);
  let minimum = $state<number | undefined>(0);
  let weights = $state<Record<string, number>>({
    sanitation_percent: 25,
    water_percent: 25,
    internet_percent: 25,
    computers_percent: 25,
  });
  let selected = $state<string[]>([]);
  let overrides = $state<
    Record<
      string,
      { cost_idr: number; capacity: number; minimum_packages: number }
    >
  >({});
  let result = $state<Snapshot>();
  let busy = $state(false);
  let error = $state('');
  const names = $derived(
    Object.fromEntries(regions.map((row) => [row.code, row.name])),
  );
  const total = $derived(
    Object.values(weights).reduce((a, b) => a + (Number(b) || 0), 0),
  );
  onMount(async () => {
    try {
      [workspace, regions, saved] = await Promise.all([
        api<Workspace>('workspace'),
        api<{ code: string; name: string }[]>('regions'),
        api<SavedScenario[]>('scenarios'),
      ]);
      selected = regions.map((row) => row.code);
    } catch (e) {
      error = (e as Error).message;
    }
  });
  async function calculate(event: SubmitEvent) {
    event.preventDefault();
    if (!workspace || total !== 100) return;
    busy = true;
    error = '';
    result = undefined;
    try {
      result = await api<Snapshot>('scenarios', {
        release_id: workspace.id,
        name,
        education_level: level,
        budget_idr: budget,
        cost_idr: cost,
        capacity,
        minimum_packages: minimum,
        weights: Object.fromEntries(
          Object.entries(weights).map(([key, value]) => [
            key,
            (value / 100).toFixed(2),
          ]),
        ),
        region_codes: selected,
        overrides: Object.fromEntries(
          Object.entries(overrides).filter(([code]) => selected.includes(code)),
        ),
      });
      saved = await api<SavedScenario[]>('scenarios');
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }
  function toggleOverride(code: string) {
    if (overrides[code]) {
      const next = { ...overrides };
      delete next[code];
      overrides = next;
    } else
      overrides = {
        ...overrides,
        [code]: {
          cost_idr: cost ?? 1,
          capacity: capacity ?? 0,
          minimum_packages: minimum ?? 0,
        },
      };
  }
</script>

<svelte:head><title>Studio simulasi · Equora</title></svelte:head>
<WorkspaceShell
  title="Uji pilihan sebelum menetapkan prioritas."
  subtitle="Atur bobot kebutuhan, anggaran dan kapasitas. Bandingkan alokasi dengan dua baseline menggunakan batasan yang sama."
>
  <form onsubmit={calculate}>
    <section class="work-panel">
      <h2>1. Scope dan asumsi biaya</h2>
      <p class="work-muted">
        Angka awal adalah asumsi demo yang dapat diubah. Satu paket adalah unit
        intervensi simulasi; tidak diklaim setara satu sekolah terbantu.
      </p>
      <div class="work-grid">
        <label class="work-field"
          >Nama skenario<input
            bind:value={name}
            required
            maxlength="100"
          /></label
        ><label class="work-field"
          >Jenjang<select bind:value={level}
            >{#each workspace?.education_levels ?? ['SD'] as item}<option
                >{item}</option
              >{/each}</select
          ></label
        >
        <label class="work-field"
          >Anggaran (Rp)<input
            type="number"
            bind:value={budget}
            required
            min="0"
            max="10000000000000"
            step="1"
          /></label
        ><label class="work-field"
          >Biaya per paket default (Rp)<input
            type="number"
            bind:value={cost}
            required
            min="1"
            max="1000000000000"
            step="1"
          /></label
        >
        <label class="work-field"
          >Kapasitas paket per provinsi<input
            type="number"
            bind:value={capacity}
            required
            min="0"
            max="10000"
            step="1"
          /></label
        ><label class="work-field"
          >Minimum paket per provinsi<input
            type="number"
            bind:value={minimum}
            required
            min="0"
            max="10000"
            step="1"
          /></label
        >
      </div>
    </section>
    <section class="work-panel">
      <h2>2. Bobot kebutuhan</h2>
      <p class="work-muted">
        Kebutuhan = 1 − persentase akses / 100. Missing pada indikator berbobot
        positif menyebabkan wilayah dikeluarkan; bobot tidak diubah otomatis.
      </p>
      <div class="work-grid">
        {#each Object.keys(weights) as key}<label class="work-field"
            >{labels[key]} (%)<input
              type="number"
              bind:value={weights[key]}
              required
              min="0"
              max="100"
              step="1"
            /></label
          >{/each}
      </div>
      <p aria-live="polite">
        Total bobot: {total}% {total !== 100 ? '— harus tepat 100%' : ''}
      </p>
    </section>
    <details>
      <summary
        >3. Pilih wilayah dan sesuaikan biaya/kapasitas ({selected.length} terpilih)</summary
      >
      <div class="work-actions">
        <button
          type="button"
          class="eq-button"
          onclick={() => (selected = regions.map((row) => row.code))}
          >Pilih semua</button
        ><button type="button" class="eq-button" onclick={() => (selected = [])}
          >Kosongkan</button
        >
      </div>
      {#each regions as row}<div class="region-option">
          <label
            ><input type="checkbox" bind:group={selected} value={row.code} />
            {row.name}</label
          ><button
            type="button"
            class="eq-button"
            onclick={() => toggleOverride(row.code)}
            >{overrides[row.code] ? 'Hapus penyesuaian' : 'Sesuaikan'}</button
          >{#if overrides[row.code]}<div class="work-grid">
              <label class="work-field"
                >Biaya paket {row.name}<input
                  type="number"
                  bind:value={overrides[row.code].cost_idr}
                  required
                  min="1"
                  max="1000000000000"
                  step="1"
                /></label
              ><label class="work-field"
                >Kapasitas {row.name}<input
                  type="number"
                  bind:value={overrides[row.code].capacity}
                  required
                  min="0"
                  max="10000"
                  step="1"
                /></label
              ><label class="work-field"
                >Minimum {row.name}<input
                  type="number"
                  bind:value={overrides[row.code].minimum_packages}
                  required
                  min="0"
                  max="10000"
                  step="1"
                /></label
              >
            </div>{/if}
        </div>{/each}
    </details>
    <div class="work-actions">
      <button
        class="eq-button eq-button-primary"
        disabled={busy || !workspace || total !== 100 || !selected.length}
        >{busy
          ? 'Menghitung dan memvalidasi…'
          : 'Hitung & simpan snapshot'}</button
      ><a class="eq-button" href="/compare">Bandingkan snapshot</a>
    </div>
  </form>
  {#if error}<p class="work-error" role="alert">{error}</p>{/if}
  {#if result}<ScenarioResult {result} {names} />{/if}
  <section class="work-panel">
    <h2>Skenario tersimpan</h2>
    {#if !saved.length}<p>
        Belum ada snapshot. Hasil akan tersimpan setelah perhitungan.
      </p>{/if}{#each saved as item}<p>
        <a href={'/scenarios/' + item.id}>{item.name}</a> · {item.status} · {new Date(
          item.created_at,
        ).toLocaleString('id-ID')}
      </p>{/each}
  </section>
</WorkspaceShell>

<style>
  .region-option {
    padding: 14px 0;
    border-bottom: 1px solid var(--eq-border);
  }
  .region-option > label {
    display: inline-block;
    min-width: 55%;
    padding-block: 12px;
  }
  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    vertical-align: middle;
  }
</style>
