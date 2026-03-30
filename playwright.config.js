import { defineConfig } from "@playwright/test";

const isDevContainer =
  !!process.env.DEVCONTAINER ||
  !!process.env.REMOTE_CONTAINERS ||
  !!process.env.CODESPACES;

// Inside a devcontainer: start client + server directly via npm
// On host machine: use docker compose to spin up the full stack
const webServer = isDevContainer
  ? [
      {
        command: "cd server && npm run dev",
        url: "http://localhost:5005/api/auth/verify",
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
      {
        command: "cd client && npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
    ]
  : {
      command: "docker compose up",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    };

export default defineConfig({
  globalSetup: "./e2e/global-setup.js",
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserType: "chromium" },
    },
  ],
  webServer,
});