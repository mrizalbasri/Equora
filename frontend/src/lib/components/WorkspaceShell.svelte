<script lang="ts">
  import type { Snippet } from 'svelte';
  import PublicShell from './PublicShell.svelte';
  import { navigation } from '$lib/api/workspace';
  let {
    title,
    subtitle,
    children,
  }: { title: string; subtitle: string; children: Snippet } = $props();
</script>

<PublicShell links={navigation}>
  <div class="eq-container workspace">
    <header class="workspace-heading">
      <p class="eq-kicker">WORKSPACE LOKAL · PENDIDIKAN</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
    <aside class="review-notice">
      Review lokal · Data agregat 2025/2026. Lisensi redistribusi dan tanggal
      unduh pengguna belum diverifikasi. Simulasi bukan keputusan anggaran
      resmi.
    </aside>
    {@render children()}
  </div>
</PublicShell>
