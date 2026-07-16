import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TARTAR Business Management System',
        short_name: 'TARTAR',
        description: 'Multi-branch business management system for TARTAR.',
        theme_color: '#c1121f',
        background_color: '#ffffff',
        display: 'standalone',
      },
      workbox: {
        // Read-only offline (build spec §2): precache the whole app shell. The
        // charts vendor chunk is large, so lift the default 2 MiB cap.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendors so the shell isn't one monolithic chunk and the
        // browser can cache them independently across deploys.
        manualChunks(id) {
          // Split only the two heaviest, self-contained vendors so the rest of
          // the shell stays in one cache-friendly chunk (avoids circular chunks).
          if (id.includes('@ant-design/charts') || id.includes('@antv')) return 'charts'
          if (id.includes('/node_modules/antd/')) return 'antd'
          return undefined
        },
      },
    },
  },
})
