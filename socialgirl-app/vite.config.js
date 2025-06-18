import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/instagram': {
          target: `https://${env.VITE_INSTAGRAM_RAPIDAPI_HOST || 'instagram-scraper-20251.p.rapidapi.com'}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/instagram/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add RapidAPI host header to the proxied request
              proxyReq.setHeader('x-rapidapi-host', env.VITE_INSTAGRAM_RAPIDAPI_HOST || 'instagram-scraper-20251.p.rapidapi.com');
              console.log('[Vite Proxy] Proxying request to Instagram API:', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes) => {
              console.log('[Vite Proxy] Received response from Instagram API:', proxyRes.statusCode);
            });
          }
        }
      }
    }
  }
})