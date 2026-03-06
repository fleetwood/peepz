import ReconnectingWebSocket from 'reconnecting-websocket'
// @ts-ignore - sharedb/lib/client has no correct ESM types
import { Connection } from 'sharedb/lib/client'
import type { ShareDbSubscribeParams } from '@peeps/types'

type ShareDbClientConfig = {
  url   : string
  token?: string
}

export class ShareDbClient {
  private static connection: any = null

  static connect(config: ShareDbClientConfig): void {
    if (ShareDbClient.connection) return

    const url    = config.token ? `${config.url}?token=${encodeURIComponent(config.token)}` : config.url
    const socket = new ReconnectingWebSocket(url, [], {
      maxEnqueuedMessages: 0,
    })

    ShareDbClient.connection = new Connection(socket as any)
  }

  static doc({ collection, docId }: ShareDbSubscribeParams): any {
    if (!ShareDbClient.connection) return null
    return ShareDbClient.connection.get(collection, docId)
  }

  static disconnect(): void {
    ShareDbClient.connection?.close()
    ShareDbClient.connection = null
  }
}
