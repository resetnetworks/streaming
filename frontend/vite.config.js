import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Basic optimizations for production
  build: {
    minify: 'esbuild',
    sourcemap: false
  },
  
  // React-helmet-async compatibility
  optimizeDeps: {
    include: ['react-helmet-async']
  },
  
  ssr: {
    noExternal: ['react-helmet-async']
  }
});
