import { defineConfig, devices } from '@playwright/test';

// E2E do fluxo crítico em navegador real. Usa o Chromium pré-instalado do
// ambiente (não baixa navegador) e sobe o app via Vite dev server.
export default defineConfig({
  testDir: './e2e',
  // O fluxo crítico cresceu (ambientes nomeados + N/A + linha extra na 0.6.4) e o
  // navegador real deste ambiente é lento (~1s por ação); 60s dá folga ao teste.
  timeout: 60_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/opt/pw-browsers/chromium',
          args: ['--no-sandbox'],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
