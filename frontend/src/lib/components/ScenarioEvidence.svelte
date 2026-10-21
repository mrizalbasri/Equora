<script lang="ts">
  import { labels, number, rupiah, type Snapshot } from '$lib/api/workspace';
  import Icon from './Icon.svelte';
  let { snapshot }: { snapshot: Snapshot } = $props();
  let code = $state('');
  const selected = $derived(
    snapshot.input_rows?.find((row) => row.code === code) ??
      snapshot.input_rows?.[0],
  );
  const ranked = $derived(
    snapshot.priority.ranked.find((row) => row.region_code === selected?.code),
  );
  const option = $derived(
    snapshot.case?.regions.find((row) => row.region_code === selected?.code),
  );
  const packages = $derived(
    selected ? snapshot.allocation.allocations?.[selected.code] : undefined,
  );
  const denominator = $derived(selected?.values.institutions_count);
  const hasSchools = $derived(denominator != null && Number(denominator) > 0);
  function allocationFact() {
    if (!option || packages == null)
      return 'Belum ada solusi tervalidasi untuk wilayah ini.';
    if (option.capacity === 0)
      return 'Kapasitas wilayah ditetapkan nol; tidak ada paket yang dapat dialokasikan.';
    if (packages === option.capacity)
      return 'Alokasi telah mencapai kapasitas wilayah yang Anda tetapkan.';
    if (
      snapshot.allocation.evaluation &&
      snapshot.allocation.evaluation.budget_remaining_idr < option.cost_idr
    )
      return 'Sisa anggaran tidak cukup untuk satu paket tambahan di wilayah ini.';
    return 'Alokasi dihitung bersama seluruh wilayah di bawah anggaran, kapasitas, dan minimum yang sama. Skor saja tidak membuktikan alasan suatu wilayah tidak terpilih.';
  }
</script>

<section
  class="work-panel evidence"
  id="telusur-bukti"
  aria-labelledby="evidence-heading"
