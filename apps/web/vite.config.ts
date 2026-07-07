import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            return 'vendor'
          }

          if (
            id.includes('/features/rollout-admin/') ||
            id.includes('/features/domain-admin/') ||
            id.includes('/features/operations-admin/')
          ) {
            return undefined
          }

          if (id.includes('/apps/web/src/') && id.endsWith('-ui.ts')) {
            if (id.includes('/features/')) {
              return undefined
            }
            return 'app-ui'
          }

          return undefined
        },
      },
    },
  },
})
