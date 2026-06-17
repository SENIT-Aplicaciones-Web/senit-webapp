import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * @summary Vite configuration. The base path is read from .env files so the app
 * can keep clean history URLs without using hash routing.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_PUBLIC_BASE_PATH || '/senit-webapp/',
    plugins: [vue()]
  }
})
