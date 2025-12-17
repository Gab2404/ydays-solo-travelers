import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // INDISPENSABLE pour que le téléphone accède au site
    port: 5173
  }
})