<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { navigation } from '$lib/api/workspace';
  import Icon from './Icon.svelte';
  import AccountControls from './AccountControls.svelte';

  let { children, links = navigation }: {
    children: Snippet;
    links?: { label: string; href: string }[];
  } = $props();
  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();

  function currentFor(href: string): 'page' | 'location' | undefined {
    const target = new URL(href, page.url);
    if (target.pathname !== page.url.pathname) return undefined;
    if (target.hash) return target.hash === page.url.hash ? 'location' : undefined;
    return 'page';
  }

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
<header class="header-bar">
<div class="eq-container header">
  <a href="/" class="wordmark header-brand" aria-label="Equora, beranda"><span class="brand-name">equora<span>.</span></span><span class="brand-caption">Data untuk keputusan</span></a>
  {#if links.length}
    <button class="menu" bind:this={menuButton} aria-expanded={menuOpen}
      aria-controls="public-navigation" onclick={() => menuOpen = !menuOpen}>
      {menuOpen ? 'Tutup menu' : 'Menu'}
      <span class="menu-icon" aria-hidden="true"><span></span><span></span></span>
    </button>
    <nav id="public-navigation" class:open={menuOpen} aria-label="Navigasi utama">
      {#each links as link}
        <a href={link.href} class="nav-link" class:primary-link={link.href === '/explore'} class:reference-start={link.href === '/methodology'} aria-current={currentFor(link.href)} onclick={() => menuOpen = false}>
          {#if link.href === '/explore'}<Icon name="compass" size={17} />{/if}{link.label}{#if link.href === '/explore'}<Icon name="arrow" size={15} />{/if}
        </a>
      {/each}
      <AccountControls />
    </nav>
  {/if}
</div>
</header>

<main id="main-content" tabindex="-1">{@render children()}</main>

<footer class="eq-container footer">
  <div><a class="wordmark" href="/" aria-label="Equora, beranda">equora<span>.</span></a>
    <p>Public Resource Decision Intelligence</p></div>
  <a href="https://github.com/mrizalbasri/Equora">Repositori proyek</a>
  <a href="/datasets">Katalog dataset</a>
  <a href="/methodology">Metodologi</a>
  <p class="disclaimer">Simulasi berbasis data dan asumsi.<br />Bukan keputusan anggaran resmi.</p>
</footer>
</div>

<style>
  .public-frame { width: calc(100% - 48px); max-width: 1360px; margin: 24px auto; background: var(--eq-surface); border-radius: 28px; box-shadow: 0 12px 48px rgb(31 45 61 / 5.5%); }
  .header-bar { position: sticky; top: 0; z-index: 20; background: rgb(255 255 255 / 96%); backdrop-filter: blur(12px); border-radius: 28px 28px 0 0; border-bottom: 1px solid var(--eq-border); box-shadow: 0 4px 18px rgb(31 45 61 / 3%); }
  .header { min-height: 88px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .wordmark { display: inline-flex; align-items: center; min-height: 44px; font-size: 32px; font-weight: 750; letter-spacing: -1.6px; text-decoration: none; }
  .wordmark span { color: var(--eq-primary); }
  .header-brand { flex-direction: column; align-items: flex-start; justify-content: center; flex-shrink: 0; gap: 3px; }
  .header-brand .brand-name { color: var(--eq-text); line-height: 1; }
  .header-brand .brand-caption { color: var(--eq-text-secondary); font-size: 11px; font-weight: 500; letter-spacing: 0.025em; line-height: 1.4; }
  nav { display: flex; align-items: center; gap: 4px; }
  nav a, .footer > a { display: inline-flex; align-items: center; min-height: 44px; font-size: 14px; font-weight: 550; text-decoration: none; }
  .nav-link { position: relative; padding: 10px 12px; border-radius: 8px; color: var(--eq-text-secondary); gap: 8px; white-space: nowrap; transition: color 160ms ease, background-color 160ms ease; }
  .nav-link:hover, .nav-link[aria-current] { background: var(--eq-primary-tint); color: var(--eq-primary-hover); }
  .nav-link[aria-current]::after { content: ''; position: absolute; bottom: 4px; left: 14px; right: 14px; height: 2px; background: var(--eq-primary); }
  .nav-link.reference-start { margin-left: 12px; }
  .nav-link.reference-start::before { content: ''; position: absolute; left: -8px; top: 12px; bottom: 12px; width: 1px; background: var(--eq-border); }
  .nav-link.primary-link { padding-inline: 16px; margin-right: 8px; background: var(--eq-primary); color: white; font-weight: 650; box-shadow: 0 3px 8px rgb(18 100 216 / 15%); }
  .nav-link.primary-link:hover { background: var(--eq-primary-hover); }
  .footer > a:hover { color: var(--eq-primary-hover); text-decoration: underline; }
  .menu { display: none; }
  .menu-icon { width: 18px; display: grid; gap: 5px; }
  .menu-icon span { width: 18px; height: 2px; background: currentColor; transition: transform 160ms ease; }
  .menu[aria-expanded='true'] .menu-icon span:first-child { transform: translateY(3.5px) rotate(45deg); }
  .menu[aria-expanded='true'] .menu-icon span:last-child { transform: translateY(-3.5px) rotate(-45deg); }
  .skip-link { position: absolute; z-index: 30; left: 16px; top: -100px; padding: 12px 20px; background: var(--eq-surface-elevated); }
  .skip-link:focus { top: 12px; }
  .footer { padding-block: 40px; border-top: 1px solid var(--eq-border); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 24px; }
  .footer p { font-size: 13px; color: var(--eq-text-secondary); }
  .disclaimer { text-align: right; }
  @media (min-width: 1024px) and (max-width: 1199px) {
    .header { gap: 12px; }
    nav { gap: 0; }
    nav a { font-size: 13px; }
    .nav-link { padding-inline: 8px; }
    .nav-link.primary-link { padding-inline: 12px; margin-right: 4px; gap: 6px; }
    .nav-link.reference-start { margin-left: 8px; }
    .nav-link.reference-start::before { left: -4px; }
  }
  @media (max-width: 1023px) {
    .public-frame { width: 100%; margin: 0; border-radius: 0; box-shadow: none; }
    .header-bar { border-radius: 0; }
    .header { min-height: 76px; flex-wrap: wrap; gap: 12px; padding-block: 14px; }
    .header-brand .brand-caption { font-size: 10px; }
    .menu { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 10px 14px; min-height: 44px; border: 1px solid var(--eq-control-border); border-radius: 10px; font-size: 14px; font-weight: 600; }
    nav { display: none; width: 100%; flex-direction: column; align-items: stretch; gap: 4px; padding-block: 12px 4px; border-top: 1px solid var(--eq-border); max-height: calc(100dvh - 112px); overflow-y: auto; }
    nav.open { display: flex; }
    .nav-link { padding: 12px 14px; }
    .nav-link.primary-link { margin: 0 0 8px; justify-content: center; }
    .nav-link.reference-start { margin: 8px 0 0; border-top: 1px solid var(--eq-border); border-radius: 0; padding-top: 16px; }
    .nav-link.reference-start::before { display: none; }
    .footer { align-items: flex-start; flex-direction: column; }
    .disclaimer { text-align: left; }
  }
</style>
