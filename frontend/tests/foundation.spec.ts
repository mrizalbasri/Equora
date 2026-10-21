import { expect, test } from '@playwright/test';

test('built frontend serves landing HTML and a separate health route', async ({ request }) => {
  const root = await request.get('/');
  expect(root.ok()).toBeTruthy();
  expect(root.headers()['content-type']).toContain('text/html');
  expect(await root.text()).toContain('Beda wilayah,');
  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });
});
