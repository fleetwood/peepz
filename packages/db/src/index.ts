import { client, db } from './client'

// Database client and schema exports
export { db, client }
export * from './schema'
export {
  runWithTx,
  withTx,
} from './client'

// Inferred types from Drizzle schema
// These will be available after schema is defined
// Example:
// export type Person = typeof persons.$inferSelect
// export type NewPerson = typeof persons.$inferInsert
