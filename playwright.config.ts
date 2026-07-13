import { defineConfig } from '@playwright/test'

const e2eApiPort = process.env.E2E_API_PORT ?? '3017'
const e2eWebPort = process.env.E2E_WEB_PORT ?? '5177'
const e2eApiUrl = `http://127.0.0.1:${e2eApiPort}`
const e2eWebUrl = `http://127.0.0.1:${e2eWebPort}`
const reuseExistingServer = !process.env.CI

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: e2eWebUrl,
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
      url: `${e2eApiUrl}/api/health`,
      reuseExistingServer,
      timeout: 180_000,
      env: {
        ...process.env,
        API_PORT: e2eApiPort,
        WEB_ORIGIN: e2eWebUrl,
      },
    },
    {
      command: `npm run dev --workspace apps/web -- --host 127.0.0.1 --port ${e2eWebPort}`,
      url: e2eWebUrl,
      reuseExistingServer,
      timeout: 60_000,
      env: {
        ...process.env,
        VITE_API_URL: `${e2eApiUrl}/api`,
      },
    },
  ],
})
