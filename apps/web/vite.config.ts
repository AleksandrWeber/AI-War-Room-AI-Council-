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

          if (id.includes('/apps/web/src/') && id.endsWith('-ui.ts')) {
            if (
              id.includes('billing-ui.ts') ||
              id.includes('workspace-ui.ts') ||
              id.includes('usage-ui.ts')
            ) {
              return 'app-ui'
            }

            return undefined
          }

          return undefined
        },
      },
    },
  },
})
