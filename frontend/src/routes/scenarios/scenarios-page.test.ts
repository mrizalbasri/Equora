import { describe, expect, it } from 'vitest';
import { load } from './+page';

describe('/scenarios load', () => {
  it('redirects to /studio#skenario-tersimpan with status 307', () => {
    try {
      load();
      expect.fail('load() should throw redirect');
    } catch (err: unknown) {
      const redirectErr = err as { status?: number; location?: string };
      expect(redirectErr.status).toBe(307);
      expect(redirectErr.location).toBe('/studio#skenario-tersimpan');
    }
  });
});
