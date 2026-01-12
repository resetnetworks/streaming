import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['apexcharts', 'react-apexcharts'],
  },
  build: {
    chunkSizeWarningLimit: 1600, // Warning limit increase
  }
});