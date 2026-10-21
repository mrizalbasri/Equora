<script lang="ts">
  import { onMount } from 'svelte';
  import type { Map as LibreMap, GeoJSONSource } from 'maplibre-gl';
  import type { FeatureCollection } from 'geojson';
  import type { Observation } from '$lib/api/workspace';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  let {
    rows,
    percent,
    selected,
    onselect,
    onretry,
  }: {
    rows: Observation[];
    percent: boolean;
    selected: string;
    onselect: (code: string) => void;
    onretry: () => void;
  } = $props();
  let container: HTMLDivElement;
  let map: LibreMap | undefined;
  let geo = $state<(FeatureCollection & { attribution: string }) | null>(null);
  let ready = $state(false);
  let rendered = $state(false);
  let failure = $state('');
  const colors = ['#e8f1fa', '#b4d1e8', '#74a9cf', '#367fb5', '#14507c'];
  function paint() {
    if (!map || !ready || !geo) return;
    const lookup = new Map(rows.map((row) => [row.code, row]));
    const max = percent
      ? 100
      : Math.max(1, ...rows.map((row) => Number(row.value ?? 0)));
    const features = geo.features.map((feature) => {
      const code = String(feature.properties?.code);
      const value = lookup.get(code)?.value;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          fill:
            value == null
              ? '#d8dce0'
              : colors[Math.min(4, Math.floor((Number(value) / max) * 5))],
          selected: code === selected,
        },
      };
    });
    (map.getSource('provinces') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features,
    });
  }
  $effect(() => {
    rows;
    percent;
    selected;
    ready;
    geo;
    paint();
  });
  onMount(() => {
    let disposed = false;
    (async () => {
      try {
        const [libre, response] = await Promise.all([
          import('maplibre-gl'),
          fetch('/api/v1/geometry'),
        ]);
        if (!response.ok) throw new Error('Boundary unavailable');
        const data = await response.json();
        if (disposed) return;
        geo = data;
        libre.setWorkerUrl(workerUrl);
        map = new libre.Map({
          container,
          style: {
            version: 8,
            sources: {},
            layers: [
              {
                id: 'background',
                type: 'background',
                paint: { 'background-color': '#f3f7fa' },
              },
            ],
          },
          bounds: [
            [94, -12],
            [142, 7],
          ],
          fitBoundsOptions: { padding: 15 },
          attributionControl: false,
        });
        map.addControl(new libre.NavigationControl({ showCompass: false }));
        map.on('load', () => {
          map!.addSource('provinces', { type: 'geojson', data });
          map!.addLayer({
            id: 'province-fill',
            type: 'fill',
            source: 'provinces',
            paint: { 'fill-color': ['get', 'fill'] },
          });
          map!.addLayer({
            id: 'province-line',
            type: 'line',
            source: 'provinces',
            paint: {
              'line-color': [
                'case',
                ['boolean', ['get', 'selected'], false],
                '#c05110',
                '#ffffff',
              ],
              'line-width': [
                'case',
                ['boolean', ['get', 'selected'], false],
                3,
                0.8,
              ],
            },
          });
          ready = true;
          paint();
        });
        map.on('click', 'province-fill', (event) => {
          const code = event.features?.[0]?.properties?.code;
          if (code) onselect(String(code));
        });
        map.on('idle', () => {
          if (ready && map?.isSourceLoaded('provinces')) rendered = true;
        });
        map.on('error', () => {
          failure =
            'Sebagian peta gagal dimuat. Tabel tetap tersedia di bawah.';
        });
      } catch {
        if (!disposed)
          failure =
            'Peta tidak dapat ditampilkan pada perangkat ini. Gunakan tabel di bawah.';
      }
    })();
    return () => {
      disposed = true;
      map?.remove();
      map = undefined;
    };
  });
</script>

<div
  class="map"
  bind:this={container}
  role="img"
  aria-label="Peta sebaran indikator provinsi; gunakan tabel untuk memilih wilayah dengan keyboard."
></div>
{#if failure}<p role="status" class="work-muted">{failure}</p>
  <button class="eq-button" onclick={onretry}>Muat ulang peta</button>{/if}
{#if rendered && !failure}<p role="status" class="work-muted">
    Peta siap · 38 batas provinsi.
  </p>{/if}
<div class="legend">
  <span>Rendah</span>{#each colors as color}<span
      style:background={color}
      class="swatch"
    ></span>{/each}<span>Tinggi</span><span
    class="swatch"
    style:background="#d8dce0"
  ></span><span>Tanpa data / di luar filter</span>
</div>
<p class="work-muted">
  {percent
    ? 'Persentase akses: 0–20, 20–40, 40–60, 60–80, 80–100%.'
    : 'Jumlah sekolah: lima interval sama terhadap maksimum hasil filter.'} Batas
  komunitas yang disederhanakan; tanpa basemap.
</p>
{#if geo}<p class="attribution">
    {geo.attribution}
    <a href="https://creativecommons.org/licenses/by/4.0/">Lisensi CC BY 4.0</a>
  </p>{/if}

<style>
  .map {
    height: 420px;
    width: 100%;
    border: 1px solid var(--eq-border);
    border-radius: 12px;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    margin-block: 12px;
  }
  .swatch {
    width: 22px;
    height: 12px;
    border: 1px solid #9ba9b6;
  }
  .attribution {
    font-size: 11px;
    color: var(--eq-text-secondary);
    margin-top: 10px;
  }
  @media (max-width: 600px) {
    .map {
      height: 300px;
    }
  }
</style>
