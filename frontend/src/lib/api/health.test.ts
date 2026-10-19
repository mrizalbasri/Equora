import { describe, expect, it, vi } from 'vitest';
import { getApiHealth } from './health';

describe('API health client', () => {
  it('uses the versioned backend route', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ status: 'ok', service: 'Equora API' })
    );
    expect(await getApiHealth('http://localhost:8000/', fetcher)).toEqual({
      status: 'ok', service: 'Equora API'
    });
    expect(fetcher.mock.calls[0][0]).toBe('http://localhost:8000/api/v1/health/live');
  });

  it('rejects failed API requests', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
    await expect(getApiHealth('http://localhost:8000', fetcher)).rejects.toThrow('503');
  });
});
