import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/budget-app/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base,
      scope: base,
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'Budget',
        short_name: 'Budget',
        description: 'Personal zero-based envelope budgeting app',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0b1120',
        theme_color: '#0b1120',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
