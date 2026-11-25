import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const dockerDev = process.env.VITE_DOCKER_DEV === 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: dockerDev ? '0.0.0.0' : 'localhost',
    watch: dockerDev ? { usePolling: true } : undefined,
    proxy: {
      '/api': {
        target: dockerDev ? 'http://backend:8080' : 'http://localhost:8080',
      },
    },
  },
})