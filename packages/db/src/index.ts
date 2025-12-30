import { client, db } from './client'

// Database client and schema exports
export { db, client }
export * from './schema'

// Inferred types from Drizzle schema
// These will be available after schema is defined
// Example:
// export type Person = typeof persons.$inferSelect
// export type NewPerson = typeof persons.$inferInsert


export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type WithTxExecutor<T> = (trx: Transaction) => Promise<T>

export type WithTxParams<T> = {
  tx      ?: Transaction
  executor: WithTxExecutor<T>
}

export async function withTx<T>({ tx, executor }: WithTxParams<T>): Promise<T> {
  return tx ? executor(tx) : db.transaction(executor)
}
