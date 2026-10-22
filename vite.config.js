import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '')
  const backendUrl = env.BACKEND_URL?.trim()
  const recaptchaSiteKey = env.VITE_RECAPTCHA_SITE_KEY?.trim()
  if (!backendUrl) {
    throw new Error('BACKEND_URL must be set in the project .env file.')
  }

  // Vite only exposes variables beginning with VITE_ to browser code. The site
  // key is public by design, but building without it creates a form that can
  // never render its required reCAPTCHA challenge.
  if (mode === 'production' && !recaptchaSiteKey) {
    throw new Error('VITE_RECAPTCHA_SITE_KEY must be set for a production build.')
  }

  try {
    const protocol = new URL(backendUrl).protocol
    if (protocol !== 'http:' && protocol !== 'https:') {
      throw new Error()
    }
  } catch {
    throw new Error('BACKEND_URL must be a valid HTTP or HTTPS URL.')
  }

  const backendProxy = {
    target: backendUrl,
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
        '/analytics': backendProxy,
        '/demo': backendProxy,
      },
    },
  }
})
