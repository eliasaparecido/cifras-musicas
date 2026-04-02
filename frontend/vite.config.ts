import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const publicHost = process.env.VITE_PUBLIC_HOST
const disableHmr = process.env.VITE_DISABLE_HMR === 'true'
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://backend:3002'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    hmr: disableHmr
      ? false
      : publicHost
        ? {
            protocol: 'wss',
            host: publicHost,
            clientPort: 443,
          }
        : undefined,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
})