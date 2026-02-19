import { clientEnv } from '@peeps/config/env'
import type { SocketPath, SocketListener } from '@peeps/types'
import { SupabaseClient } from '../supabase/client'

type SocketClientConfig = {
  url   : string
  token?: string
}

type SocketMessage = {
  topic  : string
  payload: unknown
}

function topicKey(topic: SocketPath): string {
  const segments = topic instanceof Set ? [...topic] : topic.split('/').filter(Boolean)
  return segments.sort().join('/')
}

export class SocketClient {
  private static socket     : WebSocket | null                           = null
  private static listeners  : Map<string, Set<SocketListener>>          = new Map()
  private static lastValues : Map<string, unknown>                      = new Map()
  private static activeToken: string | undefined                        = undefined

  static connect(config: SocketClientConfig): void {
    if (config.token === SocketClient.activeToken && SocketClient.socket?.readyState === WebSocket.OPEN) return
    SocketClient.activeToken = config.token
    SocketClient.disconnect()

    const url = config.token ? `${config.url}?token=${encodeURIComponent(config.token)}` : config.url
    const ws  = new WebSocket(url)

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as SocketMessage
        SocketClient.dispatch(msg)
      } catch { /* ignore malformed messages */ }
    }

    SocketClient.socket = ws
  }

  static disconnect(): void {
    SocketClient.socket?.close()
    SocketClient.socket = null
  }

  static on<T = unknown>(topic: SocketPath, listener: SocketListener<T>): void {
    const key = topicKey(topic)
    if (!SocketClient.listeners.has(key)) {
      SocketClient.listeners.set(key, new Set())
    }
    SocketClient.listeners.get(key)!.add(listener as SocketListener)

    const last = SocketClient.lastValues.get(key)
    if (last !== undefined) listener(last as T)
  }

  static off<T = unknown>(topic: SocketPath, listener: SocketListener<T>): void {
    SocketClient.listeners.get(topicKey(topic))?.delete(listener as SocketListener)
  }

  static createWeb(): typeof SocketClient {
    if (typeof window === 'undefined') return SocketClient

    SupabaseClient.get().auth.getSession().then(({ data }) => {
      SocketClient.connect({ url: clientEnv.SOCKET_URL, token: data.session?.access_token })
    })

    SupabaseClient.get().auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      SocketClient.connect({ url: clientEnv.SOCKET_URL, token: session?.access_token })
    })

    return SocketClient
  }

  private static dispatch(msg: SocketMessage): void {
    const pub = new Set(msg.topic.split('/').filter(Boolean))

    SocketClient.listeners.forEach((listeners, subscribedKey) => {
      const sub     = new Set(subscribedKey.split('/'))
      const smaller = pub.size <= sub.size ? pub : sub
      const larger  = pub.size <= sub.size ? sub : pub
      const matches = [...smaller].every((seg) => larger.has(seg))

      if (matches) {
        SocketClient.lastValues.set(subscribedKey, msg.payload)
        listeners.forEach((fn) => fn(msg.payload))
      }
    })
  }
}