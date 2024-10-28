import { resolve } from 'path';
import { defineConfig } from 'vite';

import { VitePWA } from 'vite-plugin-pwa';

import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

export default defineConfig({
  base: '/media-decrypter',
  build: {
    sourcemap: true,
  },
  plugins: [
    vue(),
    vuetify({}),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        id: '/media-decrypter/',
        start_url: '/media-decrypter/',
        scope: '/media-decrypter/',
        name: 'Decrypter app for personal media',
        short_name: 'Decrypter',
        description:
          'A decrypted/encrypter application to safelly share your media file through messangers. If your messanger accound will be hacked nobody will able to view you media file(sent in chat) because they will be encrypted. For viewing files you must download them locally and decrypt using app. Decrypted files are not stored in filesystem.',
        display: 'standalone',
        background_color: '#141414',
        theme_color: '#E01541',
        orientation: 'portrait-primary',
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
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
