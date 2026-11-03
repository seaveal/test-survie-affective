import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // e2e/ : suite Playwright de la page /rdv/ (npm run test:e2e), pas Vitest.
    exclude: ['**/node_modules/**', 'e2e/**'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/data/**'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
