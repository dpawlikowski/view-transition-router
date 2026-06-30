import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL ?? '/',
  resolve: {
    alias: {
      'view-transition-router': resolve(__dirname, '../src/index.ts'),
    },
  },
});
