import type { components } from './schema';

type HealthResponse = components['schemas']['HealthResponse'];

export async function getApiHealth(
  baseUrl: string,
  fetcher: typeof fetch = fetch
): Promise<HealthResponse> {
  const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/api/v1/health/live`, {
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error(`API health request failed (${response.status})`);
  return response.json();
}
