<script lang="ts">
  import { onMount } from 'svelte';
  import Icon, { type IconName } from './Icon.svelte';

  export interface DropdownOption {
    value: string;
    label: string;
    badge?: string;
    desc?: string;
    icon?: IconName;
    disabled?: boolean;
  }

  export interface DropdownGroup {
    label: string;
    options: DropdownOption[];
  }

  let {
    id = 'custom-dropdown',
    label,
    value = $bindable(''),
    groups = [],
    options = [],
    disabled = false,
    placeholder = 'Pilih...',
    onchange,
  }: {
    id?: string;
    label?: string;
    value: string;
    groups?: DropdownGroup[];
    options?: DropdownOption[];
    disabled?: boolean;
    placeholder?: string;
    onchange?: (val: string) => void;
  } = $props();

  let isOpen = $state(false);
  let containerEl = $state<HTMLDivElement>();
  let selectEl = $state<HTMLSelectElement>();

  const listboxId = $derived(`${id}-listbox`);

  const allOptions = $derived(
    groups.length > 0
      ? groups.flatMap((g) => g.options)
      : options
  );

  const selectedItem = $derived(allOptions.find((o) => o.value === value));

  function toggleOpen(e: MouseEvent | KeyboardEvent) {
    if (disabled) return;
    e.preventDefault();
    isOpen = !isOpen;
  }

  function handleTriggerKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      isOpen = true;
    } else if (e.key === 'Escape') {
      isOpen = false;
    }
  }

  function selectOption(val: string) {
    value = val;
    isOpen = false;
    if (selectEl) {
      selectEl.value = val;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    onchange?.(val);
  }

  onMount(() => {
    function handleClickOutside(e: PointerEvent) {
      if (isOpen && containerEl && !containerEl.contains(e.target as Node)) {
        isOpen = false;
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (isOpen && e.key === 'Escape') {
        isOpen = false;
      }
    }
    window.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div class="custom-dropdown-container" bind:this={containerEl}>
  <!-- Accessible native select kept in DOM for automated tests and form binding -->
  <select
    bind:this={selectEl}
    {id}
    aria-label={label}
    bind:value
    {disabled}
    class="sr-select"
    tabindex="-1"
    onchange={(e) => {
      value = e.currentTarget.value;
      onchange?.(value);
    }}
  >
    {#if groups.length > 0}
      {#each groups as group}
        <optgroup label={group.label}>
          {#each group.options as opt}
            <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
          {/each}
        </optgroup>
      {/each}
    {:else}
      {#each options as opt}
        <option value={opt.value} disabled={opt.disabled}>{opt.label}</option>
      {/each}
    {/if}
  </select>

  <!-- Modern Interactive Dropdown Trigger -->
  <button
    type="button"
    class="eq-button dropdown-trigger"
    class:is-open={isOpen}
    class:is-disabled={disabled}
    {disabled}
    aria-controls={listboxId}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-label={label ? `${label}: ${selectedItem?.label ?? placeholder}` : (selectedItem?.label ?? placeholder)}
    onclick={toggleOpen}
    onkeydown={handleTriggerKeyDown}
  >
    <div class="trigger-label-group">
      {#if selectedItem?.icon}
        <span class="trigger-icon" aria-hidden="true"><Icon name={selectedItem.icon} size={16} /></span>
      {/if}
      <span class="trigger-text">{selectedItem?.label ?? placeholder}</span>
      {#if selectedItem?.badge}
        <span class="trigger-badge">{selectedItem.badge}</span>
      {/if}
    </div>
    <span class="trigger-chevron" class:rotate={isOpen} aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M6 8l4 4 4-4" />
      </svg>
    </span>
  </button>

  <!-- Modern Floating Popover -->
  {#if isOpen}
    <div
      id={listboxId}
      class="dropdown-popover"
      role="listbox"
      aria-label={label}
    >
      <div class="dropdown-scroll-body">
        {#if groups.length > 0}
          {#each groups as group, gIdx}
            {#if gIdx > 0}
              <div class="group-divider"></div>
            {/if}
            <div class="group-header">
              <span class="group-title">{group.label}</span>
            </div>
            <div class="group-options">
              {#each group.options as opt}
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled}
                  disabled={opt.disabled}
                  class="dropdown-item"
                  class:selected={opt.value === value}
                  class:is-disabled={opt.disabled}
                  onclick={() => {
                    if (!opt.disabled) selectOption(opt.value);
                  }}
                >
                  <div class="item-leading">
                    {#if opt.icon}
                      <span class="item-icon-box" aria-hidden="true">
                        <Icon name={opt.icon} size={15} />
                      </span>
                    {/if}
                    <div class="item-text-stack">
                      <span class="item-name">{opt.label}</span>
                      {#if opt.desc}
                        <span class="item-desc">{opt.desc}</span>
                      {/if}
                    </div>
                  </div>
                  <div class="item-trailing">
                    {#if opt.badge}
                      <span class="item-badge">{opt.badge}</span>
                    {/if}
                    {#if opt.value === value}
                      <span class="item-checkmark" aria-hidden="true">✓</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          {/each}
        {:else}
          <div class="group-options">
            {#each options as opt}
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                disabled={opt.disabled}
                class="dropdown-item"
                class:selected={opt.value === value}
                class:is-disabled={opt.disabled}
                onclick={() => {
                  if (!opt.disabled) selectOption(opt.value);
                }}
              >
                <div class="item-leading">
                  {#if opt.icon}
                    <span class="item-icon-box" aria-hidden="true">
                      <Icon name={opt.icon} size={15} />
                    </span>
                  {/if}
                  <div class="item-text-stack">
                    <span class="item-name">{opt.label}</span>
                    {#if opt.desc}
                      <span class="item-desc">{opt.desc}</span>
                    {/if}
                  </div>
                </div>
                <div class="item-trailing">
                  {#if opt.badge}
                    <span class="item-badge">{opt.badge}</span>
                  {/if}
                  {#if opt.value === value}
                    <span class="item-checkmark" aria-hidden="true">✓</span>
                  {/if}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .custom-dropdown-container {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .sr-select {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    min-height: 48px;
    min-width: 48px;
    opacity: 0;
    pointer-events: none;
    cursor: pointer;
    z-index: -1;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-height: 48px;
    padding: 10px 14px;
    background: #ffffff;
    border: 1px solid #d0d7e2;
    border-radius: 10px;
    color: var(--eq-text);
    font-size: 14px;
    font-weight: 550;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease;
  }

  .dropdown-trigger:hover:not(.is-disabled) {
    border-color: #9cb5d9;
  }

  .dropdown-trigger:focus-visible,
  .dropdown-trigger.is-open {
    outline: none;
    border-color: var(--eq-primary);
    box-shadow: 0 0 0 3px rgba(18, 100, 216, 0.15);
  }

  .dropdown-trigger.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: var(--eq-surface-subtle);
  }

  .trigger-label-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  .trigger-icon {
    display: inline-flex;
    align-items: center;
    color: var(--eq-primary);
    flex-shrink: 0;
  }

  .trigger-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--eq-text);
  }

  .trigger-badge {
    font-size: 10.5px;
    font-weight: 650;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    border: 1px solid #bfdbfe;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .trigger-chevron {
    display: inline-flex;
    align-items: center;
    color: #64748b;
    transition: transform 180ms ease, color 140ms ease;
    flex-shrink: 0;
  }

  .trigger-chevron.rotate {
    transform: rotate(180deg);
    color: var(--eq-primary);
  }

  .dropdown-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 100%;
    width: max-content;
    max-width: min(440px, 94vw);
    background: #ffffff;
    border: 1px solid var(--eq-border);
    border-radius: 13px;
    box-shadow:
      0 16px 38px -6px rgba(15, 23, 42, 0.16),
      0 6px 14px -3px rgba(15, 23, 42, 0.08);
    z-index: 100;
    overflow: hidden;
    animation: eq-dropdown-appear 150ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes eq-dropdown-appear {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.99);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .dropdown-scroll-body {
    max-height: min(380px, 50vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 6px;
  }

  .group-divider {
    height: 1px;
    background: var(--eq-border);
    margin: 6px 4px;
  }

  .group-header {
    padding: 6px 10px 4px;
  }

  .group-title {
    font-size: 11px;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--eq-primary);
  }

  .group-options {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 44px;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition: background-color 120ms ease, color 120ms ease;
  }

  .dropdown-item:hover {
    background: var(--eq-primary-tint);
  }

  .dropdown-item.selected {
    background: #eff6ff;
  }

  .dropdown-item.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }

  .item-leading {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex: 1;
  }

  .item-icon-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    color: var(--eq-primary);
    flex-shrink: 0;
  }

  .dropdown-item.selected .item-icon-box {
    background: var(--eq-primary-tint);
    border-color: #bfdbfe;
  }

  .item-text-stack {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .item-name {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--eq-text);
    line-height: 1.35;
  }

  .dropdown-item.selected .item-name {
    color: var(--eq-primary-hover);
  }

  .item-desc {
    font-size: 11px;
    color: var(--eq-text-secondary);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-trailing {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .item-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--eq-surface-subtle);
    border: 1px solid var(--eq-border);
    color: var(--eq-text-secondary);
    white-space: nowrap;
  }

  .dropdown-item.selected .item-badge {
    background: var(--eq-primary-tint);
    color: var(--eq-primary-hover);
    border-color: #bfdbfe;
  }

  .item-checkmark {
    font-size: 13px;
    font-weight: 750;
    color: var(--eq-primary);
  }

  @media (max-width: 600px) {
    .dropdown-popover {
      left: 0;
      right: 0;
      width: 100%;
      max-width: 100%;
    }
  }
</style>