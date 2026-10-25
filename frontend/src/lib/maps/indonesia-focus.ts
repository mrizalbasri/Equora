import type { FeatureCollection, MultiPolygon } from 'geojson';
import type { FilterSpecification, LayerSpecification } from 'maplibre-gl';

export function indonesiaLand(boundaries: FeatureCollection): MultiPolygon {
  return {
    type: 'MultiPolygon',
    coordinates: boundaries.features.flatMap(({ geometry }) =>
      geometry.type === 'Polygon' ? [geometry.coordinates] :
      geometry.type === 'MultiPolygon' ? geometry.coordinates : [],
    ),
  };
}

export function focusIndonesianLabels(layer: LayerSpecification, land: MultiPolygon): LayerSpecification {
  if (layer.type !== 'symbol') return layer;
  let filter = layer.filter;
  // Protomaps mixes legacy property filters with expression filters.
  if (Array.isArray(filter) && typeof filter[1] === 'string') {
    if (filter[0] === '==') filter = ['==', ['get', filter[1]], filter[2]] as FilterSpecification;
    else if (filter[0] === 'in') filter = ['in', ['get', filter[1]], ['literal', filter.slice(2)]] as FilterSpecification;
  }
  return {
    ...layer,
    filter: ['all', ...(filter ? [filter] : []), ['within', land]] as FilterSpecification,
  };
}
