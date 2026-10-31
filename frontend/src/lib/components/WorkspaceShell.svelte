<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { page } from '$app/state';
  import Icon from './Icon.svelte';
  import AnalysisJourney from './AnalysisJourney.svelte';
  import BrandMark from './BrandMark.svelte';
  import { workspaceNavGroups, type WorkspaceNavGroup } from '$lib/api/workspace';

  let {
    title,
    subtitle,
    children,
  }: { title: string; subtitle: string; children: Snippet } = $props();

  let menuOpen = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  let closeButton = $state<HTMLButtonElement>();
  let sidebar = $state<HTMLElement>();

  const navGroups: WorkspaceNavGroup[] = workspaceNavGroups;

  function active(href: string, sub?: boolean) {
    const currentPath = page.url.pathname;
    if (sub && href.includes('#')) {
      const [base, hash] = href.split('#');
      return currentPath === base && page.url.hash === '#' + hash;
    }
    if (href === '/studio' && !sub) {
      return (currentPath === '/studio' && !page.url.hash) || currentPath.startsWith('/scenarios');
    }
    if (href === '/explore') {
      return currentPath === '/explore' || currentPath.startsWith('/regions');
    }
    if (href === '/daerah') {
      return currentPath === '/daerah';
    }
    return currentPath === href || (href !== '/' && currentPath.startsWith(href));
  }

  const allItems = $derived(navGroups.flatMap((g) => g.items));
  const location = $derived(
    allItems.find((item) => active(item.href, item.sub))?.label ??
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
    const controls = [
      ...sidebar.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ),
    ].filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
</script>

<svelte:window
  onkeydown={onKey}
  onresize={() => {
    if (window.innerWidth > 900 && menuOpen) closeMenu();
  }}
/>

