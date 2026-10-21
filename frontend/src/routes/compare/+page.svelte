<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import {
    api,
    downloadComparison,
    rupiah,
    type SavedScenario,
  } from '$lib/api/workspace';
  let saved = $state<SavedScenario[]>([]);
  let left = $state('');
  let right = $state('');
  let error = $state('');
  let busy = $state(false);
  let names = $state<Record<string, string>>({});
  let result = $state<{
    objective_comparable: boolean;
    coverage: Record<string,{eligible_regions:number;receiving_regions:number;total_packages:number;excluded_regions:number}>;
    warnings: string[];
    budget_delta_idr: number;
    rows: {
      region_code: string;
      left_packages: number;
      right_packages: number;
      delta: number;
      left_rank: number | null;
      right_rank: number | null;
    }[];
  }>();
  onMount(async () => {
    try {
      const [items, regions] = await Promise.all([
        api<SavedScenario[]>('scenarios'),
        api<{ code: string; name: string }[]>('regions'),
      ]);
      saved = items;
      left = page.url.searchParams.get('left') ?? saved[0]?.id ?? '';
      right = saved.find((item) => item.id !== left)?.id ?? '';
      names = Object.fromEntries(regions.map((row) => [row.code, row.name]));
    } catch (e) {
      error = (e as Error).message;
    }
  });
  async function exportPdf() {
    try {
      await downloadComparison(left, right);
    } catch (e) {
      error = (e as Error).message;
    }
  }
  async function compare(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    error = '';
    result = undefined;
    try {
      result = await api('scenarios/compare', { left, right });
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
    }
  }
</script>

<WorkspaceShell
  title="Perbandingan skenario"
  subtitle="Perubahan paket dan peringkat dibaca pada versi data, jenjang, metode, dan model yang kompatibel."
>
  <form onsubmit={compare}>
    <div class="work-controls">
      <label
        >Skenario awal<select bind:value={left} onchange={() => result = undefined} required
          ><option value="">Pilih snapshot</option>{#each saved as item}<option
              value={item.id}>{item.name} · {item.created_at}</option
            >{/each}</select
        ></label
      ><label
        >Skenario pembanding<select bind:value={right} onchange={() => result = undefined} required
          ><option value="">Pilih snapshot</option>{#each saved as item}<option
              value={item.id}>{item.name} · {item.created_at}</option
            >{/each}</select
        ></label
      ><button
        class="eq-button eq-button-primary"
        disabled={busy || !left || !right || left === right}
        >{busy ? 'Membandingkan…' : 'Bandingkan'}</button
      >
    </div>
  </form>
  {#if error}<p role="alert" class="work-error">{error}</p>{/if}
  {#if saved.length < 2}<p>
      Buat sedikitnya dua skenario di <a href="/studio">Studio</a> untuk membandingkan.
    </p>{/if}
  {#if result}<section class="work-panel">
      <h2>Perubahan alokasi</h2>
      <div class="work-grid">{#each Object.entries(result.coverage) as [key,value]}<div><h3>{key === 'left' ? 'Skenario awal' : 'Pembanding'}</h3><p>{value.receiving_regions} dari {value.eligible_regions} wilayah layak menerima paket; {value.total_packages} paket total. {value.excluded_regions} wilayah exclude.</p></div>{/each}</div>
      <button class="eq-button" onclick={exportPdf}
        >Unduh PDF perbandingan</button
      >
      <p>
        Selisih anggaran terpakai (pembanding − awal): {rupiah(
          result.budget_delta_idr,
        )}
      </p>
      {#each result.warnings as warning}<p class="review-notice">
          {warning}
        </p>{/each}
      <p class="work-muted">
        {result.objective_comparable
          ? 'Bobot sama. Objective tetap merupakan proxy kebutuhan, bukan ukuran dampak.'
          : 'Bobot berubah; objective tidak dinyatakan setara.'}
      </p>
    </section>
    <div class="work-table">
      <table>
        <caption>Perbandingan paket dan peringkat</caption><thead
          ><tr
            ><th>Provinsi</th><th>Paket awal</th><th>Pembanding</th><th
              >Perubahan</th
            ><th>Peringkat awal → pembanding</th></tr
          ></thead
        ><tbody
          >{#each result.rows as row}<tr
              ><td>{names[row.region_code] ?? row.region_code}</td><td
                >{row.left_packages}</td
              ><td>{row.right_packages}</td><td
                >{row.delta > 0 ? '+' : ''}{row.delta}</td
              ><td>{row.left_rank ?? '—'} → {row.right_rank ?? '—'}</td></tr
            >{/each}</tbody
        >
      </table>
    </div>{/if}
</WorkspaceShell>
