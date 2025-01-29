import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Needed for ngrok
    strictPort: true, // Don't try other ports if 3000 is taken
  },
  allowedHosts: [
    "localhost",
    "*.ngrok-free.app", // Allow all ngrok-free.app subdomains
    "easy-walrus-dominant.ngrok-free.app", // Specific ngrok tunnel
    "98c2-130-15-35-102.ngrok-free.app",
    "d525-209-29-99-157.ngrok-free.app",
    "90e3-130-15-35-136.ngrok-free.app",
    "full-liked-ray.ngrok-free.app",
    "falcon-enough-corgi.ngrok-free.app",
  ],
});
