import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // es2016, not the es2015 the other @tselect packages use: this is the level
  // tsc's `target` was already set to here, and the emitted syntax level is the
  // one part of the support policy that stays strictly additive. Never raise it.
  target: 'es2016',
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
});
