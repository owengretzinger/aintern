import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  allowedHosts: [
    "localhost",
    "*.ngrok-free.app", // Allow all ngrok-free.app subdomains
    "easy-walrus-dominant.ngrok-free.app", // Specific ngrok tunnel
    "98c2-130-15-35-102.ngrok-free.app"
  ],
})
