import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  optimizeDeps: {
    include: ['apexcharts', 'react-apexcharts'],
  },
  
  build: {
    // MUST: Hash-based filenames enable करें
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        // Manual chunks बनाएं (optional but recommended)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('apexcharts')) {
              return 'vendor-apexcharts';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    },
    
    // Build optimization
    chunkSizeWarningLimit: 1600,
    
    // Empty outDir before build
    emptyOutDir: true,
  },
  
  // Base path set करें (अगर subdomain या subdirectory में है)
  base: '/',
  
  // Environment variables define करें
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});