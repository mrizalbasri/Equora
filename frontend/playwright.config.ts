import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined
  },
  webServer: [
    {
      command: 'node tests/admin-api-server.mjs',
      url: 'http://127.0.0.1:18081/health',
      reuseExistingServer: false,
    },
    {
      command: 'pnpm run preview --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173/health',
      env: { API_BASE_URL: 'http://127.0.0.1:18081' },
      reuseExistingServer: false,
    },
  ],
});
