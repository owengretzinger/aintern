import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    allowedHosts: [
      "localhost",
      "*.ngrok-free.app", // Allow all ngrok-free.app subdomains
      "easy-walrus-dominant.ngrok-free.app", // Specific ngrok tunnel
      "fffa-130-15-35-102.ngrok-free.app",
      "189f-209-29-99-157.ngrok-free.app", // Added new ngrok tunnel
      "full-liked-ray.ngrok-free.app",
      "12b6-209-29-99-157.ngrok-free.app",
      "591b-209-29-99-157.ngrok-free.app",
      "90e3-130-15-35-136.ngrok-free.app",
      "full-liked-ray.ngrok-free.app",
      "falcon-enough-corgi.ngrok-free.app",
      "fa26-130-15-35-136.ngrok-free.app",
      "28a7-24-141-35-108.ngrok-free.app",
      "b981-24-141-35-108.ngrok-free.app",
    ],
  },
});
