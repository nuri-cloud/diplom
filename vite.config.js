import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://89.23.99.85',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})