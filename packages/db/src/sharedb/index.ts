import ShareDB from 'sharedb'
import ShareDbMongo from 'sharedb-mongo'
import { serverEnv } from '@peeps/config/env'

type ShareDbBackend = InstanceType<typeof ShareDB>

declare global {
  var __peepsShareDbBackend: ShareDbBackend | undefined
}

function createBackend(): ShareDbBackend {
  const db = ShareDbMongo(serverEnv.MONGODB_URI)
  return new ShareDB({ db })
}

export function getShareDbBackend(): ShareDbBackend {
  if (!globalThis.__peepsShareDbBackend) {
    globalThis.__peepsShareDbBackend = createBackend()
  }
  return globalThis.__peepsShareDbBackend
}
