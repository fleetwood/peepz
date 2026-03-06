import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') return

  const config    = useRuntimeConfig()
  const socketUrl = config.public.socketUrl as string

  let ws: WebSocket | null = null

  function connect(token?: string) {
    ws?.close()
    const url = token ? `${socketUrl}?token=${encodeURIComponent(token)}` : socketUrl
    ws = new WebSocket(url)
  }

  window.addEventListener('beforeunload', () => {
    ws?.close()
    ws = null
  })
})
