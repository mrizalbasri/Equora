<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { publicNavLinks, type PublicNavLink } from '$lib/api/workspace';
  import BrandMark from './BrandMark.svelte';
  import Icon from './Icon.svelte';

  let {
    children,
    links = publicNavLinks,
    calm = false,
  }: {
    children: Snippet;
    links?: PublicNavLink[];
    calm?: boolean;
  } = $props();

  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let navElement = $state<HTMLElement>();

  $effect(() => {
    page.url.href;
    menuOpen = false;
  });

  function closeNavigation() {
    menuOpen = false;
  }

  function closeOnOutsideClick(event: PointerEvent) {
    if (
      event.target instanceof Node &&
      !navElement?.contains(event.target) &&
      !menuButton?.contains(event.target)
    ) {
      closeNavigation();
    }
  }

  function closeOnFocusLeave(event: FocusEvent) {
    if (event.relatedTarget === menuButton) return;
    if (
      !(event.relatedTarget instanceof Node) ||
      !navElement?.contains(event.relatedTarget)
    ) {
      closeNavigation();
    }
  }

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

<svelte:window onkeydown={closeOnEscape} onpointerdown={closeOnOutsideClick} />

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="public-frame" class:calm>
  <header class="header-bar">
    <div class="eq-container header">
      <a href="/" class="wordmark header-brand" aria-label="Equora, beranda">
        <BrandMark />
        <span class="brand-caption">Data Fasilitas Pendidikan Indonesia</span>
      </a>

      <button
        class="menu"
        bind:this={menuButton}
        aria-expanded={menuOpen}
        aria-controls="public-navigation"
        onclick={() => {
          menuOpen = !menuOpen;
        }}
      >
        {menuOpen ? 'Tutup menu' : 'Menu'}
        <span class="menu-icon" aria-hidden="true"><span></span><span></span></span>
      </button>

      <nav
        id="public-navigation"
        bind:this={navElement}
        class:open={menuOpen}
        aria-label="Navigasi utama"
        onfocusout={closeOnFocusLeave}
      >
        {#each links as link}
          <a
            href={link.href}
            class="nav-link"
            aria-current={currentFor(link.href)}
            onclick={closeNavigation}
          >
            {link.label}
          </a>
        {/each}
        <a
          class="nav-link primary-cta"
          href="/explore"
          onclick={closeNavigation}
        >
          <span>Mulai Eksplorasi</span>
          <Icon name="arrow" size={16} />
        </a>
      </nav>
    </div>
  </header>

  <main id="main-content" tabindex="-1">{@render children()}</main>

  <footer class="eq-container footer">
    <div>
      <a class="wordmark" href="/" aria-label="Equora, beranda">
        <BrandMark compact />
      </a>
      <p>Pahami fasilitas pendidikan di daerah Anda.</p>
    </div>
    <a href="https://github.com/mrizalbasri/Equora">Repositori proyek</a>
    <a href="/datasets">Katalog dataset</a>
    <a href="/methodology">Metodologi</a>
    <p class="disclaimer">
      Simulasi berbasis data dan asumsi.<br />Bukan keputusan anggaran resmi.
    </p>
  </footer>
</div>

<style>
  .public-frame.calm {
    box-shadow: none;
  }
  .calm .header-bar {
    position: relative;
    background: white;
    backdrop-filter: none;
    border-bottom: 0;
    box-shadow: none;
  }
  .calm .header {
    min-height: 92px;
  }
  .calm .brand-caption {
    display: none;
  }
  .calm .footer {
    margin-top: 32px;
    padding-block: 36px;
  }
  .public-frame {
    width: calc(100% - 48px);
    max-width: 1360px;
    margin: 24px auto;
    background: var(--eq-surface);
    border-radius: 28px;
    box-shadow: 0 12px 48px rgb(31 45 61 / 5.5%);
  }
  .header-bar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--eq-surface);
    border-radius: 28px 28px 0 0;
    border-bottom: 1px solid var(--eq-border);
  }
  .header {
    min-height: 88px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .wordmark {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 32px;
    font-weight: 750;
    letter-spacing: -1.6px;
    text-decoration: none;
  }
  .header-brand {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex-shrink: 0;
    gap: 3px;
  }
  .header-brand .brand-caption {
    color: var(--eq-text-secondary);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.025em;
    line-height: 1.4;
  }
  nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .nav-link,
  .footer > a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    font-size: 14.5px;
    font-weight: 600;
    text-decoration: none;
  }
  .nav-link {
    position: relative;
    padding: 8px 14px;
    border: 0;
    background: transparent;
    border-radius: 8px;
    color: var(--eq-text-secondary);
    gap: 8px;
    white-space: nowrap;
    transition: all 160ms ease;
  }
  .nav-link:hover {
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    transform: translateY(-1px);
  }
  .nav-link[aria-current='page'] {
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    font-weight: 700;
  }
  .nav-link[aria-current='page']::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 14px;
    right: 14px;
    height: 2px;
    background: var(--eq-primary);
    border-radius: 1px;
  }
  .primary-cta {
    margin-left: 14px;
    padding: 9px 18px;
    background: var(--eq-primary);
    color: white !important;
    border-radius: 10px;
    font-weight: 650;
    box-shadow: 0 4px 14px rgba(31, 102, 193, 0.22);
    transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .primary-cta:hover {
    background: var(--eq-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(31, 102, 193, 0.32);
  }
  .primary-cta:active {
    transform: translateY(0);
  }
  .primary-cta :global(svg) {
    transition: transform 180ms ease;
  }
  .primary-cta:hover :global(svg) {
    transform: translateX(3px);
  }
  .footer > a:hover {
    color: var(--eq-primary-hover);
    text-decoration: underline;
  }
  .menu {
    display: none;
  }
  .menu-icon {
    width: 18px;
    display: grid;
    gap: 5px;
  }
  .menu-icon span {
    width: 18px;
    height: 2px;
    background: currentColor;
    transition: transform 160ms ease;
  }
  .menu[aria-expanded='true'] .menu-icon span:first-child {
    transform: translateY(3.5px) rotate(45deg);
  }
  .menu[aria-expanded='true'] .menu-icon span:last-child {
    transform: translateY(-3.5px) rotate(-45deg);
  }
  .skip-link {
    position: absolute;
    z-index: 30;
    left: 16px;
    top: -100px;
    padding: 12px 20px;
    background: var(--eq-surface-elevated);
  }
  .skip-link:focus {
    top: 12px;
  }
  .footer {
    padding-block: 40px;
    border-top: 1px solid var(--eq-border);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .footer p {
    font-size: 13px;
    color: var(--eq-text-secondary);
  }
  .disclaimer {
    text-align: right;
  }

  @media (max-width: 1023px) {
    .public-frame {
      width: 100%;
      margin: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .header-bar {
      border-radius: 0;
    }
    .header {
      min-height: 76px;
      flex-wrap: wrap;
      gap: 12px;
      padding-block: 14px;
    }
    .header-brand .brand-caption {
      font-size: 10px;
    }
    .menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 10px 14px;
      min-height: 48px;
      border: 1px solid var(--eq-control-border);
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
    }
    nav {
      display: none;
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      padding-block: 14px 10px;
      border-top: 1px solid var(--eq-border);
      max-height: calc(100dvh - 112px);
      overflow-y: auto;
    }
    nav.open {
      display: flex;
    }
    @media (prefers-reduced-motion: no-preference) {
      nav.open {
        animation: mobile-nav-enter 240ms cubic-bezier(0.16, 1, 0.3, 1);
      }
    }
    .nav-link {
      padding: 12px 14px;
      font-size: 15px;
    }
    .primary-cta {
      margin-left: 0;
      margin-top: 8px;
      justify-content: center;
    }
    .footer {
      align-items: flex-start;
      flex-direction: column;
    }
    .disclaimer {
      text-align: left;
    }
  }

  @keyframes mobile-nav-enter {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
