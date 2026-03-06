export type SocketPath = Set<string> | string

export type SocketListener<T = unknown> = (payload: T) => void

export type ShareDbCollection =
  | 'families'
  | 'posts'
  | 'comments'
  | 'likes'
  | 'shares'

export type ShareDbDocId = string

export type ShareDbPresence<T = unknown> = {
  docId     : ShareDbDocId
  collection: ShareDbCollection
  data      : T
}

export type ShareDbSubscribeParams = {
  collection: ShareDbCollection
  docId     : ShareDbDocId
}

export type ShareDbHeartbeatResult = {
  ok        : boolean
  port      : number
  presence? : number
  dbName?   : string
  serverTime?: Date
  error?    : string
}
