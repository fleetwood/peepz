import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

const envPath = resolve(__dirname, '../../.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const URLS = {
  supabase: 'http://localhost:54321',
  socket  : 'ws://localhost:4100',
  api     : 'http://localhost:3001',
}

const runtimeConfig = {
    public: {
      apiUrl         : process.env.NEXT_PUBLIC_API_URL          || URLS.api,
      socketUrl      : process.env.NEXT_PUBLIC_SOCKET_URL       || URLS.socket,
      apiKey         : process.env.NEXT_PUBLIC_API_KEY || '',
      supabaseUrl    : process.env.NEXT_PUBLIC_SUPABASE_URL
                    || process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL
                    || URLS.supabase,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    || process.env.NEXT_PUBLIC_SUPABASE_KEY
                    || '',
    }
  }

console.log(' >>>>> NUXT CONFIG', runtimeConfig)
// @ts-ignore
export default defineNuxtConfig({
  build: {
    transpile: [/^@peeps\//],
  },
  devtools: { enabled: true },
  components: [
    { path: '~/components/ui', extensions: ['vue'], pathPrefix: false },
    { path: '~/components', extensions: ['vue'] }
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],
  runtimeConfig,
  css: ['~/assets/css/main.css'],
  vite: {
    resolve: {
      alias: {
        '@peeps/ui/assets': resolve(__dirname, '../../packages/ui/assets'),
      },
    },
  },
  postcss: {
    plugins: {
      tailwindcss : {},
      autoprefixer: {},
    },
  },
})
