import { expect, test } from '@playwright/test';

test('built frontend serves its foundation and health routes', async ({ request }) => {
  const root = await request.get('/');
  expect(root.ok()).toBeTruthy();
  expect(await root.json()).toEqual({
    service: 'Equora frontend', status: 'ok', stage: 'foundation'
  });
  const health = await request.get('/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toEqual({ status: 'ok' });
});
