import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/core.ts'],
  format: 'esm',
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
  minify: true,
  // Emit classic ".js"/".d.ts" extensions to match the exports map in package.json
  fixedExtension: false,
});
