import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Step 1 only precaches the app shell so it opens without signal and can be installed.
    // The offline write queue for set logging arrives in step 2.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'FitnessApp',
        short_name: 'FitnessApp',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f1923',
        theme_color: '#0f1923',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Spanish/English only need the latin subsets; others still load on demand when online.
        globIgnores: ['**/inter-{cyrillic,greek,vietnamese}*'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
