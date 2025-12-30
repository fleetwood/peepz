import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

type DbClient = ReturnType<typeof postgres>
type Db       = ReturnType<typeof drizzle<typeof schema>>

declare global {
  // eslint-disable-next-line no-var
  var __peepsDbClient: DbClient | undefined
  // eslint-disable-next-line no-var
  var __peepsDb: Db | undefined
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Missing required environment variable: DATABASE_URL')
  return url
}

export const client = globalThis.__peepsDbClient ?? postgres(getDatabaseUrl())
export const db = globalThis.__peepsDb ?? drizzle(client, { schema })

globalThis.__peepsDbClient = client
globalThis.__peepsDb = db

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type WithTxExecutor<T> = (trx: Transaction) => Promise<T>

export type WithTxParams<T> = {
  tx      ?: Transaction
  executor: WithTxExecutor<T>
}

export async function runWithTx<T>({ tx, executor }: WithTxParams<T>): Promise<T> {
  return tx ? executor(tx) : db.transaction(executor)
}

export type TxOptions = {
  tx?: Transaction
}

export type WithTx<TParams> = TParams & TxOptions

export function withTx(
  _target: unknown,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
): void {
  const original = descriptor.value as (...args: unknown[]) => Promise<unknown>

  descriptor.value = async function (params?: unknown) {
    const rawParams = (params && typeof params === 'object') ? (params as Record<string, unknown>) : {}
    const tx = rawParams.tx as Transaction | undefined
    const cleanParams = { ...rawParams }

    delete cleanParams.tx

    return runWithTx({
      tx,
      executor: (trx) => original.call(this, { ...cleanParams, trx }),
    })
  }
}
