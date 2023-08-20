import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  envDir: '../env',
  envPrefix: ['__APP__'],
  build: {
    outDir: '../app/web',
    assetsInlineLimit: 1024 * 1024 * 10, // 10M
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1024 * 10, // 10M
  },
});
