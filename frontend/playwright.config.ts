import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;

// Always true, not just `!CI`: the same suite also runs against a stack
// that's already booted via `docker compose up` (see the docker-deploy CI
// job), where ports 3000/5173 are already bound before Playwright starts.
// `reuseExistingServer: true` still starts a fresh server when nothing is
// listening yet (e.g. the plain native "e2e" CI job), so this is safe either way.
const REUSE_EXISTING_SERVER = true;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: CI ? [["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "cd ../backend && bundle exec rails server -p 3000 -e test",
      url: "http://localhost:3000/up",
      reuseExistingServer: REUSE_EXISTING_SERVER,
      timeout: 60_000,
    },
    {
      command: "npm run dev -- --port 5173",
      url: "http://localhost:5173",
      reuseExistingServer: REUSE_EXISTING_SERVER,
      timeout: 60_000,
    },
  ],
});
