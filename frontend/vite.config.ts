import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/trpc": {
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
    ],
  },
});
