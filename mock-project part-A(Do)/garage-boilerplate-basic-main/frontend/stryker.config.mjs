// @ts-check
/**
 * Stryker mutation testing — scoped to the tasks feature only.
 * Run with: pnpm --filter frontend test:mutation
 *
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */

// The Stryker vitest runner forces `pool: 'threads'`. Worker threads inherit the
// parent's time zone and ignore `process.env.TZ` changes, so the time-zone test
// in format.test.ts can't switch zones itself. Pin the zone here, before any
// runner process starts. All tests pass under this zone.
process.env.TZ = 'America/Los_Angeles'

const config = {
  packageManager: 'pnpm',
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
  },
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: ['src/features/tasks/**/*.{ts,tsx}'],
  coverageAnalysis: 'perTest',
  reporters: ['clear-text', 'progress', 'html'],
  htmlReporter: {
    fileName: 'reports/mutation/mutation.html',
  },
  tempDirName: '.stryker-tmp',
  thresholds: { high: 80, low: 60, break: null },
}

export default config
