<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, links = [] }: {
    children: Snippet;
    links?: { label: string; href: string }[];
  } = $props();
  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && menuOpen) {
      menuOpen = false;
      menuButton?.focus();
    }
  }
</script>

<svelte:window onkeydown={closeOnEscape} />

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="public-frame">
<header class="eq-container header">
  <a href="/" class="wordmark" aria-label="Equora, beranda">equora<span>.</span></a>
  {#if links.length}
    <button class="eq-button menu" bind:this={menuButton} aria-expanded={menuOpen}
      aria-controls="public-navigation" onclick={() => menuOpen = !menuOpen}>
      {menuOpen ? 'Tutup menu' : 'Menu'}
    </button>
    <nav id="public-navigation" class:open={menuOpen} aria-label="Navigasi utama">
      {#each links as link}
        <a href={link.href} onclick={() => menuOpen = false}>{link.label}</a>
      {/each}
    </nav>
  {/if}
</header>

<main id="main-content" tabindex="-1">{@render children()}</main>

<footer class="eq-container footer">
  <div><a class="wordmark" href="/" aria-label="Equora, beranda">equora<span>.</span></a>
    <p>Public Resource Decision Intelligence</p></div>
  <a href="https://github.com/mrizalbasri/Equora">Repositori proyek</a>
  <p class="disclaimer">Simulasi berbasis data dan asumsi.<br />Bukan keputusan anggaran resmi.</p>
</footer>
</div>

<style>
  .public-frame { width: calc(100% - 48px); max-width: 1360px; margin: 24px auto; background: var(--eq-surface); border-radius: 28px; box-shadow: 0 12px 48px rgb(31 45 61 / 5.5%); }
  .header { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .wordmark { display: inline-flex; align-items: center; min-height: 44px; font-size: 32px; font-weight: 750; letter-spacing: -1.6px; text-decoration: none; }
  .wordmark span { color: var(--eq-primary); }
  nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; }
  nav a, .footer > a { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; font-weight: 550; text-decoration: none; }
  nav a:hover, .footer > a:hover { color: var(--eq-primary-hover); text-decoration: underline; }
  .menu { display: none; }
  .skip-link { position: absolute; z-index: 10; left: 16px; top: -100px; padding: 12px 20px; background: var(--eq-surface-elevated); }
  .skip-link:focus { top: 12px; }
  .footer { padding-block: 40px; border-top: 1px solid var(--eq-border); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
  .footer p { font-size: 13px; color: var(--eq-text-secondary); }
  .disclaimer { text-align: right; }
  @media (max-width: 767px) {
    .public-frame { width: 100%; margin: 0; border-radius: 0; box-shadow: none; }
    .header { min-height: 80px; flex-wrap: wrap; gap: 12px; padding-block: 16px; }
    .menu { display: inline-flex; }
    nav { display: none; width: 100%; flex-direction: column; align-items: stretch; gap: 4px; padding-bottom: 8px; }
    nav.open { display: flex; }
    nav a { padding: 8px 12px; background: var(--eq-surface); border-radius: var(--eq-radius-sm); }
    .footer { align-items: flex-start; flex-direction: column; }
    .disclaimer { text-align: left; }
  }
</style>
