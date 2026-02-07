import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: 'line',
  projects: ['light' as const, 'dark' as const].flatMap((colorScheme) => [
    {
      name: `chromium-desktop-${colorScheme}`,
      use: { ...devices['Desktop Chrome'], colorScheme },
    },
    {
      name: `samsung-a55-${colorScheme}`,
      use: { ...devices['Galaxy A55'], colorScheme },
    },
    // TODO: Webkit crashes on startup for me
    // {
    //   name: `safari-desktop-${colorScheme}`,
    //   use: { ...devices['Desktop Safari'], colorScheme },
    // },
    // {
    //   name: `safari-mobile-${colorScheme}`,
    //   use: { ...devices['iPhone SE (3rd gen)'], colorScheme },
    // },
    {
      name: `firefox-desktop-${colorScheme}`,
      use: { ...devices['Desktop Firefox'], colorScheme },
    },
  ]),
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
});
