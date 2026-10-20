const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './compatibility-tests',
  timeout: 30000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4173/index.html', trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'desktop-safari-engine', use: { ...devices['Desktop Safari'] } },
    { name: 'iphone-safari-simulation', use: { ...devices['iPhone 13'] } },
    { name: 'android-chrome-simulation', use: { ...devices['Pixel 7'] } }
  ],
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});
