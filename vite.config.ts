import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'editor-core',
              test: /node_modules\/@tiptap\/(core|pm|react)\//,
            },
            {
              name: 'editor-extensions',
              test: /node_modules\/@tiptap\/(extension-|extensions|starter-kit)\//,
            },
            {
              name: 'editor-markdown',
              test: /node_modules\/@tiptap\/markdown\//,
            },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'icon-dark.svg',
        'icon-light.svg',
        'flowboard-background.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
      ],
      manifest: {
        name: 'Flowboard',
        short_name: 'Flowboard',
        description:
          'A focused local-first visual workflow board for organizing columns, cards, priorities, and tags.',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
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
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        start_url: '/',
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{css,html,ico,js,png,svg,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
