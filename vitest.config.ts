import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // This package colocates its test with the source it covers, so the glob
    // points at src/ rather than the test/ directory the other @tselect
    // packages use. Nothing ships from here — `files` is ["dist"].
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      reporter: ['text', 'lcov'],
      // 95 is the shared floor across all 7 @tselect packages, so the bar is the
      // same everywhere rather than an artefact of how easy each one is to cover.
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
