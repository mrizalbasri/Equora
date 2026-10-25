import { describe, expect, it } from 'vitest';
import { focusIndonesianLabels, indonesiaLand } from './indonesia-focus';
import type { FeatureCollection, MultiPolygon } from 'geojson';
import type { FilterSpecification } from 'maplibre-gl';

const land: MultiPolygon = { type: 'MultiPolygon', coordinates: [[
  [[100, -5], [110, -5], [110, 5], [100, 5], [100, -5]],
  [[102, -2], [102, 2], [104, 2], [104, -2], [102, -2]],
]] };

describe('Indonesia basemap scope', () => {
  it('preserves island polygons and holes from mixed province geometries', () => {
    const boundaries: FeatureCollection = { type: 'FeatureCollection', features: [
      { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: land.coordinates[0] } },
      { type: 'Feature', properties: {}, geometry: land },
    ] };
    expect(indonesiaLand(boundaries).coordinates).toEqual([...land.coordinates, ...land.coordinates]);
  });
  it('limits legacy place labels to Indonesia while preserving their original kind', () => {
    const result = focusIndonesianLabels({ id: 'places', type: 'symbol', source: 'basemap', filter: ['in', 'kind', 'region', 'locality'] }, land);
    expect(result.type === 'symbol' && result.filter).toEqual(['all', ['in', ['get', 'kind'], ['literal', ['region', 'locality']]], ['within', land]]);
  });
  it('keeps expression filters and leaves geographic context layers intact', () => {
    const filter: FilterSpecification = ['==', ['get', 'oneway'], 'yes'];
    const result = focusIndonesianLabels({ id: 'roads', type: 'symbol', source: 'basemap', filter: [...filter] }, land);
    expect(result.type === 'symbol' && result.filter).toEqual(['all', filter, ['within', land]]);
    const earth = { id: 'earth', type: 'fill', source: 'basemap' } as const;
    expect(focusIndonesianLabels(earth, land)).toBe(earth);
  });
});
