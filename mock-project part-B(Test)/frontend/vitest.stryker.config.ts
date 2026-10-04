// The project's Vitest config plus one extra setup file, used only by Stryker (see stryker.config.mjs).
import { defineConfig, mergeConfig } from 'vitest/config'
import base from './vitest.config'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      setupFiles: ['./tests/setup.ts', './stryker/skip-thread-tz.setup.ts'],
    },
  })
)
