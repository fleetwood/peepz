import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useSupabase } from '@/composables/useSupabase'

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  const config    = useRuntimeConfig()
  const supabase  = useSupabase()
  const socketUrl = config.public.socketUrl as string

  let ws: WebSocket | null = null

  function connect(token?: string) {
    ws?.close()
    const url = token ? `${socketUrl}?token=${encodeURIComponent(token)}` : socketUrl
    ws = new WebSocket(url)
  }

  supabase.auth.getSession().then(({ data }) => {
    connect(data.session?.access_token)
  })

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') return
    connect(session?.access_token)
  })

  window.addEventListener('beforeunload', () => {
    ws?.close()
    ws = null
  })
})
