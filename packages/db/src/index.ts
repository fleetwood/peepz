// Database client and schema exports
export { db, client } from './client'
export * from './schema'

// Inferred types from Drizzle schema
// These will be available after schema is defined
// Example:
// export type Person = typeof persons.$inferSelect
// export type NewPerson = typeof persons.$inferInsert
