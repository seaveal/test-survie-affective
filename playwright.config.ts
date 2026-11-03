// Suite e2e de la page /rdv/ (chantier RDV page maison) : iPhone en WebKit, Android en
// Chromium, contre une API simulée (e2e/rdv.spec.ts). Lancée par scripts/redeploy-front.sh :
// la page ne se déploie pas sans elle. WebKit exige ses bibliothèques système
// (`playwright install-deps webkit`, en root, une fois).
import { defineConfig, devices } from '@playwright/test'

const PORT = 5199

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, locale: 'fr-FR', timezoneId: 'Europe/Paris' },
  projects: [
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite --config vite.rdv.config.ts --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/rdv/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
