<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { navigation, type NavigationEntry } from '$lib/api/workspace';
  import BrandMark from './BrandMark.svelte';
  import Icon from './Icon.svelte';
  import AccountControls from './AccountControls.svelte';

  let { children, links = navigation, calm = false }: {
    children: Snippet;
    links?: NavigationEntry[];
    calm?: boolean;
  } = $props();
  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let navElement = $state<HTMLElement>();
  let openGroup = $state<string | null>(null);
  const groupButtons = new Map<string, HTMLButtonElement>();

  $effect(() => {
    page.url.href;
    menuOpen = false;
    openGroup = null;
  });

  function closeNavigation() {
    menuOpen = false;
    openGroup = null;
  }

  function closeOnOutsideClick(event: PointerEvent) {
    if (event.target instanceof Node && !navElement?.contains(event.target) && !menuButton?.contains(event.target)) {
      closeNavigation();
    }
  }

  function closeOnFocusLeave(event: FocusEvent) {
    if (event.relatedTarget === menuButton) return;
    if (!(event.relatedTarget instanceof Node) || !navElement?.contains(event.relatedTarget)) {
      closeNavigation();
    }
  }

  function registerGroup(button: HTMLButtonElement, label: string) {
    groupButtons.set(label, button);
    return { destroy: () => { groupButtons.delete(label); } };
  }

  function currentFor(href: string): 'page' | 'location' | undefined {
    const target = new URL(href, page.url);
    if (target.pathname !== page.url.pathname) return undefined;
    if (target.hash) return target.hash === page.url.hash ? 'location' : undefined;
    return 'page';
  }

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (openGroup) {
      groupButtons.get(openGroup)?.focus();
      openGroup = null;
    } else if (menuOpen) {
      menuOpen = false;
      menuButton?.focus();
    }
  }
</script>

