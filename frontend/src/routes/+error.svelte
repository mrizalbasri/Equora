<script lang="ts">
  import { page } from '$app/state';
  import PublicShell from '$lib/components/PublicShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head><title>{page.status === 404 ? 'Halaman tidak ditemukan' : 'Halaman belum dapat dibuka'} · Equora</title><meta name="robots" content="noindex" /></svelte:head>

<PublicShell>
  <section class="error-page" aria-labelledby="error-title">
    <p class="eq-kicker">Equora · {page.status}</p>
    <h1 id="error-title">{page.status === 404 ? 'Halaman yang Anda cari tidak ditemukan.' : 'Halaman belum dapat dibuka.'}</h1>
    <p>{page.status === 404 ? 'Tautannya mungkin berubah atau alamatnya belum lengkap. Anda dapat kembali ke beranda atau mulai dari profil provinsi.' : 'Layanan mungkin sedang mengalami gangguan. Muat ulang halaman untuk mencoba kembali atau kembali ke beranda.'}</p>
    <div class="error-actions">
      <a class="eq-button eq-button-primary" href="/">Kembali ke beranda <Icon name="arrow" size={18} /></a>
      {#if page.status === 404}<a class="eq-button" href="/daerah">Pendidikan di Daerah Saya</a>
      {:else}<button type="button" class="eq-button" onclick={() => window.location.reload()}>Coba lagi</button>{/if}
    </div>
  </section>
</PublicShell>

<style>
  .error-page { width: min(800px, calc(100% - 48px)); padding-block: 80px 112px; margin-inline: auto; min-height: 480px; }
  h1 { margin-block: 20px; font-size: clamp(2rem, 4vw, 3.5rem); letter-spacing: -0.035em; line-height: 1.15; }
  .error-page > p:not(.eq-kicker) { max-width: 60ch; color: var(--eq-text-secondary); line-height: 1.7; }
  .error-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
  .error-actions a { gap: 8px; }
  @media (max-width: 639px) { .error-page { padding-block: 48px 64px; } }
</style>
