import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: [resolve('index.html'), resolve('thanks.html'), resolve('start-project/index.html'), resolve('thank-you/index.html'), ...readdirSync('work').filter(f => f.endsWith('.html')).map(f => resolve('work', f))]
    },
    chunkSizeWarningLimit: 650
  }
});
