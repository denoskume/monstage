import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5173/monstage/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      VITE_MONSTAGE_API_URL: 'https://example.test',
      VITE_GOOGLE_CLIENT_ID: 'e2e-client-id.apps.googleusercontent.com',
    },
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
    { name: 'Small Mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true } },
  ],
});
