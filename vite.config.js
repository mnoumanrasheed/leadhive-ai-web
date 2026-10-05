import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    server: {
      proxy: {
        '/api': {
          target: env.BACKEND_URL,
          changeOrigin: true,
          secure: true,
        },

        '/auth': {
          target: env.BACKEND_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})