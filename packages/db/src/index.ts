import { client, db } from './client'

// Database client and schema exports
export { db, client }

// Schema exports (must be first - maps depend on these)
export * from './schema'

// Client utilities
export * from './client'

// Mongo exports
export * from './mongo'

// Maps (depend on schema - import directly to avoid circular deps)
// GovernanceMap: import from '@peeps/db/maps/GovernanceMap'
// GroupPrivacyMap: import from '@peeps/db/maps/GroupPrivacyMap'

// Inferred types from Drizzle schema
// These will be available after schema is defined
// Example:
// export type Person = typeof persons.$inferSelect
// export type NewPerson = typeof persons.$inferInsert
