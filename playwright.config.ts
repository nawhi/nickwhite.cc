import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Galaxy A55'] },
    // },
    // {
    //   name: 'safari',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'mobile-safari',
    //   use: { ...devices['iPhone XR'] },
    // },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
});
