import ShareDB from 'sharedb'
import { getShareDbBackend } from '@peeps/db/sharedb'
import type { ShareDbCollection, ShareDbDocId } from '@peeps/types'

type ShareDbBackend    = InstanceType<typeof ShareDB>
type ShareDbConnection = ReturnType<ShareDbBackend['connect']>

export class ShareDbService {
  static getBackend(): ShareDbBackend {
    return getShareDbBackend()
  }

  static getDoc(collection: ShareDbCollection, docId: ShareDbDocId): ShareDB.Doc {
    const backend    = getShareDbBackend()
    const connection = backend.connect() as ShareDbConnection
    return connection.get(collection, docId)
  }

}
