import { defineConfig } from 'vitest/config'

// Default to a plain Node environment (the logic/store tests need no DOM). The one
// component test opts into jsdom per-file with a `@vitest-environment jsdom` docblock.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['{src,electron,shared}/**/*.test.{ts,tsx}'],
  },
})
