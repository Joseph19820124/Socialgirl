import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/instagram': {
        target: 'https://instagram-scraper-20251.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/instagram/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Add RapidAPI host header to the proxied request
            proxyReq.setHeader('x-rapidapi-host', 'instagram-scraper-20251.p.rapidapi.com');
            console.log('[Vite Proxy] Proxying request to Instagram API:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('[Vite Proxy] Received response from Instagram API:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})
