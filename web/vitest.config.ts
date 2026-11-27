import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': rootDir,
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000/admin',
      },
    },
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
  },
});
