import { getMongoDb } from '@peeps/db'
import { MongoHeartbeatResult } from '@peeps/types'

export class MongoService {
  static async heartbeat(): Promise<MongoHeartbeatResult> {
    try {
      const { admin, dbName, clusterName } = await getMongoDb()

      await admin.command({ ping: 1 })
      const status = await admin.serverStatus()

      return {
        ok         : true,
        serverTime : status.localTime ?? new Date(),
        dbName,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message)
    }
  }

}
