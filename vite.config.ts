import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { templateCompilerOptions } from '@tresjs/core';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      ...templateCompilerOptions,
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 백엔드 주소 (포트 확인!)
        changeOrigin: true,
        // '/api/game'으로 요청이 오면 -> 백엔드에는 '/game'으로 바꿔서 보내줌
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
