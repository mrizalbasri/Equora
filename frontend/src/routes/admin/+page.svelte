<script lang="ts">
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { api } from '$lib/api/workspace';
  let token = $state('');
  let busy = $state(false);
  let error = $state('');
  let result = $state<{
    release_id: string;
    sources: number;
    imports: number;
  }>();
  async function run(event: SubmitEvent) {
    event.preventDefault();
    busy = true;
    error = '';
    result = undefined;
    try {
      result = await api('admin/import', {}, token);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      busy = false;
      token = '';
    }
  }
</script>

<svelte:head><title>Impor lokal · Equora</title><meta name="description" content="Halaman administrasi untuk memeriksa dan mengimpor manifest data pendidikan lokal terverifikasi." /></svelte:head>
<WorkspaceShell
  title="Impor lokal terverifikasi"
  subtitle="Ulangi impor berkas yang sudah tercantum dalam manifest audit. Impor menghasilkan snapshot review lokal dan tidak memublikasikan data."
>
  <form class="work-panel admin-import-panel" onsubmit={run}>
    <h2>Jalankan pemeriksaan dan impor</h2>
    <p class="work-muted" style="margin-bottom: 20px;">
      Nama berkas, SHA-256 checksum, header kolom, skala persentase, dan cakupan wilayah
      diverifikasi secara ketat sebelum transaksi database disimpan.
    </p>

    <label class="work-field" style="max-width: 440px;">
      Token otentikasi admin
      <input
        type="password"
        bind:value={token}
        required
        autocomplete="off"
        placeholder="Masukkan ADMIN_TOKEN..."
      />
    </label>

    <div class="work-actions">
      <button class="eq-button eq-button-primary" disabled={busy || !token}>
        {busy ? 'Memverifikasi berkas & mengimpor…' : 'Periksa & impor snapshot'}
      </button>
    </div>

    <p class="work-muted security-note">
      Gunakan token rahasia dari environment backend lokal Anda. Token hanya dikirimkan
      melalui header otorisasi untuk permintaan ini dan tidak pernah disimpan di peramban.
    </p>
  </form>

  {#if error}
    <div class="work-error" role="alert">
      <Icon name="alert" size={18} />
      <span>{error}</span>
    </div>
  {/if}

  {#if result}
    <div class="work-success" role="status">
      <Icon name="check" size={20} />
      <div>
        <strong>Impor lokal berhasil diselesaikan!</strong>
        <p style="margin: 4px 0 0; font-size: 13px;">
          Diproses <strong>{result.sources}</strong> berkas sumber dan <strong>{result.imports}</strong> scope pendidikan.
          Snapshot aktif: <code style="font-family: ui-monospace, monospace; background: white; padding: 2px 6px; border-radius: 4px;">{result.release_id}</code>
        </p>
      </div>
    </div>
    <div style="margin-top: 16px;">
      <a href="/datasets" class="eq-button eq-button-primary">
        Buka Katalog & Kualitas Dataset
      </a>
    </div>
  {/if}

  <section class="work-panel admin-governance-panel" aria-labelledby="role-matrix-title">
    <span class="eq-kicker">VALIDASI ALUR PENGGUNA (USER FLOW)</span>
    <h2 id="role-matrix-title">Batasan fitur masyarakat umum vs pemerintah & admin</h2>
    <p class="work-muted" style="margin-bottom: 16px;">
      Platform memisahkan hak akses pembacaan publik, simulasi kebijakan, dan mutasi rilis dataset agar transparansi data tetap terjaga.
    </p>
    <div class="work-table">
      <table>
        <caption>Matriks peran, akses fitur, dan batasan otorisasi</caption>
        <thead>
          <tr>
            <th>Peran pengguna</th>
            <th>Rute utama</th>
            <th>Hak interaksi & fitur</th>
            <th>Batasan & pengamanan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Masyarakat Umum</strong></td>
            <td><code>/daerah</code>, <code>/explore</code>, <code>/datasets</code></td>
            <td>Melihat profil fasilitas provinsi, peta GIS sebaran & selisih median, bukti sel workbook, serta ekspor CSV.</td>
            <td>Akses terbuka tanpa login; <em>read-only</em> terhadap rilis dataset aktif.</td>
          </tr>
          <tr>
            <td><strong>Perencana & Pemerintah</strong></td>
            <td><code>/studio</code>, <code>/compare</code>, <code>/scenarios/[id]</code></td>
            <td>Menjalankan simulasi prioritas MCDA & alokasi CP-SAT, melihat peta GIS urgensi alokasi, uji sensitivitas, dan unduh Memo Kebijakan PDF.</td>
            <td>Menyimpan snapshot skenario terisolasi versi rilis (<code>release_id</code>) tanpa mengubah data dasar.</td>
          </tr>
          <tr>
            <td><strong>Administrator Data</strong></td>
            <td><code>/admin</code> (<code>POST /api/v1/admin/import</code>)</td>
            <td>Menjalankan pipeline ETL Polars untuk memvalidasi manifest berkas sumber dan memperbarui snapshot rilis.</td>
            <td>Wajib <code>Bearer ADMIN_TOKEN</code>; gagal otomatis (<em>fail-closed</em>) jika SHA-256 checksum atau struktur sel tidak cocok.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="work-panel admin-governance-panel" aria-labelledby="modularity-title">
    <span class="eq-kicker">KESIAPAN TEKNIS SKALA BESAR</span>
    <h2 id="modularity-title">Arsitektur modular frontend & backend</h2>
    <div class="work-grid">
      <div class="arch-card">
        <strong>1. Pipeline ETL Polars & Manifest Registry</strong>
        <p class="work-muted">
          Modul <code>backend/app/etl/</code> memvalidasi SHA-256, header, denominator, dan kode BPS secara vektorisasi sehingga siap diperluas ke tingkat Kabupaten/Kota atau lintas tahun ajaran.
        </p>
      </div>
      <div class="arch-card">
        <strong>2. Mesin MCDA & Solver CP-SAT Terpisah</strong>
        <p class="work-muted">
          Modul <code>backend/app/priority/</code> dan <code>backend/app/allocation/</code> terpisah dari lapisan HTTP, mendukung penambahan indikator baru maupun batasan kebijakan daerah tanpa mengubah kontrak utama.
        </p>
      </div>
      <div class="arch-card">
        <strong>3. Kontrak OpenAPI & Adapter GIS Murni</strong>
        <p class="work-muted">
          Komponen SvelteKit (<code>ProvinceMap</code>, <code>ScenarioResult</code>, <code>DecisionReview</code>) mengonsumsi skema TypeScript tergenerasi dari OpenAPI dan tile vektor <code>PMTiles</code> berefisiensi tinggi.
        </p>
      </div>
    </div>
  </section>
</WorkspaceShell>

<style>
  .admin-import-panel,
  .admin-governance-panel {
    max-width: 960px;
  }
  .arch-card {
    padding: 14px 16px;
    border: 1px solid var(--eq-border);
    border-radius: 10px;
    background: var(--eq-surface-subtle);
    display: grid;
    gap: 6px;
  }
  .arch-card strong {
    font-size: 14px;
    color: var(--eq-text);
  }
  .arch-card p {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
  }
  .security-note {
    font-size: 12px;
    margin-top: 16px;
    line-height: 1.6;
  }
</style>
