import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// hub.docker.com sends no CORS headers, so the browser can't call it directly.
// Both `dev` and `preview` forward /hub/* to Docker Hub (same-origin for the app).
const hubProxy = {
  '/hub': {
    target: 'https://hub.docker.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/hub/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: hubProxy },
  preview: { proxy: hubProxy },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
