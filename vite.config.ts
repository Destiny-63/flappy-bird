import { defineConfig } from 'vitest/config'

// Project Pages URL: https://<user>.github.io/flappy-bird/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/flappy-bird/' : '/',
  test: {
    environment: 'node',
  },
})
