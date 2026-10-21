<script lang="ts">
  import WorkspaceShell from '$lib/components/WorkspaceShell.svelte';
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

<WorkspaceShell
  title="Impor lokal terverifikasi"
  subtitle="Ulangi impor berkas yang sudah tercantum dalam manifest audit. Impor menghasilkan snapshot review lokal dan tidak memublikasikan data."
>
  <form class="work-panel" onsubmit={run}>
    <h2>Jalankan pemeriksaan dan impor</h2>
    <p>
      Nama berkas, SHA-256, header, skala persentase dan cakupan diperiksa
      sebelum transaksi disimpan. Berkas yang berubah memerlukan audit ulang.
    </p>
    <label class="work-field"
      >Token admin lokal<input
        type="password"
        bind:value={token}
        required
        autocomplete="off"
      /></label
    >
    <div class="work-actions">
      <button class="eq-button eq-button-primary" disabled={busy || !token}
        >{busy ? 'Memeriksa berkas…' : 'Periksa & impor snapshot'}</button
      >
    </div>
    <p class="work-muted">
      Gunakan ADMIN_TOKEN dari konfigurasi backend lokal. Token hanya dipakai
      untuk permintaan ini dan tidak disimpan di browser.
    </p>
  </form>
  {#if error}<p class="work-error" role="alert">{error}</p>{/if}{#if result}<p
      role="status"
    >
      Impor berhasil: {result.sources} sumber, {result.imports} scope. Snapshot {result.release_id}.
    </p>{/if}<a href="/datasets">Lihat katalog & kualitas →</a>
</WorkspaceShell>
