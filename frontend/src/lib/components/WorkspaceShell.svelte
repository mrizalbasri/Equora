<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { page } from '$app/state';
  import Icon from './Icon.svelte';
  import AnalysisJourney from './AnalysisJourney.svelte';
  import BrandMark from './BrandMark.svelte';
  let {
    title,
    subtitle,
    children,
  }: { title: string; subtitle: string; children: Snippet } = $props();
  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let closeButton = $state<HTMLButtonElement>();
  let sidebar = $state<HTMLElement>();
  const primary = [
    { href: '/daerah', label: 'Daerah Saya', icon: 'map' },
    { href: '/explore', label: 'Explorer', icon: 'compass' },
    { href: '/studio', label: 'Studio simulasi', icon: 'sliders' },
    { href: '/compare', label: 'Perbandingan', icon: 'compare' },
    { href: '/datasets', label: 'Katalog dataset', icon: 'database' },
  ] as const;
  const reference = [
    { href: '/methodology', label: 'Metodologi', icon: 'book' },
  ] as const;
  function active(href: string) {
    return (
      page.url.pathname.startsWith(href) ||
      (href === '/explore' && page.url.pathname.startsWith('/regions')) ||
      (href === '/studio' && page.url.pathname.startsWith('/scenarios'))
    );
  }
  const location = $derived(
    [...primary, ...reference].find((item) => active(item.href))?.label ??
      (page.url.pathname === '/admin' ? 'Impor data' : 'Workspace'),
  );
  async function closeMenu() {
    menuOpen = false;
    await tick();
    menuButton?.focus();
  }
  async function toggleMenu() {
    if (menuOpen) return closeMenu();
    menuOpen = true;
    await tick();
    closeButton?.focus();
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && menuOpen) closeMenu();
    if (event.key !== 'Tab' || !menuOpen || !sidebar) return;
    const controls = [...sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
</script>

<svelte:window onkeydown={onKey} onresize={() => { if (window.innerWidth > 900 && menuOpen) closeMenu(); }} />
<a class="workspace-skip" href="#main-content">Lewati ke konten utama</a>
<div class="app-frame">
  {#if menuOpen}<button
      class="nav-backdrop"
      tabindex="-1"
      aria-label="Tutup menu navigasi"
      onclick={closeMenu}
    ></button>{/if}
  <aside class="app-sidebar" class:open={menuOpen} id="workspace-sidebar" bind:this={sidebar}>
    <div class="sidebar-brand">
      <a href="/" class="app-wordmark" aria-label="Equora, beranda"
        ><BrandMark compact /></a><button
        class="sidebar-close"
        bind:this={closeButton}
        aria-label="Tutup menu"
        onclick={closeMenu}><Icon name="close" /></button
      >
    </div>
    <p class="brand-caption">Pendidikan dalam data.</p>
    <nav aria-label="Navigasi workspace">
      <p class="nav-section">Ruang kerja</p>
      {#each primary as item}<a
          href={item.href}
          aria-current={active(item.href) ? 'page' : undefined}
          class="sidebar-link"
          onclick={() => (menuOpen = false)}
          ><Icon name={item.icon} size={20} /><span>{item.label}</span
          >{#if active(item.href)}<span class="active-marker"></span>{/if}</a
        >{/each}
      <p class="nav-section reference-heading">Referensi</p>
      {#each reference as item}<a
          href={item.href}
          aria-current={active(item.href) ? 'page' : undefined}
          class="sidebar-link"
          onclick={() => (menuOpen = false)}
          ><Icon name={item.icon} size={20} /><span>{item.label}</span></a
        >{/each}
      <p class="nav-section reference-heading">Pengelolaan lokal</p>
      <a href="/admin" class="sidebar-link" aria-current={page.url.pathname === '/admin' ? 'page' : undefined} onclick={() => (menuOpen = false)}><Icon name="shield" size={20} /><span>Impor data</span></a>
    </nav>
    <div class="sidebar-bottom">
      <a class="studio-shortcut" href="/studio"
        ><strong
          >Dari data ke skenario</strong
        ><span>Uji bobot dan pilihan alokasi Anda.</span><span
          class="shortcut-action"
          >Buka Studio</span
        ></a>
      <a class="sidebar-link public-home" href="/"
        ><Icon name="home" size={20} /><span>Beranda publik</span></a
      >
      <p class="sidebar-caption">Public Resource<br />Decision Intelligence</p>
    </div>
  </aside>
  <div class="app-body" inert={menuOpen}>
    <header class="app-topbar">
      <div class="topbar-location">
        <button
          class="workspace-menu"
          bind:this={menuButton}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="workspace-sidebar"
          onclick={toggleMenu}><Icon name="menu" /></button
        ><a class="mobile-brand" href="/" aria-label="Equora, beranda"
          ><BrandMark compact /></a>
        <p class="breadcrumbs">
          <span>Ruang analisis</span><Icon name="chevron" size={14} /><strong
            >{location}</strong
          >
        </p>
      </div>
      <div class="topbar-right">
        <span class="local-mode">Workspace lokal</span><a
          href="/methodology"
          class="help-link"
          aria-label="Panduan metodologi"
          ><Icon name="book" size={18} /><span>Panduan</span></a>
      </div>
    </header>
    <main id="main-content" tabindex="-1" class="workspace">
      <header class="workspace-heading">
        <div>
          <h1>{title}</h1>
          <p class="workspace-subtitle">{subtitle}</p>
        </div>
        <span class="review-badge">Review lokal</span>
      </header>
      <details class="workspace-context">
        <summary
          ><Icon name="info" size={17} /><span
            >Data agregat provinsi · Simulasi menggunakan asumsi demo</span
          ><span class="context-more">Tentang data</span></summary
        >
        <p>
          Data tahun ajaran 2025/2026 berstatus review lokal. Lisensi
          redistribusi dan tanggal unduh pengguna belum diverifikasi. Data
          merangkum provinsi, bukan setiap sekolah. Biaya simulasi adalah asumsi
          pengguna; hasil bukan keputusan anggaran resmi.
        </p>
      </details>
      <details class="journey-guide"><summary>Panduan alur dan halaman</summary><AnalysisJourney /></details>
      {@render children()}
      <footer class="app-footer">
        <span>equora. <span>· Transparansi di setiap langkah.</span></span><a
          href="https://github.com/mrizalbasri/Equora"
          >Repositori proyek</a>
      </footer>
    </main>
  </div>
</div>

<style>
  .journey-guide { margin-block: 16px 24px; }
  .journey-guide > summary { cursor: pointer; min-height: 44px; align-content: center; color: var(--eq-primary-hover); font-weight: 600; }
  .app-frame {
    min-height: 100dvh;
    background: var(--eq-bg);
  }
  .workspace-skip {
    position: fixed;
    z-index: 100;
    top: -100px;
    left: 260px;
    background: var(--eq-surface);
    padding: 12px 18px;
    border: 2px solid var(--eq-focus);
    border-radius: 8px;
  }
  .workspace-skip:focus {
    top: 12px;
  }
  .app-sidebar {
    width: 232px;
    position: fixed;
    inset: 0 auto 0 0;
    background: var(--eq-surface);
    border-right: 1px solid var(--eq-border);
    padding: 28px 18px 20px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 14px;
  }
  .app-wordmark {
    font-size: 34px;
    letter-spacing: -1.8px;
    font-weight: 750;
    line-height: 1.3;
    text-decoration: none;
  }
  .brand-caption {
    color: var(--eq-text-secondary);
    font-size: 12px;
    padding: 6px 14px 34px;
  }
  .nav-section {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--eq-text-muted);
    font-size: 10px;
    font-weight: 650;
    margin: 0 14px 10px;
  }
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 10px 14px;
    color: var(--eq-text-secondary);
    text-decoration: none;
    border-radius: 8px;
    font-size: 14px;
    margin-block: 4px;
    transition:
      color 160ms ease,
      background 160ms ease;
  }
  .sidebar-link[aria-current] {
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    font-weight: 650;
  }
  .sidebar-link:hover {
    background: var(--eq-surface-subtle);
    color: var(--eq-primary-hover);
  }
  .active-marker {
    width: 5px;
    height: 5px;
    background: currentColor;
    border-radius: 50%;
    margin-left: auto;
  }
  .reference-heading {
    margin-top: 30px;
  }
  .sidebar-bottom {
    margin-top: auto;
    padding-top: 36px;
  }
  .studio-shortcut {
    display: grid;
    gap: 7px;
    padding: 18px 16px;
    background: var(--eq-sidebar);
    border: 1px solid var(--eq-border);
    border-radius: 12px;
    text-decoration: none;
    font-size: 13px;
  }
  .shortcut-action {
    color: var(--eq-primary-hover);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    margin-top: 6px;
  }
  .public-home {
    margin-top: 20px;
  }
  .sidebar-caption {
    font-size: 11px;
    color: var(--eq-text-muted);
    padding: 12px 14px 0;
    line-height: 1.6;
  }
  .app-body {
    margin-left: 232px;
    min-width: 0;
  }
  .app-topbar {
    min-height: 64px;
    background: var(--eq-surface);
    border-bottom: 1px solid var(--eq-border);
    padding: 14px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .topbar-location,
  .topbar-right,
  .breadcrumbs,
  .help-link {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .breadcrumbs {
    font-size: 13px;
    color: var(--eq-text-secondary);
  }
  .breadcrumbs strong {
    color: var(--eq-text);
    font-weight: 550;
  }
  .topbar-right {
    gap: 24px;
  }
  .local-mode {
    color: var(--eq-text-secondary);
    font-size: 12px;
    border-right: 1px solid var(--eq-border);
    padding-right: 24px;
  }
  .help-link {
    text-decoration: none;
    font-size: 13px;
    min-height: 44px;
    color: var(--eq-text-secondary);
  }
  .workspace {
    padding: 24px 32px 0;
    max-width: 1680px;
    margin: 0 auto;
  }
  .workspace-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 18px;
    max-width: none;
  }
  .workspace-heading h1 {
    font-size: clamp(24px, 2.3vw, 32px);
    letter-spacing: -0.035em;
    margin: 6px 0 8px;
    line-height: 1.2;
  }
  .workspace-subtitle {
    font-size: 14px;
    line-height: 1.6;
    color: var(--eq-text-secondary);
    max-width: 720px;
  }
  .review-badge {
    flex-shrink: 0;
    font-size: 11px;
    padding: 5px 10px;
    background: var(--eq-warning-tint);
    color: var(--eq-warning);
    border: 1px solid var(--eq-warning-border);
    border-radius: 6px;
    margin-top: 24px;
  }
  .workspace-context {
    border: 1px solid var(--eq-border);
    border-radius: 8px;
    background: var(--eq-surface);
    padding: 0;
    margin: 0 0 16px;
    font-size: 12px;
    color: var(--eq-text-secondary);
  }
  .workspace-context summary {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 400;
  }
  .workspace-context summary::marker {
    content: '';
  }
  .context-more {
    color: var(--eq-primary-hover);
    margin-left: auto;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 600;
  }
  .workspace-context p {
    margin: 0;
    padding: 0 16px 14px 40px;
    max-width: 900px;
    line-height: 1.7;
  }
  .app-footer {
    padding: 24px 0;
    margin-top: 30px;
    border-top: 1px solid var(--eq-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    font-size: 12px;
    color: var(--eq-text-secondary);
  }
  .app-footer > span {
    font-weight: 650;
  }
  .app-footer > span > span {
    font-weight: 400;
    margin-left: 6px;
  }
  .app-footer a {
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }
  .workspace-menu,
  .sidebar-close,
  .mobile-brand,
  .nav-backdrop {
    display: none;
  }
  .app-frame :global(.work-panel) {
    background: var(--eq-surface);
    border-radius: 12px;
    margin-block: 20px;
  }
  .app-frame :global(.work-panel h2) {
    font-size: 20px;
    margin-bottom: 16px;
  }
  .app-frame :global(.work-field) {
    font-size: 15px;
    gap: 8px;
  }
  .app-frame :global(.work-grid) {
    gap: 20px;
  }
  .app-frame :global(.work-table) {
    background: var(--eq-surface);
    border-radius: 10px;
  }
  .app-frame :global(.workspace table) {
    font-variant-numeric: tabular-nums;
  }
  .app-frame :global(.work-controls label) {
    font-size: 15px;
  }
  .app-frame :global(.eq-button) {
    gap: 8px;
    transition:
      background 160ms ease,
      color 160ms ease;
  }
  .app-frame :global(.eq-button:active) {
    transform: none;
  }
  .app-frame :global(.eq-button:disabled) {
    opacity: 0.55;
  }
  @media (max-width: 1050px) {
    .app-sidebar {
      width: 210px;
      padding-inline: 12px;
    }
    .app-body {
      margin-left: 210px;
    }
    .app-topbar {
      padding-inline: 24px;
    }
    .workspace {
      padding-inline: 24px;
    }
  }
  @media (max-width: 900px) {
    .app-sidebar {
      width: 250px;
      transform: translateX(-100%);
      visibility: hidden;
      transition:
        transform 180ms ease,
        visibility 180ms;
    }
    .app-sidebar.open {
      transform: translateX(0);
      visibility: visible;
    }
    .app-body {
      margin-left: 0;
    }
    .nav-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      border: 0;
      background: rgb(20 36 54 / 25%);
      z-index: 35;
    }
    .workspace-menu,
    .sidebar-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      min-height: 48px;
      border: 1px solid var(--eq-border);
      background: var(--eq-surface);
      border-radius: 8px;
    }
    .sidebar-close {
      border: 0;
    }
    .mobile-brand {
      display: block;
      font-size: 25px;
      font-weight: 750;
      letter-spacing: -1px;
      text-decoration: none;
    }
    .breadcrumbs {
      display: none;
    }
    .app-topbar {
      min-height: 68px;
      padding: 10px 20px;
    }
    .workspace {
      padding: 24px 20px 0;
    }
    .workspace-skip {
      left: 12px;
    }
  }
  @media (max-width: 550px) {
    .app-topbar {
      padding-inline: 14px;
    }
    .workspace {
      padding: 24px 16px 0;
    }
    .workspace-heading {
      gap: 10px;
    }
    .workspace-heading h1 {
      font-size: 25px;
    }
    .review-badge {
      margin-top: 22px;
      font-size: 10px;
      padding: 4px 7px;
    }
    .workspace-subtitle {
      font-size: 13px;
    }
    .local-mode,
    .help-link span {
      display: none;
    }
    .workspace-context summary {
      align-items: flex-start;
      font-size: 11px;
    }
    .workspace-context summary :global(svg) {
      flex-shrink: 0;
      margin-top: 2px;
    }
    .context-more {
      display: none;
    }
    .workspace-context p {
      padding-left: 14px;
    }
    .app-footer {
      align-items: flex-start;
      font-size: 11px;
    }
    .app-footer > span > span {
      display: block;
      margin-left: 0;
    }
  }
</style>
