# @peeps/db

Database schema and inferred types for the Peeps application.

## Purpose

This package contains:
- **Drizzle ORM schema definitions** - The source of truth for database structure
- **Database client** - Configured Drizzle client for database operations
- **Inferred types** - TypeScript types automatically generated from schema

## vs @peeps/types

**Important distinction:**

- **`@peeps/db`** - Database-level types inferred from Drizzle schema
  - Example: `Person`, `NewPerson` (from `persons` table schema)
  - Used by: Services layer for database operations
  - Source: Drizzle `$inferSelect` and `$inferInsert`

- **`@peeps/types`** - Application-level type definitions
  - Example: `PersonDTO`, `CreatePersonInput`, `UpdatePersonInput`
  - Used by: Routes, clients, UI components
  - Source: Manual TypeScript definitions and Zod schemas

## Structure

```
packages/db/
├── src/
│   ├── schema/
│   │   ├── persons.ts       # Person table schema
│   │   ├── groups.ts        # Group table schema
│   │   ├── members.ts       # Member table schema
│   │   └── index.ts         # Export all schemas
│   ├── client.ts            # Drizzle client configuration
│   └── index.ts             # Main exports
├── drizzle/                 # Generated migrations
├── drizzle.config.ts        # Drizzle Kit configuration
└── package.json
```

## Usage

### In Services

```typescript
// packages/services/src/entities/PersonService.ts
import { db } from '@peeps/db'
import { persons } from '@peeps/db/schema'
import type { Person, NewPerson } from '@peeps/db'

export class PersonService {
  static async getById(id: string): Promise<Person | null> {
    return await db.query.persons.findFirst({
      where: eq(persons.id, id)
    })
  }

  static async create(data: NewPerson): Promise<Person> {
    const [person] = await db.insert(persons).values(data).returning()
    return person
  }
}
```

### Schema Definition Example

```typescript
// packages/db/src/schema/persons.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

export const persons = pgTable('persons', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Inferred types (exported from src/index.ts)
export type Person = typeof persons.$inferSelect
export type NewPerson = typeof persons.$inferInsert
```

## Scripts

```bash
# Generate migrations from schema changes
pnpm --filter=@peeps/db db:generate

# Push schema changes to database
pnpm --filter=@peeps/db db:push

# Open Drizzle Studio (database GUI)
pnpm --filter=@peeps/db db:studio

# Run migrations
pnpm --filter=@peeps/db db:migrate
```

## Environment Variables

Required in `.env.local`:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/[database]
```

For Supabase:
```env
DATABASE_URL=postgresql://postgres.jelwyovbrdrpewjovpxe:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Type Flow

```
Database Schema (Drizzle)
    ↓ $inferSelect / $inferInsert
DB Types (@peeps/db)
    ↓ used by
Services (@peeps/services)
    ↓ transforms to
App Types (@peeps/types)
    ↓ used by
Routes & Clients
```

## Best Practices

1. **Schema is source of truth** - All database structure defined here
2. **Use inferred types in services** - Don't manually define DB types
3. **Transform to app types at service boundary** - Services return app types, not DB types
4. **Keep migrations in version control** - Commit generated migrations
5. **Use Drizzle Studio for inspection** - Visual database exploration
