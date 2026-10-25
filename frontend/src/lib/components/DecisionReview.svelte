<script lang="ts">
  import {
    api,
    labels,
    number,
    rupiah,
    type Snapshot,
    type Review,
    type ReviewTrial,
  } from '$lib/api/workspace';
  import Icon from './Icon.svelte';
  let { snapshot }: { snapshot: Snapshot } = $props();
  let budget = $state(10);
  let cost = $state(0);
  let indicator = $state('sanitation_percent');
  let weight = $state(0);
  let busy = $state(false);
  let error = $state('');
  let failedSignature = $state('');
  let review = $state<Review>();
  let selectedTrial = $state('what_if');
  let sequence = 0;
  const signature = $derived(
    JSON.stringify([snapshot.id, budget, cost, indicator, weight]),
  );
  let completedSignature = $state('');
  const current = $derived(
    review && completedSignature === signature ? review : undefined,
  );
  const activeTrial = $derived(
    current
      ? selectedTrial === 'coverage'
        ? current.coverage
        : selectedTrial === 'what_if'
          ? current.what_if
          : current.sensitivity[Number(selectedTrial)]
      : undefined,
  );
  function trialLabel(trial: ReviewTrial) {
    let label = trial.label;
    for (const [key, value] of Object.entries(labels))
      label = label.replace(key, value);
    return label;
  }
  async function calculate(event: SubmitEvent) {
    event.preventDefault();
    const request = ++sequence;
    const submitted = signature;
    busy = true;
    review = undefined;
    error = '';
    try {
      const value = await api<Review>('scenarios/' + snapshot.id + '/review', {
        budget_change_percent: budget,
        cost_change_percent: cost,
        weight_indicator: indicator,
        weight_change_percent: weight,
      });
      if (request === sequence && submitted === signature) {
        review = value;
        completedSignature = submitted;
        selectedTrial = 'what_if';
      }
    } catch (e) {
      if (submitted === signature) {
        error = (e as Error).message;
        failedSignature = submitted;
      }
    } finally {
      if (request === sequence) busy = false;
    }
  }
  function download() {
    if (!current) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ snapshot, review: current }, null, 2)], {
        type: 'application/json',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equora-review-' + snapshot.id + '.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
</script>

<section
  class="decision-review"
  id="uji-keputusan"
  aria-labelledby="review-heading"
>
  <header class="review-heading">
    <div>
      <p class="eq-kicker">PERIKSA PILIHAN ALOKASI</p>
      <h2 id="review-heading">Bagaimana jika asumsinya berubah?</h2>
      <p>
        Uji pilihan Anda, lihat jangkauan provinsi, lalu periksa kestabilan
        hasil pada data snapshot ini.
      </p>
    </div>
  </header>
  <form onsubmit={calculate}>
    <fieldset disabled={busy}>
      <legend class="eq-sr-only">Perubahan terhadap asumsi skenario awal</legend
      >
      <div class="assumptions">
        <label class="work-field"
          >Perubahan anggaran (%)<input
            type="number"
            min="-25"
            max="25"
            step="1"
            required
            bind:value={budget}
          /><span>Awal {rupiah(snapshot.parameters.budget_idr)}</span></label
        >
        <label class="work-field"
          >Perubahan biaya (%)<input
            type="number"
            min="-25"
            max="25"
            step="1"
            required
            bind:value={cost}
          /><span>Berlaku juga pada biaya khusus wilayah</span></label
        >
        <label class="work-field"
          >Indikator yang diuji<select bind:value={indicator}
            >{#each Object.keys(snapshot.parameters.weights) as key}<option
                value={key}>{labels[key] ?? key}</option
              >{/each}</select
          ></label
        >
        <label class="work-field"
          >Perubahan bobot relatif (%)<input
            type="number"
            min="-25"
            max="25"
            step="1"
            required
            bind:value={weight}
          /><span>Dinormalisasi kembali ke total 100%</span></label
        >
      </div>
      <div class="review-submit">
        <button class="eq-button eq-button-primary"
          >{busy
            ? 'Menguji dan memvalidasi…'
            : 'Jalankan uji keputusan'}</button>
        <p>Perubahan −25% sampai +25%. Skenario awal tetap tersimpan.</p>
      </div>
    </fieldset>
  </form>
  {#if busy}<p class="review-notice" role="status">
      Menghitung pilihan asumsi, jangkauan, dan variasi otomatis ±10%. Proses
      dapat memerlukan sekitar 15 detik.
    </p>{/if}
  {#if error && failedSignature === signature}<p
      class="work-error"
      role="alert"
    >
      {error} Anda dapat mengubah input atau menjalankan ulang.
    </p>{/if}
  {#if review && !current}<p class="review-notice" role="status">
      Asumsi berubah. Jalankan ulang untuk melihat hasil yang sesuai.
    </p>{/if}
  {#if current}
    <div class="review-output">
      <p class="work-muted" role="status">
        Uji selesai. Perbandingan jangkauan dan {current.sensitivity.length} percobaan
        tersedia di bawah.
      </p>
      <div class="section-title">
        <div>
          <h3>Cek pemerataan antarprovinsi</h3>
          <p>
            Bandingkan dua tujuan dengan anggaran dan batasan awal yang sama.
          </p>
        </div>
        <Icon name="compare" size={24} />
      </div>
      <div class="coverage-comparison">
        {#each [{ name: 'Skenario awal', summary: current.original, status: snapshot.allocation.status }, { name: 'Jangkauan terlebih dahulu', summary: current.coverage.summary, status: current.coverage.allocation.status }] as item, index}
          <article class:coverage-choice={index === 1}>
            <h4>{item.name}</h4>
            <p class="coverage-value">
              {number(item.summary.receiving_regions, 0)}<span>
                / {item.summary.eligible_regions} provinsi layak</span
              >
            </p>
            <p>menerima sedikitnya satu paket</p>
            <div class="coverage-track" aria-hidden="true">
              <span
                style:width={((item.summary.receiving_regions ?? 0) /
                  Math.max(item.summary.eligible_regions, 1)) *
                  100 +
                  '%'}
              ></span>
            </div>
            <dl>
              <dt>Skor tujuan (proxy)</dt>
              <dd>
                {item.summary.objective_units == null
                  ? 'Tidak tersedia'
                  : number(
                      item.summary.objective_units /
                        snapshot.case.priority_scale,
                      4,
                    )}
              </dd>
              <dt>Anggaran terpakai</dt>
              <dd>
                {item.summary.budget_used_idr == null
                  ? 'Tidak tersedia'
                  : rupiah(item.summary.budget_used_idr)}
              </dd>
              <dt>Status solver</dt>
              <dd>{item.status}</dd>
            </dl>
          </article>
        {/each}
      </div>
      <p class="review-notice">
        Status pembuktian jangkauan: <strong>{current.coverage_status}</strong>.
        Tujuan kedua memaksimalkan skor kebutuhan setelah jangkauan maksimum
        terbukti. Jangkauan provinsi belum membuktikan pemerataan antarsekolah
        atau siswa.
      </p>
      <div class="section-title">
        <div>
          <h3>Hasil uji asumsi Anda</h3>
          <p>
            Anggaran uji {rupiah(current.what_if.budget_idr)} · Status {current
              .what_if.allocation.status}
          </p>
        </div>
      </div>
      <div class="what-if-metrics">
        <div>
          <span>Provinsi penerima</span><strong
            >{number(current.what_if.summary.receiving_regions, 0)}</strong
          ><small>Awal {number(current.original.receiving_regions, 0)}</small>
        </div>
        <div>
          <span>Total paket</span><strong
            >{number(current.what_if.summary.total_packages, 0)}</strong
          ><small>Awal {number(current.original.total_packages, 0)}</small>
        </div>
        <div>
          <span>Sisa anggaran</span><strong
            >{current.what_if.summary.budget_remaining_idr == null
              ? 'Tidak tersedia'
              : rupiah(current.what_if.summary.budget_remaining_idr)}</strong
          ><small>Unit intervensi simulasi</small>
        </div>
      </div>
      {#if current.what_if.allocation.reason}<p class="review-notice">
          {current.what_if.allocation.reason}
        </p>{/if}
      {#if !current.what_if.objective_comparable}<p class="review-notice">
          Bobot atau cakupan layak berbeda. Skor tujuan kedua skenario tidak
          dibandingkan sebagai dampak setara.
        </p>{/if}
      <details>
        <summary>Bobot sesudah normalisasi</summary>
        <dl>
          {#each Object.entries(current.what_if.weights) as [key, value]}<dt>
              {labels[key]}
            </dt>
            <dd>{number(Number(value) * 100, 8)}%</dd>{/each}
        </dl>
      </details>
      <div class="section-title">
        <div>
          <h3>Uji kestabilan otomatis</h3>
          <p>
            {current.sensitivity.length} percobaan; setiap percobaan mengubah satu
            asumsi ±10%. Perubahan bobot bersifat relatif.
          </p>
        </div>
      </div>
      <div class="work-table">
        <table>
          <caption>Kestabilan alokasi per provinsi</caption><thead
            ><tr
              ><th>Provinsi</th><th>Paket awal</th><th>Rentang paket uji</th><th
                >Paket tetap / uji tervalidasi</th
              ><th>Rentang peringkat</th></tr
            ></thead
          ><tbody
            >{#each current.stability as row}<tr
                ><td
                  >{snapshot.region_names[row.region_code] ??
                    row.region_code}</td
                ><td
                  >{number(
                    snapshot.allocation.allocations?.[row.region_code],
                    0,
                  )}</td
                ><td
                  >{row.min_packages == null
                    ? 'Tidak tersedia'
                    : row.min_packages + '–' + row.max_packages}</td
                ><td
                  >{row.same_packages_trials} / {row.evaluated_trials}<small
                    class="cell-note"
                    >Layak pada {row.eligible_trials}/{current.sensitivity
                      .length} percobaan</small
                  ></td
                ><td
                  >{row.min_rank == null
                    ? 'Dikeluarkan'
                    : row.min_rank + '–' + row.max_rank}</td
                ></tr
              >{/each}</tbody
          >
        </table>
      </div>
      <p class="work-muted">
        Rentang ini menggambarkan percobaan yang dijalankan, bukan probabilitas.
        Timeout tidak dihitung sebagai alokasi stabil. Solusi dengan skor setara
        dapat menghasilkan pembagian berbeda.
      </p>
      <details>
        <summary>Periksa hasil dan status tiap percobaan</summary>
        <div class="work-table">
          <table>
            <caption>Parameter, kelayakan, dan hasil percobaan</caption><thead
              ><tr
                ><th>Percobaan</th><th>Status</th><th>Penerima</th><th>Paket</th
                ><th>Skor tujuan (proxy)</th></tr
              ></thead
            ><tbody
              >{#each current.sensitivity as item}<tr
                  ><td
                    >{trialLabel(item)}{#if !item.objective_comparable}<small
                        class="cell-note"
                        >Bobot berbeda; skor tidak setara</small
                      >{/if}</td
                  ><td>{item.allocation.status}</td><td
                    >{number(item.summary.receiving_regions, 0)}</td
                  ><td>{number(item.summary.total_packages, 0)}</td><td
                    >{item.summary.objective_units == null
                      ? 'Tidak tersedia'
                      : number(
                          item.summary.objective_units /
                            item.case.priority_scale,
                          4,
                        )}</td
                  ></tr
                >{/each}</tbody
            >
          </table>
        </div>
      </details>
      <label class="work-field trial-picker"
        >Telusuri perubahan per provinsi<select bind:value={selectedTrial}
          ><option value="what_if">Pilihan asumsi Anda</option><option
            value="coverage">Jangkauan terlebih dahulu</option
          >{#each current.sensitivity as item, index}<option
              value={String(index)}>{trialLabel(item)}</option
            >{/each}</select
        ></label
      >
      {#if activeTrial}<div class="work-table">
          <table>
            <caption
              >{trialLabel(activeTrial)}: perubahan terhadap skenario awal</caption
            ><thead
              ><tr
                ><th>Provinsi</th><th>Paket awal</th><th>Paket uji</th><th
                  >Selisih</th
                ><th>Peringkat awal / uji</th></tr
              ></thead
            ><tbody
              >{#each activeTrial.changes as row}<tr
                  ><td
                    >{snapshot.region_names[row.region_code] ??
                      row.region_code}</td
                  ><td>{number(row.before_packages, 0)}</td><td
                    >{number(row.after_packages, 0)}</td
                  ><td
                    >{row.delta == null
                      ? 'Tidak tersedia'
                      : (row.delta > 0 ? '+' : '') + row.delta}</td
                  ><td
                    >{row.before_rank ?? 'Dikeluarkan'} / {row.after_rank ??
                      'Dikeluarkan'}</td
                  ></tr
                >{/each}</tbody
            >
          </table>
        </div>{/if}
      <div class="export-row">
        <div>
          <strong>Simpan bukti pengujian</strong>
          <p>
            JSON memuat input snapshot, asumsi, hasil tiap percobaan, dan sumber
            data.
          </p>
        </div>
        <button class="eq-button" onclick={download}
          >Unduh bukti uji (JSON)</button>
      </div>
      <details>
        <summary>Metode dan batas uji keputusan</summary>
        <p class="work-muted">
          {current.review_version} · {new Date(
            current.computed_at,
          ).toLocaleString('id-ID')}
        </p>
        <ul>
          {#each current.limitations as text}<li>{text}</li>{/each}
        </ul>
      </details>
    </div>
  {:else if !busy && !error && !review}<p class="review-empty">
      <Icon name="info" size={18} />Jalankan uji untuk melihat perubahan
      alokasi, perbandingan jangkauan, dan kestabilan.
    </p>{/if}
</section>

<style>
  .decision-review {
    border: 1px solid var(--eq-border);
    border-radius: 16px;
    background: var(--eq-surface);
    margin-block: 28px;
    overflow: hidden;
    min-width: 0;
  }
  .review-heading {
    display: flex;
    gap: 18px;
    padding: 26px;
    background: var(--eq-sidebar);
    border-bottom: 1px solid var(--eq-border);
  }
  .review-heading h2 {
    font-size: clamp(1.35rem, 2.2vw, 1.8rem);
    margin: 6px 0 10px;
  }
  .review-heading p:last-child,
  .section-title p,
  .export-row p {
    color: var(--eq-text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
  form {
    padding: 24px 26px;
  }
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
  }
  .assumptions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .assumptions label > span {
    color: var(--eq-text-secondary);
    font-size: 13px;
  }
  .review-submit {
    display: flex;
    gap: 18px;
    align-items: center;
    margin-top: 24px;
    flex-wrap: wrap;
  }
  .review-submit p {
    font-size: 13px;
    color: var(--eq-text-secondary);
    max-width: 30ch;
  }
  .eq-button {
    gap: 8px;
  }
  .eq-button:disabled {
    opacity: 0.7;
  }
  .review-output {
    padding: 0 26px 24px;
  }
  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 26px;
    margin-bottom: 18px;
    border-top: 1px solid var(--eq-border);
  }
  .section-title h3 {
    margin: 0 0 8px;
    font-size: 1.2rem;
  }
  .coverage-comparison {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    overflow: hidden;
  }
  .coverage-comparison article {
    padding: 22px;
    min-width: 0;
  }
  .coverage-choice {
    background: var(--eq-sidebar);
    border-left: 1px solid var(--eq-border);
  }
  h4 {
    font-size: 14px;
    margin: 0 0 14px;
  }
  .coverage-value {
    font-size: 2.5rem;
    font-weight: 650;
    letter-spacing: -0.04em;
    line-height: 1.2;
  }
  .coverage-value span {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: normal;
    color: var(--eq-text-secondary);
  }
  .coverage-value + p {
    color: var(--eq-text-secondary);
    font-size: 13px;
  }
  .coverage-track {
    height: 7px;
    background: var(--eq-border);
    margin: 20px 0;
    overflow: hidden;
    border-radius: 3px;
  }
  .coverage-track span {
    display: block;
    height: 100%;
    background: var(--eq-chart-blue);
  }
  .coverage-comparison dl {
    grid-template-columns: 1fr;
    gap: 3px;
  }
  .coverage-comparison dd {
    margin-bottom: 10px;
    font-variant-numeric: tabular-nums;
  }
  .review-notice {
    margin: 16px 0;
    font-size: 14px;
    line-height: 1.7;
  }
  .decision-review > .review-notice,
  .decision-review > .work-error {
    margin: 0 26px 24px;
  }
  .what-if-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 18px 0;
    gap: 20px;
  }
  .what-if-metrics span,
  .what-if-metrics small {
    display: block;
    color: var(--eq-text-secondary);
    font-size: 13px;
  }
  .what-if-metrics strong {
    display: block;
    font-size: clamp(1.2rem, 2vw, 1.7rem);
    margin: 8px 0;
    overflow-wrap: anywhere;
  }
  .cell-note {
    display: block;
    color: var(--eq-text-secondary);
    font-size: 12px;
    margin-top: 5px;
  }
  .trial-picker {
    margin-top: 22px;
  }
  .export-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    padding: 22px 0;
  }
  .review-empty {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 0 26px 26px;
    color: var(--eq-text-secondary);
    font-size: 14px;
  }
  .review-empty :global(svg) {
    flex-shrink: 0;
  }
  @media (max-width: 760px) {
    .review-heading {
      padding: 20px 18px;
      gap: 12px;
    }
    form,
    .review-output {
      padding: 20px 18px;
    }
    .assumptions,
    .coverage-comparison,
    .what-if-metrics {
      grid-template-columns: 1fr;
    }
    .coverage-choice {
      border-left: 0;
      border-top: 1px solid var(--eq-border);
    }
    .what-if-metrics {
      gap: 16px;
    }
    .what-if-metrics > div {
      border-bottom: 1px solid var(--eq-border);
      padding-bottom: 12px;
    }
    .review-submit .eq-button {
      width: 100%;
    }
    .review-empty {
      padding-inline: 18px;
    }
    .decision-review > .review-notice,
    .decision-review > .work-error {
      margin-inline: 18px;
    }
  }
</style>
