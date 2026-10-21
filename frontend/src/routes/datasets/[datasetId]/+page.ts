import { error } from '@sveltejs/kit';
import { demoDatasets } from '$lib/datasets/demo';

export function load({ params }) {
  const dataset = demoDatasets.find((item) => item.id === params.datasetId);
  if (!dataset) error(404, 'Dataset tidak ditemukan');
  return { dataset };
}
