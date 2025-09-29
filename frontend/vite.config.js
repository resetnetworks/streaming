import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react({
      // ✅ Production optimization
      jsxRuntime: 'automatic'
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon.svg"],
      workbox: {
        // ✅ Cache strategy for better performance
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.resetmusic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
              }
            }
          }
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        globIgnores: ['**/node_modules/**/*', '**/sw.js', '**/workbox-*.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/_/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        name: "Reset Music Streaming Platform",
        short_name: "Reset Music",
        description: "Stream ambient, instrumental, and experimental music on Reset Music.",
        theme_color: "#3b82f6",
        background_color: "#000000",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait-primary",
        categories: ["music", "entertainment"],
        lang: "en-US",
        dir: "ltr",
        id: "/",
        // ✅ Icons for all platforms
        icons: [
          {
            src: "/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png", 
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any"
          }
        ],
        // ✅ Additional PWA features
        shortcuts: [
          {
            name: "Browse Music",
            short_name: "Browse",
            description: "Explore music collection",
            url: "/browse",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
          },
          {
            name: "Favorites",
            short_name: "Favorites", 
            description: "Your favorite tracks",
            url: "/favorites",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }]
          }
        ],
        screenshots: [
          {
            src: "/screenshot-wide.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "/screenshot-narrow.png", 
            sizes: "375x667",
            type: "image/png",
            form_factor: "narrow"
          }
        ]
      },
      // ✅ PWA development options
      devOptions: {
        enabled: false,
        type: 'module',
        navigateFallback: 'index.html'
      },
      // ✅ Strategies for different file types
      strategies: 'injectManifest'
    }),
  ],
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    reportCompressedSize: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    // ✅ Enhanced rollup options
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["axios", "redux", "react-redux"],
          ui: ["react-icons", "sonner"],
          media: ["howler", "hls.js"], // Add your audio libraries
          utils: ["lodash", "date-fns"]
        },
        // ✅ Better file naming for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
      // ✅ External dependencies that shouldn't be bundled
      external: []
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components", 
      "@pages": "/src/pages",
      "@utils": "/src/utils",
      "@hooks": "/src/hooks",
      "@features": "/src/features",
      "@assets": "/src/assets",
      "@styles": "/src/styles",
      "@types": "/src/types"
    },
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
    host: true, // Allow external access
    // ✅ Proxy for API calls in development
    proxy: {
      '/api': {
        target: 'https://api.resetmusic.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  optimizeDeps: {
    include: ["react", "react-dom", "axios", "react-icons"],
    exclude: ["@vite/client", "@vite/env"],
    force: false
  },
  // ✅ Environment variables configuration
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  // ✅ CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@styles/variables.scss";`
      }
    }
  }
});