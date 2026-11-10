<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { publicNavLinks, type PublicNavLink } from '$lib/api/workspace';
  import BrandMark from './BrandMark.svelte';
  import Icon from './Icon.svelte';

  let {
    children,
    links = publicNavLinks,
    calm = true,
  }: {
    children: Snippet;
    links?: PublicNavLink[];
    calm?: boolean;
  } = $props();

  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let navElement = $state<HTMLElement>();
  let footerDecorEl = $state<HTMLElement | null>(null);
  let footerActive = $state(false);

  $effect(() => {
    if (!footerDecorEl) return;

    let isIntersecting = false;
    const updateActive = () => {
      footerActive = isIntersecting && !document.hidden;
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      updateActive();
    });
    observer.observe(footerDecorEl);

    document.addEventListener('visibilitychange', updateActive);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateActive);
    };
  });

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

  <footer class="footer">
    <div class="eq-container footer-content">
      <div class="footer-main">
        <div class="footer-brand">
          <a class="wordmark" href="/" aria-label="Equora, beranda">
            <BrandMark compact />
          </a>
          <p>Pahami fasilitas pendidikan di daerah Anda.</p>
        </div>

        <nav class="footer-navigation" aria-label="Navigasi footer">
          <span class="footer-heading">Jelajahi</span>
          <a class="footer-link" href="/datasets">Katalog dataset</a>
          <a class="footer-link" href="/methodology">Metodologi</a>
          <a class="footer-link" href="https://github.com/mrizalbasri/Equora"
            >Repositori proyek</a
          >
        </nav>
      </div>

      <div class="footer-meta">
        <p>Equora · Data fasilitas pendidikan Indonesia</p>
        <p class="disclaimer">
          Simulasi berbasis data dan asumsi.<br />Bukan keputusan anggaran resmi.
        </p>
      </div>
    </div>

    <div class="footer-landscape" aria-hidden="true">
      <img
        src="/images/footer/equora-school-landscape.webp"
        alt=""
        width="2172"
        height="724"
        loading="lazy"
        decoding="async"
      />
      <div
        class="footer-decor"
        class:paused={!footerActive}
        bind:this={footerDecorEl}
        aria-hidden="true"
      >
        <div class="decor-sunlight"></div>
        <svg class="decor-cloud" viewBox="0 0 180 60">
          <path d="M7 49C-4 35 15 23 31 29C25 1 67-4 80 21C94 4 126 10 127 32C155 18 179 37 174 49Z" fill="#fff0cd" />
        </svg>
        <svg class="decor-cloud decor-cloud-back" viewBox="0 0 180 60">
          <path d="M7 49C-4 35 15 23 31 29C25 1 67-4 80 21C94 4 126 10 127 32C155 18 179 37 174 49Z" fill="#fff0cd" />
        </svg>
        <svg class="decor-flock decor-flock-1" viewBox="0 0 130 50" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <path class="bird" d="M102 22Q107 15 112 22Q117 15 122 22" />
          <path class="bird" d="M78 14Q83 8 88 14Q93 8 98 14" />
          <path class="bird" d="M52 8Q57 2 62 8Q67 2 72 8" />
          <path class="bird" d="M26 3Q31 -2 36 3Q41 -2 46 3" />
          <path class="bird" d="M76 32Q81 26 86 32Q91 26 96 32" />
          <path class="bird" d="M50 40Q55 34 60 40Q65 34 70 40" />
          <path class="bird" d="M22 47Q27 41 32 47Q37 41 42 47" />
        </svg>
        <svg class="decor-flock decor-flock-2" viewBox="0 0 100 42" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path class="bird" d="M74 16Q79 10 84 16Q89 10 94 16" />
          <path class="bird" d="M52 8Q57 2 62 8Q67 2 72 8" />
          <path class="bird" d="M50 25Q55 19 60 25Q65 19 70 25" />
          <path class="bird" d="M26 18Q31 12 36 18Q41 12 46 18" />
          <path class="bird" d="M4 29Q9 23 14 29Q19 23 24 29" />
        </svg>
        <svg class="decor-flock decor-flock-3" viewBox="0 0 110 36" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
          <path class="bird" d="M86 14Q91 8 96 14Q101 8 106 14" />
          <path class="bird" d="M64 8Q69 3 74 8Q79 3 84 8" />
          <path class="bird" d="M66 22Q71 16 76 22Q81 16 86 22" />
          <path class="bird" d="M42 16Q47 11 52 16Q57 11 62 16" />
          <path class="bird" d="M22 10Q27 5 32 10Q37 5 42 10" />
          <path class="bird" d="M2 24Q7 19 12 24Q17 19 22 24" />
        </svg>
        <svg class="decor-flock decor-flock-4" viewBox="0 0 80 30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path class="bird" d="M56 12Q61 6 66 12Q71 6 76 12" />
          <path class="bird" d="M36 6Q41 1 46 6Q51 1 56 6" />
          <path class="bird" d="M34 20Q39 15 44 20Q49 15 54 20" />
          <path class="bird" d="M12 16Q17 11 22 16Q27 11 32 16" />
        </svg>
        <svg class="decor-cyclist decor-cyclist-lead" viewBox="0 0 80 70">
          <ellipse cx="40" cy="65" rx="37" ry="2.2" fill="#173d3b" opacity=".22" />
          <g fill="none" stroke="#1c4847" stroke-width="2">
            <g class="wheel">
              <circle cx="17" cy="51" r="13" fill="#d6d5a6" fill-opacity=".22" />
              <path d="M17 38V64M4 51H30M8 42L26 60M8 60L26 42" stroke-width=".6" />
            </g>
            <g class="wheel">
              <circle cx="63" cy="51" r="13" fill="#d6d5a6" fill-opacity=".22" />
              <path d="M63 38V64M50 51H76M54 42L72 60M54 60L72 42" stroke-width=".6" />
            </g>
            <path d="M17 51L29 32L39 51H17L49 33L63 51M39 51L29 29M24 29H33M49 33L45 26L52 24" stroke="#e3c57e" stroke-width="2.4" stroke-linejoin="round" />
          </g>
          <g class="rider rider-bounce">
            <path d="M35 21L29 37L39 46" fill="none" stroke="#1a4146" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M36 20L43 29L49 28" fill="none" stroke="#e2bd7a" stroke-width="3.6" stroke-linecap="round" />
            <path d="M33 17Q38 14 41 22L36 31L28 28Z" fill="#eed8a4" />
            <path d="M31 18L27 28" stroke="#173f48" stroke-width="5" stroke-linecap="round" />
            <circle cx="40" cy="10" r="5.5" fill="#dfb678" />
            <path d="M34 10Q33 2 40 3Q47 3 46 9" fill="#173f48" />
          </g>
          <g class="pedals" fill="none" stroke="#173f48" stroke-width="2">
            <path d="M31 47H41M31 45V49M41 45V49" />
          </g>
        </svg>
        <svg class="decor-cyclist decor-cyclist-buddy" viewBox="0 0 80 70">
          <ellipse cx="40" cy="65" rx="37" ry="2.2" fill="#173d3b" opacity=".2" />
          <g fill="none" stroke="#1c4847" stroke-width="2">
            <g class="wheel">
              <circle cx="17" cy="51" r="13" fill="#d6d5a6" fill-opacity=".22" />
              <path d="M17 38V64M4 51H30M8 42L26 60M8 60L26 42" stroke-width=".6" />
            </g>
            <g class="wheel">
              <circle cx="63" cy="51" r="13" fill="#d6d5a6" fill-opacity=".22" />
              <path d="M63 38V64M50 51H76M54 42L72 60M54 60L72 42" stroke-width=".6" />
            </g>
            <path d="M17 51L29 32L39 51H17L49 33L63 51M39 51L29 29M24 29H33M49 33L45 26L52 24" stroke="#c48358" stroke-width="2.4" stroke-linejoin="round" />
          </g>
          <g class="rider rider-bounce">
            <path d="M35 21L29 37L39 46" fill="none" stroke="#183e44" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M36 20L43 29L49 28" fill="none" stroke="#d58652" stroke-width="3.6" stroke-linecap="round" />
            <path d="M33 17Q38 14 41 22L36 31L28 28Z" fill="#cf6852" />
            <path d="M31 18L27 28" stroke="#14373e" stroke-width="5" stroke-linecap="round" />
            <circle cx="40" cy="10" r="5.5" fill="#dfb678" />
            <path d="M34 10Q33 2 40 3Q47 3 46 9" fill="#14373e" />
          </g>
          <g class="pedals" fill="none" stroke="#173f48" stroke-width="2">
            <path d="M31 47H41M31 45V49M41 45V49" />
          </g>
        </svg>
        <div class="decor-butterfly decor-butterfly-1">
          <svg viewBox="0 0 16 16">
            <path d="M8 8C-4-7-1 17 8 9C17 17 20-7 8 8Z" fill="currentColor" />
            <path d="M8 5V12" stroke="#214c48" stroke-width="1" />
          </svg>
        </div>
        <div class="decor-butterfly decor-butterfly-2">
          <svg viewBox="0 0 16 16">
            <path d="M8 8C-4-7-1 17 8 9C17 17 20-7 8 8Z" fill="currentColor" />
            <path d="M8 5V12" stroke="#214c48" stroke-width="1" />
          </svg>
        </div>
        <div class="decor-butterfly decor-butterfly-3">
          <svg viewBox="0 0 16 16">
            <path d="M8 8C-4-7-1 17 8 9C17 17 20-7 8 8Z" fill="currentColor" />
            <path d="M8 5V12" stroke="#214c48" stroke-width="1" />
          </svg>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  .public-frame.calm {
    width: 100%;
    max-width: none;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .calm .header-bar {
    position: sticky;
    background: rgb(255 255 255 / 94%);
    backdrop-filter: blur(12px);
    border-radius: 0;
    border-bottom: 1px solid rgb(31 45 61 / 7%);
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
    border-radius: 0;
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
  .footer-link {
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
  .footer-link:hover {
    color: white;
    text-decoration-color: rgb(255 255 255 / 72%);
    text-underline-offset: 5px;
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
    position: relative;
    isolation: isolate;
    min-height: 600px;
    overflow: hidden;
    color: white;
    background: #0b49bd;
    border-radius: 0 0 28px 28px;
  }
  .footer::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.1;
    background-image: radial-gradient(rgb(255 255 255 / 55%) 0.6px, transparent 0.6px);
    background-size: 5px 5px;
    mask-image: linear-gradient(to bottom, black, transparent 58%);
    pointer-events: none;
  }
  .footer-content {
    position: relative;
    z-index: 2;
    padding-block: 52px 32px;
  }
  .footer-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(180px, 0.35fr);
    gap: clamp(48px, 10vw, 148px);
    align-items: start;
  }
  .footer-brand {
    max-width: 420px;
  }
  .footer-brand .wordmark,
  .footer-brand :global(.brand-mark) {
    color: white;
  }
  .footer-brand > p {
    max-width: 360px;
    margin-top: 14px;
    font-size: clamp(17px, 1.6vw, 22px);
    line-height: 1.45;
  }
  .footer-navigation {
    display: grid;
    align-items: start;
    gap: 4px;
  }
  .footer-heading {
    margin-bottom: 8px;
    color: rgb(255 255 255 / 58%);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .footer-link {
    width: fit-content;
    color: rgb(255 255 255 / 78%);
    text-decoration-color: transparent;
    transition: color 160ms ease, text-decoration-color 160ms ease;
  }
  .footer-meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 32px;
    margin-top: 38px;
    padding-top: 22px;
    border-top: 1px solid rgb(255 255 255 / 22%);
  }
  .footer p {
    font-size: 13px;
    color: rgb(255 255 255 / 68%);
  }
  .footer-landscape {
    position: absolute;
    z-index: 0;
    inset: 0;
    pointer-events: none;
  }
  .footer-landscape::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgb(2 42 127 / 22%) 0%,
      rgb(6 55 150 / 8%) 48%,
      transparent 72%
    );
  }
  .footer-landscape img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }
  .footer-decor {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  }
  .decor-sunlight {
    position: absolute;
    inset: 36% 8% 5%;
    background: radial-gradient(ellipse at 54% 45%, #ffe5a21c, transparent 64%);
    animation: decor-sunlight 12s ease-in-out infinite alternate;
  }
  .decor-cloud {
    position: absolute;
    top: 48%;
    left: 6%;
    width: 160px;
    height: 45px;
    opacity: 0.35;
    filter: blur(2px);
    animation: decor-cloud 28s ease-in-out infinite alternate;
  }
  .decor-cloud-back {
    top: 42%;
    left: 69%;
    width: 110px;
    opacity: 0.23;
    animation-duration: 38s;
    animation-delay: -12s;
  }
  .decor-flock {
    position: absolute;
    left: -120px;
    color: #faeab8;
    pointer-events: none;
    animation: decor-flight 24s linear infinite;
  }
  .decor-flock-1 {
    top: 38%;
    width: 104px;
    height: 40px;
    animation-duration: 25s;
    animation-delay: 0s;
  }
  .decor-flock-2 {
    top: 26%;
    width: 82px;
    height: 34px;
    opacity: 0.75;
    animation-duration: 29s;
    animation-delay: -11s;
  }
  .decor-flock-3 {
    top: 17%;
    width: 72px;
    height: 24px;
    opacity: 0.6;
    animation-duration: 33s;
    animation-delay: -19s;
  }
  .decor-flock-4 {
    top: 48%;
    width: 64px;
    height: 24px;
    opacity: 0.85;
    animation-duration: 21s;
    animation-delay: -7s;
  }
  .bird {
    transform-box: fill-box;
    transform-origin: center;
    animation: decor-wings 850ms ease-in-out infinite alternate;
  }
  .bird:nth-child(2) {
    animation-delay: -220ms;
  }
  .bird:nth-child(3) {
    animation-delay: -450ms;
  }
  .bird:nth-child(4) {
    animation-delay: -140ms;
  }
  .bird:nth-child(5) {
    animation-delay: -360ms;
  }
  .bird:nth-child(6) {
    animation-delay: -520ms;
  }
  .bird:nth-child(7) {
    animation-delay: -280ms;
  }
  .decor-cyclist {
    position: absolute;
    bottom: 3.8%;
    left: -12%;
    width: clamp(40px, 4.2vw, 54px);
    height: auto;
    animation: decor-ride 36s linear infinite;
  }
  .decor-cyclist-lead {
    animation-delay: -1.4s;
  }
  .decor-cyclist-buddy {
    bottom: 4.5%;
    scale: 0.86;
    opacity: 0.95;
    animation-delay: 0s;
  }
  .wheel {
    transform-box: fill-box;
    transform-origin: center;
    animation: decor-spin 850ms linear infinite;
  }
  .pedals {
    transform-origin: 36px 47px;
    animation: decor-spin 1700ms linear infinite;
  }
  .rider-bounce {
    animation: decor-bounce 900ms ease-in-out infinite alternate;
  }
  .decor-butterfly {
    position: absolute;
    width: 14px;
    height: 14px;
    animation: decor-flutter-path 10s ease-in-out infinite;
  }
  .decor-butterfly-1 {
    bottom: 11%;
    left: 91%;
    color: #f4d995;
  }
  .decor-butterfly-2 {
    bottom: 7%;
    left: 85%;
    color: #eed074;
    scale: 0.8;
    animation-duration: 8.5s;
    animation-delay: -3.8s;
  }
  .decor-butterfly-3 {
    bottom: 6%;
    left: 14%;
    color: #faeab8;
    scale: 0.75;
    animation-duration: 11.5s;
    animation-delay: -6.5s;
  }
  .decor-butterfly svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .decor-butterfly path {
    transform-origin: 8px 8px;
    animation: decor-butterfly-wing 280ms ease-in-out infinite alternate;
  }
  .footer-decor.paused *,
  .footer-decor.paused *::before,
  .footer-decor.paused *::after {
    animation-play-state: paused !important;
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
      min-height: 620px;
      border-radius: 0;
    }
    .footer-content {
      padding-block: 42px 28px;
    }
    .footer-main {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    .footer-navigation {
      grid-template-columns: repeat(3, max-content);
      gap: 4px 22px;
    }
    .footer-heading {
      grid-column: 1 / -1;
    }
    .footer-meta {
      margin-top: 26px;
    }
    .disclaimer {
      text-align: left;
    }
  }

  @media (max-width: 620px) {
    .footer {
      min-height: 700px;
    }
    .footer-navigation {
      grid-template-columns: 1fr;
    }
    .footer-meta {
      flex-direction: column;
      gap: 10px;
    }
    .footer-landscape img {
      object-position: 50% bottom;
    }
    .decor-cloud {
      top: 62%;
      width: 100px;
    }
    .decor-cloud-back {
      display: none;
    }
    .decor-flock-1 {
      top: 36%;
      width: 74px;
      height: 28px;
    }
    .decor-flock-2,
    .decor-flock-3 {
      display: none;
    }
    .decor-cyclist {
      width: 40px;
      bottom: 2.7%;
      animation-duration: 28s;
    }
    .decor-cyclist-buddy {
      display: none;
    }
    .decor-butterfly {
      display: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .calm .footer-landscape {
      transform: translateY(var(--footer-drift, 0px)) scale(1.08);
      transform-origin: center bottom;
    }
    .footer-landscape img {
      animation: footer-landscape-arrive 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }
  }

  @keyframes footer-landscape-arrive {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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

  @keyframes decor-cloud {
    to {
      translate: 70px 4px;
    }
  }

  @keyframes decor-sunlight {
    to {
      opacity: 0.3;
    }
  }

  @keyframes decor-flight {
    0% {
      transform: translate3d(0, 0, 0);
      opacity: 0;
    }
    3% {
      opacity: 0.85;
    }
    94% {
      opacity: 0.85;
    }
    100% {
      transform: translate3d(calc(100vw + 240px), -65px, 0);
      opacity: 0;
    }
  }

  @keyframes decor-wings {
    to {
      scale: 1 0.55;
    }
  }

  @keyframes decor-ride {
    0%,
    5% {
      left: -12%;
    }
    63%,
    100% {
      left: 112%;
    }
  }

  @keyframes decor-spin {
    to {
      rotate: 360deg;
    }
  }

  @keyframes decor-bounce {
    to {
      translate: 0 -0.6px;
    }
  }

  @keyframes decor-flutter-path {
    0%,
    100% {
      translate: 0 0;
      rotate: -12deg;
    }
    30% {
      translate: -20px -24px;
      rotate: 12deg;
    }
    65% {
      translate: 8px -12px;
      rotate: -6deg;
    }
  }

  @keyframes decor-butterfly-wing {
    to {
      scale: 0.3 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-decor *,
    .footer-decor *::before,
    .footer-decor *::after {
      animation: none !important;
      transition: none !important;
    }
    .decor-cyclist,
    .decor-flock,
    .decor-butterfly {
      display: none;
    }
  }
</style>
