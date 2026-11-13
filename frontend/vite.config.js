import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/resumes': 'http://127.0.0.1:8000',
      '/projects': 'http://127.0.0.1:8000',
      '/suggestions': 'http://127.0.0.1:8000',
      '/webhooks': 'http://127.0.0.1:8000',
    },
  },
})
