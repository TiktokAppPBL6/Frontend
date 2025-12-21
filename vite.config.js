import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'], // Force single React instance
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle React
  },
  server: {
    port: 3000,
    strictPort: false, // Allow multiple instances for WebSocket testing
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 3000,
      port: 3000,
    },
    proxy: {
      '/api/v1/auth/google/callback': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Intercept backend response
            let body = '';
            proxyRes.on('data', (chunk) => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              try {
                const data = JSON.parse(body);
                if (data.access_token) {
                  // Redirect to frontend callback with token
                  res.writeHead(302, {
                    Location: `http://localhost:3000/auth/google/callback?access_token=${data.access_token}`
                  });
                  res.end();
                }
              } catch (e) {
                // Not JSON, pass through
              }
            });
          });
        }
      }
    }
  },
})
