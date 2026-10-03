import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const vendorChunks = [
  { name: 'react', packages: ['react', 'react-dom', 'scheduler', 'react-router', 'react-router-dom'] },
  { name: 'supabase', packages: ['@supabase'] },
]

const vendorChunkOf = (id: string): string | undefined =>
  vendorChunks.find(({ packages }) =>
    packages.some((name) => id.includes(`/node_modules/${name}/`)),
  )?.name

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        id: '/',
        name: 'TARTAR Business Management System',
        short_name: 'TARTAR',
        description: 'Multi-branch business management system for TARTAR.',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        theme_color: '#eef2fb',
        background_color: '#eef2fb',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        categories: ['business', 'finance', 'productivity'],
        launch_handler: { client_mode: ['navigate-existing', 'auto'] },
        shortcuts: [
          {
            name: 'Sales',
            short_name: 'Sales',
            description: 'Record and deposit sales',
            url: '/sales',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Vouchers',
            short_name: 'Vouchers',
            description: 'Vouchers waiting for approval',
            url: '/vouchers',
            icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        screenshots: [
          {
            src: '/screenshots/narrow.png',
            sizes: '780x1688',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'TARTAR on a phone',
          },
          {
            src: '/screenshots/wide.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'TARTAR on a desktop',
          },
        ],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        globIgnores: ['splash/**', 'screenshots/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: { manualChunks: vendorChunkOf },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
