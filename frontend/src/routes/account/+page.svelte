<script lang="ts">
  import PublicShell from '$lib/components/PublicShell.svelte';
  let { data } = $props();
</script>
<svelte:head><title>Akun saya — Equora</title><meta name="robots" content="noindex" /></svelte:head>
<PublicShell>
  <section class="account-page">
    <h1>Akun saya</h1>
    <p>Anda masuk sebagai <strong>{data.account.name}</strong>.</p>
    {#if data.account.email}<p>{data.account.email}</p>{/if}
    <p class="eq-secondary">Sesi akun Anda telah diverifikasi. Impor dataset tetap memerlukan izin admin terpisah.</p>
    <div><a class="eq-button eq-button-primary" href="/explore">Jelajahi data</a><a class="eq-button" href="/studio">Buka studio simulasi</a></div>
  </section>
</PublicShell>
<style>
  .account-page { width: min(800px, calc(100% - 32px)); margin: 64px auto; min-height: 400px; }
  h1 { font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -0.035em; }
  p { margin-top: 20px; overflow-wrap: anywhere; }
  .account-page > div { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
</style>
