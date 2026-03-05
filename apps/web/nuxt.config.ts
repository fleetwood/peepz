import { clientEnv } from '@peeps/config/env'

// @ts-ignore
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@pinia/nuxt',
    'shadcn-nuxt'
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  runtimeConfig: {
    public: {
      apiUrl: clientEnv.API_URL,
      socketUrl: clientEnv.SOCKET_URL,
      supabaseUrl: clientEnv.SUPABASE_URL,
      supabaseAnonKey: clientEnv.SUPABASE_ANON_KEY
    }
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
