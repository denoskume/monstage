import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const webRoot = fileURLToPath(new URL('.', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  root: webRoot,
  envDir: repositoryRoot,
  plugins: [react()],
  server: {
    allowedHosts: ['terminal.local'],
    fs: { allow: [repositoryRoot] }, // Keep the shared package accessible in development.
  },
  base: '/monstage/',
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
