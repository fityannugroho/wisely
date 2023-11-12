import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    alias: {
      '~': path.resolve('./src'),
    },
    coverage: {
      provider: 'v8',
    },
  },
});
