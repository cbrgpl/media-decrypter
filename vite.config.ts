import { resolve } from 'path';
import { defineConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

export default defineConfig({
  base: '/media-ecnrypted',
  build: {
    sourcemap: true,
  },
  plugins: [vue(), vuetify({})],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
