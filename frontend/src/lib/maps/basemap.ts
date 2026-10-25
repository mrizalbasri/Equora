import { layers, namedFlavor } from '@protomaps/basemaps';
import type { Map, StyleSpecification } from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import type { FeatureCollection } from 'geojson';
import { focusIndonesianLabels, indonesiaLand } from './indonesia-focus';

export const BASEMAP_SOURCE = 'basemap';
const assets = 'https://raw.githubusercontent.com/protomaps/basemaps-assets/028c18f713baecad011301ff7a69acc39bcc2ae7';
const protocol = new Protocol();

export function registerPMTiles(libre: typeof import('maplibre-gl')) {
  libre.addProtocol('pmtiles', protocol.tile);
}

export function initialMapStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: `${assets}/fonts/{fontstack}/{range}.pbf`,
    sprite: new URL('/maps/sprites/grayscale', window.location.href).href,
    sources: {},
    layers: [{
      id: 'fallback-background', type: 'background',
      paint: { 'background-color': '#f3f7fa' },
    }],
  };
}

export function addBasemap(map: Map, boundaries: FeatureCollection) {
  const url = new URL('/maps/indonesia.pmtiles', window.location.href).href;
  // A failed header promise is cached by PMTiles; remounting must allow a fresh request.
  protocol.add(new PMTiles(url));
  map.addSource(BASEMAP_SOURCE, {
    type: 'vector',
    url: `pmtiles://${url}`,
    attribution: '<a href="https://protomaps.com/">Protomaps</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
  });
  const flavor = {
    ...namedFlavor('grayscale'),
    background: '#edf2f5',
    water: '#edf2f5',
    earth: '#fafafa',
  };
  const land = indonesiaLand(boundaries);
  for (const layer of layers(BASEMAP_SOURCE, flavor, { lang: 'id' })) {
    map.addLayer({ ...focusIndonesianLabels(layer, land), id: `basemap-${layer.id}` }, layer.type === 'symbol' ? undefined : 'province-fill');
  }
}

export function removeBasemap(map: Map) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.id.startsWith('basemap-')) map.removeLayer(layer.id);
  }
  if (map.getSource(BASEMAP_SOURCE)) map.removeSource(BASEMAP_SOURCE);
}
