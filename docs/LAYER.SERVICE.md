# Service Layer Architecture

## Overview

The Service Layer is the **business logic layer** that sits between API routes and the database. Services handle all data operations, validations, and integration calls.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│  Client Layer (packages/client)         │
│  - QueryManager                          │
│  - TanStack Query hooks                  │
│  - Used by: Web & Mobile apps            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Route Layer (apps/api/app/api/)         │
│  - Validate API key                      │
│  - Check user session                    │
│  - Call Service                          │
│  - Return response                       │
│  - NO business logic                     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Service Layer (packages/services)       │
│  - Business logic                        │
│  - Database calls                        │
│  - Integration calls                     │
│  - Data validation                       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Database Layer                          │
│  - Drizzle ORM                           │
│  - Supabase PostgreSQL                   │
└─────────────────────────────────────────┘
```

## Service Types

### Entity Services (`packages/services/src/entities/`)

One service per database table following the **Entity Pattern**:

- `PersonService` - Person CRUD and relationships
- `GroupService` - Group management
- `MemberService` - Group membership
- `PostService` - Post creation and management
- `AlbumService` - Photo album management
- `EventService` - Event management
- `MessageService` - Messaging
- `NotificationService` - Notifications

### Integration Services (`packages/services/src/integrations/`)

One service per external integration:

- `RedisService` - Caching operations
- `ResendService` - Email sending
- `CloudinaryService` - Media upload/management
- `SupabaseService` - Auth operations

## Service Pattern

### Entity Service Example

```typescript
// packages/services/src/entities/PersonService.ts
import { ServiceResult } from '@peeps/types/response/response.types'
import { db } from '@/server/db'
import { persons } from '@/server/db/schema'

export class PersonService {
  /**
   * Get person by ID
   * @param id - Person UUID
   * @returns ServiceResult with person data
   */
  static async getById(id: string): Promise<ServiceResult<Person>> {
    try {
      const person = await db.query.persons.findFirst({
        where: eq(persons.id, id)
      })

      if (!person) {
        return {
          success: false,
          error: 'Person not found'
        }
      }

      return {
        success: true,
        data: person
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Create new person
   */
  static async create(data: CreatePersonInput): Promise<ServiceResult<Person>> {
    try {
      // Business logic here
      const person = await db.insert(persons).values(data).returning()
      
      return {
        success: true,
        data: person[0]
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Update person
   */
  static async update(id: string, data: UpdatePersonInput): Promise<ServiceResult<Person>> {
    try {
      // Business logic here
      const person = await db
        .update(persons)
        .set(data)
        .where(eq(persons.id, id))
        .returning()

      return {
        success: true,
        data: person[0]
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Delete person
   */
  static async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await db.delete(persons).where(eq(persons.id, id))
      
      return {
        success: true,
        data: undefined
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}
```

### Integration Service Example

```typescript
// packages/services/src/integrations/ResendService.ts
import { Resend } from 'resend'
import { ServiceResult } from '@peeps/types/response/response.types'
import { serverEnv } from '@peeps/config/env'

const resend = new Resend(serverEnv.RESEND_API_KEY)

export class ResendService {
  /**
   * Send email
   */
  static async sendEmail(params: {
    to: string
    subject: string
    html: string
  }): Promise<ServiceResult<{ id: string }>> {
    try {
      const result = await resend.emails.send({
        from: 'Peeps <noreply@peeps.app>',
        to: params.to,
        subject: params.subject,
        html: params.html
      })

      return {
        success: true,
        data: { id: result.id }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email: string, name: string): Promise<ServiceResult<void>> {
    const html = `<h1>Welcome to Peeps, ${name}!</h1>`
    
    const result = await this.sendEmail({
      to: email,
      subject: 'Welcome to Peeps',
      html
    })

    return result.success 
      ? { success: true, data: undefined }
      : result
  }
}
```

## Route Pattern

Routes **only** handle validation and call services. No business logic.

```typescript
// apps/web/app/api/persons/[id]/route.ts
import { PersonService } from '@peeps/services'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const routeParams = await params
  const person = await PersonService.byId({ id: routeParams.id })

  if (!person) {
    return new Response(null, { status: 404 })
  }

  return Response.json(person)
}
```

## Client Pattern

Clients use QueryManager to call routes.

```typescript
// packages/client/src/PersonClient.ts
import { QueryManager } from './QueryManager'

export const usePersonDetail = (personId: string) => {
  return QueryManager.domainQuery({
    queryFn: () => fetch(`/api/persons/${personId}`).then(r => r.json()),
    enabled: !!personId
  })
}

export const useCreatePerson = () => {
  return useMutation({
    mutationFn: (data) => fetch('/api/persons', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      // Invalidate queries
      PersonInvalidation.invalidatePersonList()
    }
  })
}
```

## Rules

### Routes MUST:
- ✅ Validate input with Zod
- ✅ Check authentication/authorization
- ✅ Call Service methods
- ✅ Return ServiceResult or throw errors
- ❌ NO database calls
- ❌ NO business logic
- ❌ NO integration calls

### Services MUST:
- ✅ Handle all business logic
- ✅ Make database calls
- ✅ Call other services if needed
- ✅ Return ServiceResult type
- ✅ Handle errors gracefully
- ❌ NO HTTP/request handling
- ❌ NO authentication checks (routes do this)

### Clients MUST:
- ✅ Use QueryManager for caching
- ✅ Call REST routes
- ✅ Handle loading/error states
- ❌ NO direct service calls
- ❌ NO direct database access

## Benefits

1. **Separation of Concerns** - Each layer has one responsibility
2. **Testability** - Services can be tested independently
3. **Reusability** - Services can be called from routes or Server Actions
4. **Consistency** - Same patterns across all entities
5. **Type Safety** - End-to-end TypeScript types
6. **Maintainability** - Easy to find and modify logic
