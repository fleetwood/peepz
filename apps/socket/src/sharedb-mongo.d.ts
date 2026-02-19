declare module 'sharedb-mongo' {
  function ShareDbMongo(uri: string, options?: Record<string, any>): any
  export = ShareDbMongo
}

declare module '@teamwork/websocket-json-stream' {
  import { Duplex } from 'stream'
  import type WebSocket from 'ws'
  class WebSocketJSONStream extends Duplex {
    constructor(ws: WebSocket)
  }
  export = WebSocketJSONStream
}