<a class="workspace-skip" href="#main-content">Lewati ke konten utama</a>
<div class="app-frame">
  {#if menuOpen}
    <button
      class="nav-backdrop"
      tabindex="-1"
      aria-label="Tutup menu navigasi"
      onclick={closeMenu}
    ></button>
  {/if}

  <aside
    class="app-sidebar"
    class:open={menuOpen}
    id="workspace-sidebar"
    bind:this={sidebar}
  >
    <div class="sidebar-brand">
      <a href="/" class="app-wordmark" aria-label="Equora, beranda">
        <BrandMark compact />
      </a>
      <button
        class="sidebar-close"
        bind:this={closeButton}
        aria-label="Tutup menu"
        onclick={closeMenu}
      >
        <Icon name="close" />
      </button>
    </div>
    <p class="brand-caption">Public Resource · Decision Intelligence</p>

    <nav aria-label="Navigasi workspace" class="sidebar-nav">
      {#each navGroups as group}
        <div class="nav-group">
          <p class="nav-section-title">{group.title}</p>
          {#each group.items as item}
            <a
              href={item.href}
              aria-current={active(item.href, item.sub) ? 'page' : undefined}
              class="sidebar-link"
              class:sub-item={item.sub}
              onclick={() => (menuOpen = false)}
            >
              <span class="icon-wrap">
                <Icon name={item.icon} size={18} />
              </span>
              <span class="link-label">{item.label}</span>
              {#if item.badge}
                <span class="nav-badge" aria-hidden="true">{item.badge}</span>
              {/if}
              {#if active(item.href, item.sub)}
                <span class="active-indicator" aria-hidden="true"></span>
              {/if}
            </a>
          {/each}
        </div>
      {/each}

      {#if page.url.pathname === '/admin'}
        <div class="nav-group">
          <p class="nav-section-title">Pengelolaan lokal</p>
          <a
            href="/admin"
            class="sidebar-link"
            aria-current="page"
            onclick={() => (menuOpen = false)}
          >
            <span class="icon-wrap"><Icon name="shield" size={18} /></span>
            <span class="link-label">Impor data</span>
            <span class="active-indicator" aria-hidden="true"></span>
          </a>
        </div>
      {/if}
    </nav>

    <div class="sidebar-bottom">
      <div class="workspace-status-card">
        <div class="status-indicator">
          <span class="status-pulse"></span>
          <span class="status-dot"></span>
        </div>
        <div class="status-text">
          <span class="status-title">Workspace Publik</span>
          <span class="status-desc">Review Data 2025/2026</span>
        </div>
      </div>
      <div class="footer-links">
        <a class="footer-link" href="/" onclick={() => (menuOpen = false)}>
          <Icon name="home" size={16} />
          <span>Beranda publik</span>
        </a>
        <a class="footer-link" href="/about" onclick={() => (menuOpen = false)}>
          <Icon name="info" size={16} />
          <span>Tentang Equora</span>
        </a>
      </div>
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
          onclick={toggleMenu}
        >
          <Icon name="menu" />
        </button>
        <a class="mobile-brand" href="/" aria-label="Equora, beranda">
          <BrandMark compact />
        </a>
        <p class="breadcrumbs">
          <span>Ruang analisis</span>
          <Icon name="chevron" size={14} />
          <strong>{location}</strong>
        </p>
      </div>
      <div class="topbar-right">
        <span class="local-mode">Workspace lokal</span>
        <a
          href="/methodology"
          class="help-link"
          aria-label="Panduan metodologi"
        >
          <Icon name="book" size={18} />
          <span>Panduan</span>
        </a>
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
        <summary>
          <Icon name="info" size={17} />
          <span>Data agregat provinsi · Simulasi menggunakan asumsi demo</span>
          <span class="context-more">Tentang data</span>
        </summary>
        <p>
          Data tahun ajaran 2025/2026 berstatus review lokal. Lisensi
          redistribusi dan tanggal unduh pengguna belum diverifikasi. Data
          merangkum provinsi, bukan setiap sekolah. Biaya simulasi adalah asumsi
          pengguna; hasil bukan keputusan anggaran resmi.
        </p>
      </details>

      <details class="journey-guide">
        <summary>Panduan alur dan halaman</summary>
        <AnalysisJourney />
      </details>

      {@render children()}

      <footer class="app-footer">
        <span>equora. <span>· Transparansi di setiap langkah.</span></span>
        <a href="https://github.com/mrizalbasri/Equora">Repositori proyek</a>
      </footer>
    </main>
  </div>
</div>

<style>
  .journey-guide {
    margin-block: 16px 24px;
  }
  .journey-guide > summary {
    cursor: pointer;
    min-height: 44px;
    align-content: center;
    color: var(--eq-primary-hover);
    font-weight: 600;
  }
  .app-frame {
    min-height: 100dvh;
    background: var(--eq-bg);
  }
  .workspace-skip {
    position: fixed;
    z-index: 100;
    top: -100px;
    left: 270px;
    background: var(--eq-surface);
    padding: 12px 18px;
    border: 2px solid var(--eq-focus);
    border-radius: 8px;
  }
  .workspace-skip:focus {
    top: 12px;
  }
  .app-sidebar {
    width: 252px;
    position: fixed;
    inset: 0 auto 0 0;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    padding: 24px 14px 20px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 10px;
  }
  .app-wordmark {
    font-size: 32px;
    letter-spacing: -1.6px;
    font-weight: 750;
    line-height: 1.3;
    text-decoration: none;
  }
  .sidebar-close {
    display: none;
  }
  .brand-caption {
    color: #64748b;
    font-size: 11px;
    font-weight: 500;
    padding: 4px 10px 24px;
    line-height: 1.4;
  }
  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
  }
  .nav-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .nav-section-title {
    font-size: 10.5px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #64748b;
    padding: 4px 10px 6px;
    margin: 0;
  }
  .sidebar-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 8px;
    color: #334155;
    font-size: 13.5px;
    font-weight: 550;
    text-decoration: none;
    transition: all 160ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .sidebar-link:hover {
    background: #f1f5f9;
    color: #0f172a;
    transform: translateX(3px);
  }
  .sidebar-link[aria-current='page'] {
    background: #e0f2fe;
    color: #0284c7;
    font-weight: 700;
  }
  .sidebar-link[aria-current='page']:hover {
    background: #e0f2fe;
    color: #0369a1;
  }
  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    color: inherit;
    flex-shrink: 0;
  }
  .link-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .active-indicator {
    position: absolute;
    right: 10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0284c7;
  }
  /* Tree line sub-item styling */
  .sidebar-link.sub-item {
    margin-left: 18px;
    font-size: 12.5px;
    min-height: 36px;
    padding: 6px 10px;
    color: #475569;
  }
  .sidebar-link.sub-item::before {
    content: '';
    position: absolute;
    left: -8px;
    top: -6px;
    bottom: 50%;
    width: 1px;
    border-left: 1px solid #cbd5e1;
  }
  .sidebar-link.sub-item::after {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    width: 7px;
    height: 1px;
    border-top: 1px solid #cbd5e1;
  }
  .nav-badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    background: #e2e8f0;
    color: #475569;
    letter-spacing: 0.02em;
  }
  .sidebar-link[aria-current='page'] .nav-badge {
    background: #bae6fd;
    color: #0369a1;
  }
  .sidebar-bottom {
    margin-top: auto;
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .workspace-status-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  }
  .status-indicator {
    position: relative;
    width: 10px;
    height: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
  }
  .status-pulse {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #10b981;
    opacity: 0.3;
    animation: status-ping 2s infinite;
  }
  @keyframes status-ping {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }
  .status-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .status-title {
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
  }
  .status-desc {
    font-size: 10px;
    color: #64748b;
  }
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .footer-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    color: #64748b;
    font-size: 12px;
    text-decoration: none;
    transition: all 150ms ease;
  }
  .footer-link:hover {
    color: #0284c7;
    background: #f1f5f9;
  }

  .app-body {
    margin-left: 252px;
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
  }
  .workspace-menu {
    display: none;
  }
  .mobile-brand {
    display: none;
  }
  .local-mode {
    font-size: 11px;
    font-weight: 600;
    padding: 5px 10px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    border-radius: 6px;
    color: var(--eq-text-muted);
  }
  .help-link {
    font-size: 13px;
    color: var(--eq-text-secondary);
    text-decoration: none;
    font-weight: 550;
    padding: 6px 10px;
    border-radius: 6px;
  }
  .help-link:hover {
    background: var(--eq-surface-subtle);
    color: var(--eq-text);
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
  }
  .workspace-context p {
    padding: 0 14px 14px;
    margin: 0;
    line-height: 1.6;
    color: var(--eq-text-muted);
  }
  .app-footer {
    margin-top: 64px;
    padding: 24px 0 32px;
    border-top: 1px solid var(--eq-border);
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--eq-text-muted);
  }
  .app-footer a {
    color: var(--eq-text-secondary);
    text-decoration: none;
  }
  .app-footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 1050px) {
    .app-sidebar {
      width: 220px;
      padding-inline: 10px;
    }
    .app-body {
      margin-left: 220px;
    }
    .app-topbar {
      padding-inline: 20px;
    }
    .workspace {
      padding-inline: 20px;
    }
  }

  @media (max-width: 900px) {
    .app-sidebar {
      width: 260px;
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
    .sidebar-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 0;
      background: transparent;
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
    }
    .sidebar-close:hover {
      background: #f1f5f9;
      color: #0f172a;
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
    .workspace-menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      min-height: 48px;
      border: 1px solid var(--eq-border);
      background: var(--eq-surface);
      border-radius: 8px;
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
