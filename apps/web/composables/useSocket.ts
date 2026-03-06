import type { SocketPath, SocketListener } from '@peeps/types'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

/**
 * Vue composable for subscribing to SocketClient topics
 * Automatically subscribes on mount and unsubscribes on unmount
 */
export function useSocket<T = unknown>(topic: SocketPath): Ref<T | undefined> {
  const value = ref<T>()

  const listener = ((data: T) => {
    value.value = data as T
  }) as SocketListener<T>

  onMounted(async () => {
    const { SocketClient } = await import('@peeps/client/socket')
    SocketClient.on(topic, listener)
  })

  onUnmounted(async () => {
    const { SocketClient } = await import('@peeps/client/socket')
    SocketClient.off(topic, listener)
  })

  return value
}

/**
 * Send a message through the socket
 * Note: SocketClient is pub/sub - publishing is typically done server-side
 */
export function useSocketPublish() {
  // SocketClient doesn't have a direct publish method in the code I saw
  // Publishing is typically done via REST API or server-side
  // This is a placeholder for when that functionality is needed
  return {
    publish: (topic: string, payload: unknown) => {
      // Implementation depends on your socket architecture
      console.warn('SocketClient.publish not implemented - use REST API or server-side publish')
    }
  }
}
