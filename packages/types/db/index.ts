type TxOptions = {
  tx?: any // Transaction type from drizzle
}

export type WithTx<TParams> = TParams & TxOptions
