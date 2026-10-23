import { defineConfig } from 'vitest/config';

// Vitest configuration for the test harness (test-only; never shipped to the browser).
//
// environment: 'jsdom'  -> gives Node tests a DOM + window.localStorage so the
//   component/DOM tests (which render DOM and persist via Local Storage) can run
//   outside a real browser. Pure-logic property tests also run here harmlessly.
//
// globals: true  -> exposes vitest's `test`, `expect`, `describe`, etc. as globals
//   so test files can use `test(...)` without importing it (matches the spec's
//   design doc example). Files that explicitly `import { test } from 'vitest'`
//   are unaffected.
//
// Test discovery uses vitest defaults: it finds `*.test.js` / `*.spec.js` files,
// so tests placed in `tests/` are picked up automatically.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
