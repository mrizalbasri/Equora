import { env } from '$env/dynamic/private';
import { getApiHealth } from '#lib/api/health.ts';

export async function GET({ fetch }: { fetch: typeof globalThis.fetch }) {
  try {
    return Response.json(await getApiHealth(env.API_BASE_URL ?? 'http://localhost:8000', fetch));
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503 });
  }
}
