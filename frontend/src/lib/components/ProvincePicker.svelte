<script lang="ts">
  import { tick } from 'svelte';
  import Icon from './Icon.svelte';

  let { id, label, options, value = '', disabled = false, emptyLabel = 'Belum memilih provinsi', onchange }: {
    id: string;
    label: string;
    options: { code: string; name: string }[];
    value?: string;
    disabled?: boolean;
    emptyLabel?: string;
    onchange: (value: string) => void;
  } = $props();
  let open = $state(false);
  let query = $state('');
  let active = $state(-1);
  let root = $state<HTMLDivElement>();
  let input = $state<HTMLInputElement>();
  let list = $state<HTMLDivElement>();
  const selectedName = $derived(options.find((item) => item.code === value)?.name ?? '');
  const filtered = $derived(options.filter((item) => item.name.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id'))));
  const choices = $derived(query.trim() ? filtered : [{ code: '', name: emptyLabel }, ...filtered]);

  $effect(() => {
    value;
    disabled;
    open = false;
    query = '';
    active = -1;
  });

  function close() { open = false; query = ''; active = -1; }
  function show() { if (!disabled) { open = true; query = ''; active = -1; } }
  function choose(code: string) { close(); onchange(code); input?.focus(); }
  function outside(event: PointerEvent) {
    if (event.target instanceof Node && !root?.contains(event.target)) close();
  }
  function leave(event: FocusEvent) {
    if (!(event.relatedTarget instanceof Node) || !root?.contains(event.relatedTarget)) close();
  }
  async function keydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === 'Tab') close();
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { show(); active = event.key === 'ArrowDown' ? 0 : choices.length - 1; }
      else active = Math.max(0, Math.min(choices.length - 1, active + (event.key === 'ArrowDown' ? 1 : -1)));
      await tick();
      list?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      if (choices[active]) choose(choices[active].code);
    }
  }
</script>

<svelte:window onpointerdown={outside} />
<div class="province-picker" bind:this={root} onfocusout={leave}>
  <label for={id}><Icon name="map" size={20} />{label}</label>
  <div class="picker-control" class:disabled>
    <span class="search-icon"><Icon name="search" size={20} /></span>
    <input bind:this={input} {id} role="combobox" {disabled} type="text" autocomplete="off"
      placeholder="Ketik atau pilih provinsi" value={open ? query : selectedName}
      aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list"
      aria-describedby={`${id}-hint`} aria-activedescendant={open && active >= 0 && choices[active] ? `${id}-option-${active}` : undefined}
      onclick={() => { if (!open) show(); }} onfocus={(event) => event.currentTarget.select()} onkeydown={keydown}
      oninput={(event) => { query = event.currentTarget.value; open = true; active = 0; }} />
    <button type="button" tabindex="-1" {disabled} aria-label={open ? `Tutup pilihan ${label}` : `Buka pilihan ${label}`}
      aria-expanded={open} aria-controls={`${id}-options`} onclick={() => { if (open) close(); else show(); input?.focus(); }}>
      <span class:expanded={open}><Icon name="chevron" size={20} /></span>
    </button>
  </div>
  <p id={`${id}-hint`} class="picker-hint">{open ? 'Ketik nama daerah untuk mempersempit pilihan.' : 'Cari nama provinsi atau buka daftar pilihan.'}</p>
  <div class="picker-panel" hidden={!open}>
    <div id={`${id}-options`} role="listbox" aria-label={label} class="picker-options" bind:this={list}>
      {#each choices as item, index (item.code)}
        <button type="button" role="option" id={`${id}-option-${index}`} aria-selected={item.code === value}
          tabindex="-1" data-active={active === index} onpointerdown={(event) => event.preventDefault()} onclick={() => choose(item.code)}>
          <span>{item.name}</span>{#if item.code === value}<Icon name="check" size={20} />{/if}
        </button>
      {/each}
    </div>
    <p class="picker-count" role="status">{filtered.length ? `${filtered.length} provinsi tersedia` : 'Provinsi tidak ditemukan. Coba nama lain.'}</p>
  </div>
</div>

<style>
  .province-picker { position: relative; min-width: 0; }
  label { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 10px; }
  label :global(svg) { color: var(--eq-primary-hover); flex-shrink: 0; }
  .picker-control { display: flex; align-items: center; background: white; border: 1px solid var(--eq-control-border); border-radius: 8px; min-height: 52px; }
  .picker-control:focus-within { outline: 3px solid var(--eq-focus); outline-offset: 3px; }
  .picker-control.disabled { background: var(--eq-surface-subtle); }
  .search-icon { display: inline-flex; padding-left: 12px; color: var(--eq-text-secondary); }
  input { min-width: 0; width: 100%; min-height: 50px; padding: 12px 8px; border: 0; background: transparent; color: var(--eq-text); font: inherit; font-size: 16px; }
  input:focus-visible { outline: none; }
  input::placeholder { color: var(--eq-text-secondary); opacity: 1; }
  .picker-control > button { display: grid; place-items: center; flex-shrink: 0; min-width: 48px; min-height: 50px; border: 0; border-radius: 0 8px 8px 0; background: transparent; color: var(--eq-text-secondary); }
  .picker-control > button:hover { background: var(--eq-primary-tint); }
  .picker-control > button span { display: flex; transform: rotate(90deg); }
  .picker-control > button span.expanded { transform: rotate(-90deg); }
  .picker-hint { margin-top: 8px; font-size: 14px; color: var(--eq-text-secondary); line-height: 1.5; }
  .picker-panel { position: absolute; z-index: 15; top: calc(100% + 8px); left: 0; right: 0; background: white; border: 1px solid var(--eq-control-border); border-radius: 12px; box-shadow: 0 12px 24px rgb(31 45 61 / 12%); overflow: hidden; }
  .picker-panel[hidden] { display: none; }
  .picker-options { max-height: min(300px, 40dvh); overflow-y: auto; overscroll-behavior: contain; padding: 6px; }
  .picker-options button { display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%; min-height: 48px; padding: 12px; border: 0; border-radius: 6px; background: white; text-align: left; color: var(--eq-text); font: inherit; overflow-wrap: anywhere; }
  .picker-options button :global(svg) { flex-shrink: 0; }
  .picker-options button:hover, .picker-options button[data-active='true'] { background: var(--eq-primary-tint); }
  .picker-options button[aria-selected='true'] { color: var(--eq-primary-hover); font-weight: 600; }
  .picker-count { padding: 12px; border-top: 1px solid var(--eq-border); font-size: 14px; color: var(--eq-text-secondary); line-height: 1.5; }
  @media (max-width: 700px) { .picker-panel { position: static; margin-top: 8px; } }
</style>
