<script lang="ts">
  import { onMount } from 'svelte';
  import {
    addBasemap,
    BASEMAP_SOURCE,
    initialMapStyle,
    registerPMTiles,
    removeBasemap,
  } from '$lib/maps/basemap';
  import type { Map as LibreMap, GeoJSONSource, Popup } from 'maplibre-gl';
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
  let popup: Popup | undefined;
  let geo = $state<(FeatureCollection & { attribution: string }) | null>(null);
  let ready = $state(false);
  let rendered = $state(false);
  let failure = $state('');
  let basemapStatus = $state<'loading' | 'ready' | 'failed'>('loading');
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
          tooltip: `${feature.properties?.name ?? code} · ${value == null ? 'Data tidak tersedia / di luar filter' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value)) + (percent ? '%' : ' sekolah')}`,
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
    let basemapTimer: ReturnType<typeof setTimeout> | undefined;
    function basemapFailed() {
      if (disposed || basemapStatus === 'failed') return;
      basemapStatus = 'failed';
      clearTimeout(basemapTimer);
      if (map) removeBasemap(map);
    }
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
        registerPMTiles(libre);
        map = new libre.Map({
          container,
          style: initialMapStyle(),
          bounds: [
            [94, -12],
            [142, 7],
          ],
          fitBoundsOptions: { padding: 15 },
          maxZoom: 7,
          maxBounds: [
            [90, -16],
            [146, 11],
          ],
          attributionControl: false,
        });
        map.addControl(
          new libre.AttributionControl({ compact: true }),
          'bottom-right',
        );
        map.addControl(new libre.NavigationControl({ showCompass: false }));
        popup = new libre.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 10,
        });
        map.on('load', () => {
          map!.addSource('provinces', { type: 'geojson', data });
          map!.addLayer({
            id: 'province-fill',
            type: 'fill',
            source: 'provinces',
            paint: { 'fill-color': ['get', 'fill'], 'fill-opacity': 0.72 },
          });
          map!.addLayer({
            id: 'province-line',
            type: 'line',
            source: 'provinces',
            paint: {
              'line-color': [
                'case',
                ['boolean', ['get', 'selected'], false],
                '#0e4faf',
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
          basemapTimer = setTimeout(basemapFailed, 15000);
          try {
            addBasemap(map!, data);
          } catch {
            basemapFailed();
          }
        });
        map.on('click', 'province-fill', (event) => {
          const code = event.features?.[0]?.properties?.code;
          if (code) onselect(String(code));
        });
        map.on('mousemove', 'province-fill', (event) => {
          map!.getCanvas().style.cursor = 'pointer';
          const tooltip = event.features?.[0]?.properties?.tooltip;
          if (tooltip)
            popup?.setLngLat(event.lngLat).setText(String(tooltip)).addTo(map!);
        });
        map.on('mouseleave', 'province-fill', () => {
          if (map) map.getCanvas().style.cursor = '';
          popup?.remove();
        });
        map.on('idle', () => {
          if (ready && map?.isSourceLoaded('provinces')) rendered = true;
        });
        map.on('sourcedata', (event) => {
          if (
            event.sourceId === BASEMAP_SOURCE &&
            event.isSourceLoaded &&
            basemapStatus !== 'failed'
          ) {
            basemapStatus = 'ready';
            clearTimeout(basemapTimer);
          }
          if (ready && map?.isSourceLoaded('provinces')) rendered = true;
        });
        map.on('error', (event) => {
          if ('sourceId' in event && event.sourceId === 'provinces') {
            failure = 'Layer provinsi gagal dimuat. Tabel tetap tersedia di bawah.';
          } else {
            basemapFailed();
          }
        });
      } catch {
        if (!disposed)
          failure =
            'Peta tidak dapat ditampilkan pada perangkat ini. Gunakan tabel di bawah.';
      }
    })();
    return () => {
      disposed = true;
      clearTimeout(basemapTimer);
      popup?.remove();
      map?.remove();
      map = undefined;
    };
  });
</script>

<div
  class="map"
  hidden={!!failure}
  bind:this={container}
  role="img"
  aria-busy={!rendered && !failure}
  aria-label="Peta sebaran indikator provinsi; gunakan tabel untuk memilih wilayah dengan keyboard."
></div>
{#if failure}<p role="status" class="work-muted">{failure}</p>
  <button class="eq-button" onclick={onretry}>Muat ulang peta</button>{/if}
{#if rendered && !failure}<p role="status" class="map-ready">
    Peta siap · {geo?.features.length ?? 0} batas provinsi.
  </p>{/if}
{#if !failure}
  {#if basemapStatus === 'loading'}<p role="status" class="map-ready">Memuat basemap OpenStreetMap…</p>{/if}
  {#if basemapStatus === 'ready'}<p role="status" class="map-ready">Basemap OpenStreetMap · Protomaps · zoom hingga 7.</p>{/if}
  {#if basemapStatus === 'failed'}
    <p role="status" class="map-ready">Basemap gagal dimuat. Layer indikator dan tabel tetap tersedia.</p>
    <button class="eq-button" onclick={onretry}>Coba lagi basemap</button>
  {/if}
{/if}
<div class="legend">
  <span>Rendah</span>{#each colors as color}<span
      style:background={color}
      class="swatch"
    ></span>{/each}<span>Tinggi</span><span
    class="swatch"
    style:background="#d8dce0"
  ></span><span>Tanpa data / di luar filter</span>
</div>
<p class="map-scale">
  {percent
    ? 'Persentase akses: 0–20, 20–40, 40–60, 60–80, 80–100%.'
    : 'Jumlah sekolah: lima interval sama terhadap maksimum hasil filter.'} Batas
  komunitas yang disederhanakan; basemap bukan sumber indikator pendidikan.
</p>
{#if geo}<details class="attribution">
    <summary>Batas komunitas: Deny Herianto · CC BY 4.0</summary>
    <p>
      {geo.attribution}
      <a href="https://creativecommons.org/licenses/by/4.0/"
        >Lisensi CC BY 4.0</a
      >
    </p>
  </details>{/if}

<style>
  .map {
    height: 320px;
    width: 100%;
    border: 1px solid var(--eq-border);
    border-radius: 8px;
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
    font-size: 12px;
    color: var(--eq-text-secondary);
    margin-top: 10px;
    padding: 10px 0 0;
    border-top: 1px solid var(--eq-border);
  }
  .attribution summary {
    font-weight: 400;
    min-height: 32px;
    cursor: pointer;
    font-size: 11px;
  }
  .attribution p {
    font-size: 12px;
    line-height: 1.6;
    margin-block: 6px;
  }
  .map-ready {
    font-size: 11px;
    color: var(--eq-text-secondary);
    margin-top: 8px;
  }
  .map-scale {
    font-size: 11px;
    color: var(--eq-text-secondary);
    line-height: 1.7;
  }
  @media (max-width: 600px) {
    .map {
      height: 300px;
    }
  }
</style>
