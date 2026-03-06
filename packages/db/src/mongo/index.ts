import { MongoClient } from 'mongodb'
import type { Admin, Db } from 'mongodb'
import { serverEnv } from '@peeps/config/env'

type MongoAdminContext = {
  admin      : Admin
  dbName     : string
  clusterName: string | null
}

declare global {
  var __peepsMongoClient: MongoClient | undefined
  var __peepsMongoDb: Db | undefined
}

export const mongoClient = globalThis.__peepsMongoClient ?? new MongoClient(serverEnv.MONGODB_URI)

globalThis.__peepsMongoClient = mongoClient

export async function getMongoDb(): Promise<MongoAdminContext> {
  if (!globalThis.__peepsMongoDb) {
    await mongoClient.connect()
    globalThis.__peepsMongoDb = mongoClient.db()
  }

  const dbInstance = globalThis.__peepsMongoDb
  const clusterName = mongoClient.options?.srvHost
    ?? mongoClient.options?.hosts?.[0]?.host
    ?? dbInstance.databaseName

  return {
    admin      : dbInstance.admin(),
    dbName     : dbInstance.databaseName,
    clusterName,
  }
}
