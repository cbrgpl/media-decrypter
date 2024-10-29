import { resolve } from 'path';
import { defineConfig } from 'vite';

import { VitePWA } from 'vite-plugin-pwa';

import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

import manifest from './manifest.json';

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
      manifest: manifest as any,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
