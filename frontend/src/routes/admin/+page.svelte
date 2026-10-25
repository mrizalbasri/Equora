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

<svelte:head><title>Impor lokal · Equora</title></svelte:head>
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
</WorkspaceShell>

<style>
  .admin-import-panel {
    max-width: 780px;
  }
  .security-note {
    font-size: 12px;
    margin-top: 16px;
    line-height: 1.6;
  }
</style>
