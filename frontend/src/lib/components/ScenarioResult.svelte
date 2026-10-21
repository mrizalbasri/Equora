<script lang="ts">
  import { labels, number, rupiah, type Snapshot } from '$lib/api/workspace';
  let {
    result,
    names = {},
  }: { result: Snapshot; names?: Record<string, string> } = $props();
  const regionNames = $derived(result.region_names ?? names);
</script>

<section class="work-panel">
  <p class="eq-kicker">SNAPSHOT TERSIMPAN · {result.id}</p>
  <h2>{result.parameters.name}</h2>
  <p>
    Status solver: <strong>{result.allocation.status}</strong> · {result
      .parameters.education_level} · Biaya asumsi demo
  </p>
  {#if result.allocation.reason}<p role="status">
      {result.allocation.reason}
    </p>{/if}
  {#if result.allocation.evaluation}<div class="work-grid">
      <div>
        <p class="work-muted">Anggaran digunakan</p>
        <p class="stat">
          {rupiah(result.allocation.evaluation.budget_used_idr)}
        </p>
      </div>
      <div>
        <p class="work-muted">Sisa anggaran</p>
        <p class="stat">
          {rupiah(result.allocation.evaluation.budget_remaining_idr)}
        </p>
      </div>
    </div>
    <p>
      Objective proxy: {number(
        result.allocation.evaluation.objective_units / 10000,
        4,
      )} · Batas terbaik {number(result.allocation.best_bound_units)} unit · Gap {number(
        result.allocation.absolute_gap_units,
      )} unit
    </p>{/if}
  <div class="work-actions">
    <a class="eq-button" href={'/api/v1/scenarios/' + result.id + '/export'}
      >Unduh CSV</a
    ><a class="eq-button" href={'/api/v1/scenarios/' + result.id + '/pdf'}
      >Unduh PDF</a
    ><a class="eq-button" href={'/compare?left=' + result.id}
      >Bandingkan skenario</a
    ><a class="eq-button" href={'/scenarios/' + result.id}>Tautan snapshot</a>
  </div>
  <details>
    <summary>Parameter & jejak perhitungan</summary>
    <dl>
      <dt>Data</dt>
      <dd>{result.release_id}</dd>
      <dt>Dibuat</dt>
      <dd>{result.created_at}</dd>
      <dt>Metode</dt>
      <dd>{result.priority.method_version}</dd>
      <dt>Model / solver</dt>
      <dd>
        {result.allocation.model_version} / {result.allocation.solver_version} · Batas
        {result.allocation.max_time_seconds} detik
      </dd>
      <dt>Anggaran</dt>
      <dd>{rupiah(result.parameters.budget_idr)}</dd>
      <dt>Biaya/paket default</dt>
      <dd>{rupiah(result.parameters.cost_idr)}</dd>
      <dt>Kapasitas / minimum default</dt>
      <dd>
        {result.parameters.capacity} / {result.parameters.minimum_packages}
      </dd>
    </dl>
    {#each Object.entries(result.parameters.weights) as [key, value]}<p>
        {labels[key]}: {number(Number(value) * 100)}%
      </p>{/each}
  </details>
</section>
<div class="work-table">
  <table>
    <caption
      >Peringkat kebutuhan dan alokasi paket · angka agregat, bukan bukti dampak</caption
    ><thead
      ><tr
        ><th>Peringkat</th><th>Wilayah</th><th>Skor kebutuhan</th><th>Paket</th
        ></tr
      ></thead
    ><tbody
      >{#each result.priority.ranked as row}<tr
          ><td>{row.rank}</td><td
            >{regionNames[row.region_code] ?? row.region_code}
            <details>
              <summary>Kontribusi indikator</summary
              >{#each Object.entries(row.contributions) as [key, value]}<p>
                  {labels[key]}: {number(value, 6)}
                </p>{/each}
            </details></td
          ><td>{number(row.score, 6)}</td><td
            >{result.allocation.allocations?.[row.region_code] ??
              'Belum ada solusi'}</td
          ></tr
        >{/each}</tbody
    >
  </table>
</div>
<div class="work-table">
  <table>
    <caption
      >Baseline dengan anggaran, biaya, kapasitas dan minimum yang sama</caption
    ><thead
      ><tr
        ><th>Strategi</th><th>Status</th><th>Biaya digunakan</th><th
          >Objective proxy</th
        ></tr
      ></thead
    ><tbody
      >{#each Object.entries(result.baselines) as [key, value]}<tr
          ><td
            >{key === 'equal'
              ? 'Pembagian merata bergiliran'
              : 'Greedy kebutuhan/biaya'}</td
          ><td>{value.status}</td><td
            >{value.evaluation
              ? rupiah(value.evaluation.budget_used_idr)
              : 'Tidak tersedia'}</td
          ><td
            >{value.evaluation
              ? number(value.evaluation.objective_units / 10000, 4)
              : 'Tidak tersedia'}</td
          ></tr
        >{/each}</tbody
    >
  </table>
</div>
{#if Object.keys(result.priority.excluded).length}<details>
    <summary
      >Wilayah dikeluarkan ({Object.keys(result.priority.excluded)
        .length})</summary
    >{#each Object.entries(result.priority.excluded) as [code, indicators]}<p>
        {regionNames[code] ?? code}: missing / tidak ada denominator untuk {indicators
          .map((key) => labels[key])
          .join(', ')}
      </p>{/each}
  </details>{/if}
<section class="work-panel">
  <h2>Batas interpretasi</h2>
  <ul>
    {#each result.limitations as text}<li>{text}</li>{/each}
  </ul>
  <details>
    <summary>Sumber pada snapshot ({result.sources.length})</summary
    >{#each result.sources as source}<p>
        <a href={source.source_url} target="_blank" rel="noreferrer"
          >{source.title}</a
        >
        · {source.sha256}
      </p>{/each}
  </details>
</section>
