import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ranking App',
        short_name: 'Ranking',
        description: 'Classement de jeux entre amis',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        start_url: '/ranking-app/',
        scope: '/ranking-app/',
        icons: [
          { src: '/ranking-app/icon-ranking.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  base: '/ranking-app/',
})
