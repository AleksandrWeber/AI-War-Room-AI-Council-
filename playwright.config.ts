import { defineConfig } from '@playwright/test'

const reuseExistingServer = !process.env.CI

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'node scripts/e2e-api-server.mjs',
      url: 'http://127.0.0.1:3000/api/health',
      reuseExistingServer,
      timeout: 180_000,
    },
    {
      command: 'npm run dev --workspace apps/web',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer,
      timeout: 60_000,
    },
  ],
})
