const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'logs/playwright-report' }],
    ['json', { outputFile: 'logs/test-results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome拡張機能のテスト用設定
        launchOptions: {
          args: [
            `--disable-extensions-except=${process.cwd()}/extension-root`,
            `--load-extension=${process.cwd()}/extension-root`
          ]
        }
      }
    }
  ],
  outputDir: 'logs/test-results/'
});