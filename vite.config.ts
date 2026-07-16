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
    }),
  ],
})
