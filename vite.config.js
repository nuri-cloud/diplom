import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://business.navisdevs.ru',
        changeOrigin: true,
        secure: false,
      },
      '/logs': {
        target: 'https://business.navisdevs.ru',
        changeOrigin: true,
        secure: false,
      },
      '/settings': {
        target: 'https://business.navisdevs.ru',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})