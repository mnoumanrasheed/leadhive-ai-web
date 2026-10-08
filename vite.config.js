import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const backendProxy = {
    target: env.BACKEND_URL,
    changeOrigin: true,
    secure: true,
    headers: {
      'X-Tunnel-Skip-AntiPhishing-Page': 'true',
    },
  }

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    server: {
      proxy: {
        '/api': backendProxy,
        '/auth': backendProxy,
        '/business-profile': backendProxy,
        '/selection-videos': backendProxy,
        '/comments': backendProxy,
        '/ai': backendProxy,
      },
    },
  }
})
