import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5175',
    // Disables CSS animation delays so transitions complete instantly in tests.
    // document.startViewTransition is still called — only the animation is skipped.
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },

  projects: [
    {
      // View Transitions + addTransitionType are fully supported in Chrome 111+.
      // Run the full suite on Chromium only.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx vite --port 5175',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