<svelte:window onkeydown={closeOnEscape} onpointerdown={closeOnOutsideClick} />

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="public-frame" class:calm>
<header class="header-bar">
<div class="eq-container header">
  <a href="/" class="wordmark header-brand" aria-label="Equora, beranda"><BrandMark /><span class="brand-caption">Kenali pendidikan di daerah Anda</span></a>
  {#if links.length}
    <button class="menu" bind:this={menuButton} aria-expanded={menuOpen}
      aria-controls="public-navigation" onclick={() => { menuOpen = !menuOpen; openGroup = null; }}>
      {menuOpen ? 'Tutup menu' : 'Menu'}
      <span class="menu-icon" aria-hidden="true"><span></span><span></span></span>
    </button>
    <nav id="public-navigation" bind:this={navElement} class:open={menuOpen} aria-label="Navigasi utama" onfocusout={closeOnFocusLeave}>
      {#each links as link, index}
        {#if link.items}
          <div class="nav-group">
            <button class="nav-link group-trigger" class:group-active={link.items.some(item => currentFor(item.href))}
              use:registerGroup={link.label} aria-expanded={openGroup === link.label}
              aria-controls={`public-group-${index}`} onclick={() => openGroup = openGroup === link.label ? null : link.label}>
              {link.label}<span class="dropdown-chevron" aria-hidden="true"><Icon name="chevron" size={14} /></span>
            </button>
            <div class="dropdown" id={`public-group-${index}`} hidden={openGroup !== link.label}>
              <p class="dropdown-heading">{link.label === 'Eksplorasi' ? 'Kenali data pendidikan' : 'Uji pilihan alokasi'}</p>
              {#each link.items as item}
                <a class="dropdown-link" href={item.href} aria-current={currentFor(item.href)} onclick={closeNavigation}>
                  <span class="dropdown-icon"><Icon name={item.icon} size={21} /></span>
                  <span class="dropdown-copy"><span class="dropdown-title">{item.label}</span><span class="dropdown-description">{item.description}</span></span>
                </a>
              {/each}
            </div>
          </div>
        {:else}
          <a href={link.href} class="nav-link" aria-current={currentFor(link.href)} onclick={closeNavigation}>{link.label}</a>
        {/if}
      {/each}
      <AccountControls />
      <a class="nav-link primary-link" href="/daerah" aria-current={currentFor('/daerah')} onclick={closeNavigation}>Daerah Saya<Icon name="map" size={18} /></a>
    </nav>
  {/if}
</div>
</header>

<main id="main-content" tabindex="-1">{@render children()}</main>

<footer class="eq-container footer">
  <div><a class="wordmark" href="/" aria-label="Equora, beranda"><BrandMark compact /></a>
    <p>Pahami fasilitas pendidikan di daerah Anda.</p></div>
  <a href="https://github.com/mrizalbasri/Equora">Repositori proyek</a>
  <a href="/datasets">Katalog dataset</a>
  <a href="/methodology">Metodologi</a>
  <p class="disclaimer">Simulasi berbasis data dan asumsi.<br />Bukan keputusan anggaran resmi.</p>
</footer>
</div>

<style>
  .public-frame.calm { box-shadow: none; }
  .calm .header-bar { position: relative; background: white; backdrop-filter: none; border-bottom: 0; box-shadow: none; }
  .calm .header { min-height: 92px; }
  .calm .brand-caption { display: none; }
  .calm .nav-link.primary-link { box-shadow: none; }
  .calm .footer { margin-top: 32px; padding-block: 36px; }
  .public-frame { width: calc(100% - 48px); max-width: 1360px; margin: 24px auto; background: var(--eq-surface); border-radius: 28px; box-shadow: 0 12px 48px rgb(31 45 61 / 5.5%); }
  .header-bar { position: sticky; top: 0; z-index: 20; background: var(--eq-surface); border-radius: 28px 28px 0 0; border-bottom: 1px solid var(--eq-border); }
  .header { min-height: 88px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .wordmark { display: inline-flex; align-items: center; min-height: 44px; font-size: 32px; font-weight: 750; letter-spacing: -1.6px; text-decoration: none; }
  .header-brand { flex-direction: column; align-items: flex-start; justify-content: center; flex-shrink: 0; gap: 3px; }
  .header-brand .brand-caption { color: var(--eq-text-secondary); font-size: 11px; font-weight: 500; letter-spacing: 0.025em; line-height: 1.4; }
  nav { display: flex; align-items: center; gap: 4px; }
  .nav-link, .footer > a { display: inline-flex; align-items: center; min-height: 48px; font-size: 15px; font-weight: 550; text-decoration: none; }
  .nav-link { position: relative; padding: 10px 12px; border: 0; background: transparent; border-radius: 8px; color: var(--eq-text-secondary); gap: 8px; white-space: nowrap; transition: color 160ms ease, background-color 160ms ease; }
  .nav-link:hover, .nav-link[aria-current], .group-active, .group-trigger[aria-expanded='true'] { background: var(--eq-primary-tint); color: var(--eq-primary-hover); }
  .nav-link[aria-current]::after { content: ''; position: absolute; bottom: 4px; left: 14px; right: 14px; height: 2px; background: var(--eq-primary); }
  .nav-group { position: relative; }
  .dropdown-chevron { display: inline-flex; transform: rotate(90deg); transition: transform 160ms ease; }
  .group-trigger[aria-expanded='true'] .dropdown-chevron { transform: rotate(-90deg); }
  .dropdown { position: absolute; top: calc(100% + 12px); left: 0; width: 360px; padding: 10px; border: 1px solid var(--eq-border); border-radius: 14px; background: var(--eq-surface); box-shadow: 0 16px 40px rgb(31 45 61 / 12%); }
  .dropdown[hidden] { display: none; }
  @media (prefers-reduced-motion: no-preference) {
    .dropdown:not([hidden]) { animation: dropdown-enter 280ms cubic-bezier(0.22, 0.68, 0.25, 1); transform-origin: top; }
    .dropdown-link { transition: background-color 160ms ease, translate 180ms ease; }
    .dropdown-link:hover { translate: 3px 0; }
    .primary-link :global(svg) { transition: translate 180ms ease; }
    .primary-link:hover :global(svg) { translate: 3px 0; }
  }
  @keyframes dropdown-enter {
    from { opacity: 0; translate: 0 -4px; scale: 0.99; }
    to { opacity: 1; translate: 0 0; scale: 1; }
  }
  .nav-group:nth-last-child(3) .dropdown { left: auto; right: 0; }
  .dropdown-heading { padding: 10px 12px 8px; color: var(--eq-text-muted); font-size: 12px; font-weight: 550; }
  .dropdown-link { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 8px; text-decoration: none; transition: background-color 160ms ease; }
  .dropdown-link:hover, .dropdown-link[aria-current] { background: var(--eq-primary-tint); }
  .dropdown-icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; width: 36px; height: 36px; border: 1px solid var(--eq-border); border-radius: 8px; background: var(--eq-surface-subtle); color: var(--eq-primary-hover); }
  .dropdown-copy { display: grid; gap: 4px; min-width: 0; }
  .dropdown-title { color: var(--eq-text); font-size: 14px; font-weight: 600; line-height: 1.4; }
  .dropdown-description { color: var(--eq-text-secondary); font-size: 12px; line-height: 1.6; }
  .nav-link.primary-link { padding-inline: 16px; margin-left: 20px; background: var(--eq-primary); color: white; font-weight: 650; }
  .nav-link.primary-link:hover { background: var(--eq-primary-hover); }
  .primary-link[aria-current]::after { background: white; }
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
    .nav-link { font-size: 13px; }
    .nav-link { padding-inline: 8px; }
    .nav-link.primary-link { padding-inline: 12px; margin-left: 12px; gap: 6px; }
  }
  @media (max-width: 1023px) {
    .public-frame { width: 100%; margin: 0; border-radius: 0; box-shadow: none; }
    .header-bar { border-radius: 0; }
    .header { min-height: 76px; flex-wrap: wrap; gap: 12px; padding-block: 14px; }
    .header-brand .brand-caption { font-size: 10px; }
    .menu { display: inline-flex; align-items: center; justify-content: center; gap: 12px; padding: 10px 14px; min-height: 48px; border: 1px solid var(--eq-control-border); border-radius: 10px; font-size: 16px; font-weight: 600; }
    nav { display: none; width: 100%; flex-direction: column; align-items: stretch; gap: 4px; padding-block: 12px 4px; border-top: 1px solid var(--eq-border); max-height: calc(100dvh - 112px); overflow-y: auto; }
    nav.open { display: flex; }
    @media (prefers-reduced-motion: no-preference) {
      nav.open { animation: mobile-nav-enter 280ms cubic-bezier(0.22, 0.68, 0.25, 1); }
    }
    .nav-link { padding: 12px 14px; }
    .group-trigger { width: 100%; justify-content: space-between; }
    .dropdown { position: static; width: 100%; margin-block: 4px 8px; padding: 4px; border: 0; border-radius: 10px; background: var(--eq-surface-subtle); box-shadow: none; }
    .dropdown-heading { padding-inline: 12px; }
    .dropdown-link { padding: 12px; }
    .dropdown-title { font-size: 13px; }
    .nav-link.primary-link { margin: 12px 0 0; justify-content: center; }
    .footer { align-items: flex-start; flex-direction: column; }
    .disclaimer { text-align: left; }
  }
  @keyframes mobile-nav-enter {
    from { opacity: 0; translate: 0 -6px; }
    to { opacity: 1; translate: 0 0; }
  }
</style>
