import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  async onSuccess() {
    const fs = await import('node:fs');
    fs.mkdirSync('dist/styles', { recursive: true });
    fs.copyFileSync('src/styles/base.css', 'dist/styles/base.css');
    fs.copyFileSync('src/styles/variables.css', 'dist/styles/variables.css');
  },
});