>
  <header>
    <Icon name="book" size={24} />
    <div>
      <h2 id="evidence-heading">Telusur bukti dan alasan prioritas</h2>
      <p class="work-muted">
        Ikuti angka dari nilai akses hingga kontribusi skor pada snapshot
        tersimpan.
      </p>
    </div>
  </header>
  {#if selected}
    <label class="work-field region-picker"
      >Provinsi yang diperiksa<select bind:value={code}
        ><option value="">{snapshot.input_rows[0].name}</option
        >{#each snapshot.input_rows.slice(1) as row}<option value={row.code}
            >{row.name}</option
          >{/each}</select
      ></label
    >
    <div class="evidence-summary">
      <div>
        <p class="work-muted">{selected.name}</p>
        <h3>
          {ranked
            ? 'Peringkat ' + ranked.rank + ' · Skor ' + number(ranked.score, 6)
            : 'Dikeluarkan dari peringkat'}
        </h3>
        <p>
          {hasSchools
            ? number(denominator, 0) + ' sekolah dalam rekap sumber'
            : 'Denominator sekolah kosong atau nol'}
        </p>
      </div>
      <div>
        <p class="work-muted">Alokasi</p>
        <strong
          >{packages == null
            ? 'Tidak tersedia'
            : number(packages, 0) + ' paket'}</strong
        >
      </div>
    </div>
    {#if ranked}<p class="allocation-fact">{allocationFact()}</p>{:else}<p
        class="allocation-fact"
      >
        Data belum memenuhi syarat pada indikator berbobot positif: {(
          snapshot.priority.excluded[selected.code] ?? []
        )
          .map((key) => labels[key] ?? key)
          .join(', ')}. Wilayah yang dikeluarkan tidak dianggap memiliki
        kebutuhan nol.
      </p>{/if}
    {#if option}<details>
        <summary>Biaya dan batas wilayah ini</summary>
        <dl>
          <dt>Biaya/paket asumsi demo</dt>
          <dd>{rupiah(option.cost_idr)}</dd>
          <dt>Kapasitas / minimum</dt>
          <dd>{option.capacity} / {option.minimum_packages} paket</dd>
          <dt>Sisa anggaran seluruh skenario</dt>
          <dd>
            {snapshot.allocation.evaluation
              ? rupiah(snapshot.allocation.evaluation.budget_remaining_idr)
              : 'Tidak tersedia'}
          </dd>
        </dl>
      </details>{/if}
    <div class="work-table">
      <table>
        <caption
          >Kontribusi skor: kebutuhan × bobot; kebutuhan = 1 − akses/100</caption
        ><thead
          ><tr
            ><th>Indikator</th><th>Akses</th><th>Kebutuhan (0–1)</th><th
              >Bobot</th
            ><th>Kontribusi</th><th>Bukti sumber</th></tr
          ></thead
        ><tbody
          >{#each Object.entries(snapshot.parameters.weights) as [key, value]}{@const access =
              selected.values[key]}{@const source = snapshot.sources.find(
              (item) => item.source_id === key,
            )}<tr
              ><td>{labels[key] ?? key}</td><td
                >{access == null || !hasSchools
                  ? 'Tidak tersedia'
                  : number(access) + '%'}</td
              ><td
                >{access == null || !hasSchools
                  ? 'Tidak tersedia'
                  : number(1 - Number(access) / 100, 6)}</td
              ><td>{number(Number(value) * 100)}%</td><td
                >{Number(value) === 0
                  ? 'Tidak aktif (bobot 0)'
                  : ranked?.contributions[key] == null
                    ? 'Tidak dihitung'
                    : number(ranked.contributions[key], 6)}</td
              ><td
                >{#if source}<details>
                    <summary
                      >Sel {selected.cells[key] ?? 'tidak tercatat'}</summary
                    >
                    <dl>
                      <dt>Sumber</dt>
                      <dd>
                        <a
                          href={source.source_url}
                          target="_blank"
                          rel="noreferrer">{source.title}</a
                        >
                      </dd>
                      <dt>Penerbit</dt>
                      <dd>{source.publisher}</dd>
                      <dt>Definisi</dt>
                      <dd>{source.definition}</dd>
                      <dt>Tahun ajaran</dt>
                      <dd>{source.academic_year}</dd>
                      <dt>Nilai sel asli</dt>
                      <dd>
                        {number(access)}
                        {source.unit === 'percent' ? '%' : ''}
                      </dd>
                      <dt>SHA-256</dt>
                      <dd class="checksum">{source.sha256}</dd>
                      <dt>Tanggal unduh</dt>
                      <dd>{source.retrieved_at ?? 'Belum diverifikasi'}</dd>
                      <dt>Status lisensi</dt>
                      <dd>{source.license_status}</dd>
                    </dl>
                  </details>{:else}Metadata belum tersedia{/if}</td
              ></tr
            >{/each}</tbody
        >
      </table>
    </div>
    <p class="work-muted">
      Nilai berasal dari rekap provinsi, jenjang {snapshot.parameters
        .education_level}, kepemilikan Total. Biaya dan kapasitas adalah asumsi
      pengguna. Skor kebutuhan tidak menunjukkan jumlah sekolah yang pasti
      terbantu.
    </p>
    <details>
      <summary>Identitas data dan perhitungan</summary>
      <dl>
        <dt>Rilis yang dipakai</dt>
        <dd>{snapshot.release_id}</dd>
        <dt>Status data</dt>
        <dd>{snapshot.data_status}</dd>
        <dt>Metode</dt>
        <dd>{snapshot.priority.method_version}</dd>
        <dt>Model / solver</dt>
        <dd>
          {snapshot.allocation.model_version} / {snapshot.allocation
            .solver_version ?? 'Tidak tersedia'}
        </dd>
        <dt>Status solusi</dt>
        <dd>{snapshot.allocation.status}</dd>
      </dl>
    </details>
  {:else}<p>
      Input rinci tidak tersedia pada snapshot ini. Buat skenario baru di <a
        href="/studio">Studio simulasi</a
      > untuk menelusuri bukti.
    </p>{/if}
</section>

<style>
  .evidence {
    background: var(--eq-surface);
  }
  .evidence header {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .evidence header > :global(svg) {
    color: var(--eq-primary);
    flex-shrink: 0;
    margin-top: 3px;
  }
  .evidence h2 {
    margin-bottom: 8px;
  }
  .region-picker {
    margin-block: 24px;
  }
  .evidence-summary {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
    background: var(--eq-sidebar);
    padding: 20px;
    border-radius: 10px;
  }
  .evidence-summary h3 {
    margin: 8px 0;
    font-size: 1.15rem;
  }
  .evidence-summary p {
    font-size: 14px;
  }
  .evidence-summary strong {
    display: block;
    font-size: 1.5rem;
    margin-top: 6px;
  }
  .allocation-fact {
    margin-block: 20px;
    font-size: 14px;
    line-height: 1.7;
  }
  .evidence :global(td details) {
    border: 0;
    padding: 0;
    min-width: 160px;
    max-width: 340px;
  }
  .evidence :global(td dl) {
    display: block;
  }
  .evidence :global(td dd) {
    margin: 4px 0 12px;
  }
  .evidence :global(td summary) {
    color: var(--eq-primary-hover);
    min-height: 44px;
  }
  .checksum {
    font-size: 12px;
    overflow-wrap: anywhere;
  }
</style>
