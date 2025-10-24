// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'

export default defineConfig({
  plugins: [
    react(),
    vitePrerenderPlugin({
      renderTarget: '#root',
      routes: ['/', '/contact-us', '/about-us','privacy-policy','terms-and-conditions','cancellation-refund-policy','data-deletion'],
    })
  ]
})
