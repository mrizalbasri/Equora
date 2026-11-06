<script lang="ts">
  import { onMount } from 'svelte';
  import type { PriorityMapMode } from '$lib/maps/priority-map';

  let { mode, percent }: { mode: PriorityMapMode; percent: boolean } = $props();
  const preferenceKey = 'equora:map-reading-guide:v1';
  let expanded = $state(true);
  let ready = $state(false);

  const explanation = $derived(
    mode === 'median'
      ? {
          title: 'Bandingkan dengan titik tengah',
          body: 'Median adalah nilai tengah dari provinsi yang dapat dibandingkan. Oranye berarti di bawah median, biru di atas median. Warna yang lebih pekat menunjukkan selisih yang lebih besar.',
          note: 'Di bawah median tidak otomatis berarti prioritas anggaran. Periksa indikator dan konteks wilayahnya.',
        }
      : mode === 'completeness'
        ? {
            title: 'Periksa kelengkapan sebelum menyimpulkan',
            body: 'Warna hijau yang lebih pekat menunjukkan lebih banyak indikator yang tersedia dan dapat dibandingkan. Kelengkapan membantu Anda menilai seberapa jauh data mendukung pembacaan kondisi wilayah.',
            note: 'Data lebih lengkap tidak berarti fasilitas sekolah lebih baik.',
          }
        : {
            title: 'Baca warna bersama satuannya',
            body: percent
              ? 'Biru yang lebih pekat menunjukkan persentase akses yang lebih tinggi pada indikator terpilih. Klik provinsi untuk melihat angkanya, lalu periksa jenjang dan periode sebelum membandingkan.'
              : 'Biru yang lebih pekat menunjukkan jumlah sekolah yang lebih besar pada indikator terpilih. Klik provinsi untuk melihat angkanya. Jumlah sekolah bukan persentase akses: wilayah dengan lebih banyak sekolah dapat memiliki jumlah yang lebih besar.',
            note: 'Nilai ini menggambarkan agregat provinsi, bukan kondisi setiap sekolah.',
          },
  );

  onMount(() => {
    try {
      expanded = localStorage.getItem(preferenceKey) !== 'closed';
    } catch {
      // The guide remains usable when browser storage is unavailable.
    }
    ready = true;
  });

  function remember(event: Event) {
    expanded = (event.currentTarget as HTMLDetailsElement).open;
    if (!ready) return;
    try {
      localStorage.setItem(preferenceKey, expanded ? 'open' : 'closed');
    } catch {
      // Storage is optional; native expand/collapse still works.
    }
  }
</script>

<details class="reading-guide" open={expanded} ontoggle={remember}>
  <summary>Cara membaca peta <span>Panduan singkat</span></summary>
  <div class="guide-content">
    <h3>{explanation.title}</h3>
    <p>{explanation.body}</p>
    <p class="context-note">{explanation.note}</p>
    <p class="missing-note"><span class="missing-swatch" aria-hidden="true"></span><strong>Abu-abu bukan nol.</strong> Data tidak tersedia atau belum dapat dibandingkan pada filter ini.</p>
  </div>
</details>

<style>
  .reading-guide { margin: 16px 0; padding: 0 16px; border: 1px solid var(--eq-border); border-radius: 10px; background: var(--eq-surface-subtle); }
  summary { display: list-item; cursor: pointer; padding-block: 14px; min-height: 48px; font-size: 14px; font-weight: 650; }
  summary::marker { color: var(--eq-primary); }
  summary > span { margin-left: 10px; color: var(--eq-text-secondary); font-size: 12px; font-weight: 450; }
  summary:focus-visible { outline: 2px solid var(--eq-primary); outline-offset: 3px; border-radius: 4px; }
  .guide-content { padding: 0 0 16px; max-width: 75ch; }
  h3 { font-size: 14px; line-height: 1.5; margin-bottom: 6px; }
  p { font-size: 13px; line-height: 1.7; color: var(--eq-text-secondary); }
  .context-note { margin-top: 8px; }
  .missing-note { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--eq-border); }
  .missing-swatch { display: inline-block; width: 10px; height: 10px; margin-right: 6px; background: #d8dce0; border: 1px solid #9ca5ae; border-radius: 2px; }
  strong { color: var(--eq-text); }
  @media (max-width: 480px) { summary > span { display: none; } }
</style>
