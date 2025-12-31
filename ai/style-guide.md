# Peeps Coding Standards

## Overview
This document defines coding standards and conventions for the Peeps project.

---

**STYLE RULES:**
- Prefer ternary operations for simple one-line conditions. 
- Use Column Alignment.
- When a function or definition is exported, it must use named types.
- Use Column Alignment
- When a function or definition is exported, it must reside in a standalone (e.g., types) file.
- Use Column Alignment
- Never comment at the end of a line. Comments go ABOVE the line.
- Use Column Alignment
- Other than the default component, never export types or functions from components.
    ```

    // ExampleComponent.tsx
    export default IntervalSelector

    import { Logger } from '@/lib/util.logger'

    const logger = Logger.instance('ExampleComponent') // default is false (empty param)
    // const logger = Logger.instance('ExampleComponent', true) // or set to true to turn on logging for this component

    export type ExampleComponentProps = {
        
    }

    const ExampleComponent = (props:ExampleComponentProps) => {
        logger.debug('ExampleComponent', props) // logging example, uses ...args similar to console
        return (
            <>
            </>
        )
    }

    ExampleComponent.displayName = "ExampleComponent"
    export default ExampleComponent
    ```
- If shared functionality is needed, check the `utils` folder for existing utils. Confirm before creating a new utils.
- In components, use the following order for declarations and logic:
  - imports
  - types
    Inside component function:
    - constants
    - component state
    - variables
    - functions
    - useEffect
    - render

- Enums are always UPPERCASE and always have Enum in their name!
  ...
  // INCORRECT
  export enum Foo { <-- WRONG!!!
    /**
    * #### FOO
    * Describe the foo
    */
    FOO = 'foo' <-- WRONG!!!
  }

  // CORRECT
  export enum FooTypeEnum {
    /**
    * #### FOO
    * Describe the foo
    */
    FOO = 'FOO'
  }

## TypeScript

### Enums

**All enum values MUST use matching uppercase values.**

```typescript
// ✅ GOOD
export enum StatusEnum {
  ACTIVE   = 'ACTIVE',
  PENDING  = 'PENDING',
  REJECTED = 'REJECTED',
}

export enum MessageTypeEnum {
  TEXT  = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

// ❌ BAD
export enum Status {
  ACTIVE   = 'active',        // lowercase value
  PENDING  = 'PENDING:NEW',   // contains separator
  REJECTED = 'rejected:old',  // lowercase with separator
}
```

**Rationale:**
- Consistency across codebase
- Easy to identify enum values in logs/debugging
- Prevents confusion between enum keys and values
- Database storage uses uppercase values
- API responses use uppercase values

### String Literals

**❌ DO NOT use string literals for comparisons, conditions, or persistence.**
**ALWAYS prefer Enum, Type, or Const.**

```typescript
// ❌ BAD - string literals
if (status === 'pending') { }
await db.insert(requests).values({ status: 'pending' });
await notifyUser(userId, { type: 'family_join_request' });

// ✅ GOOD - enums
if (status === RequestStatusEnum.PENDING) { }
await db.insert(requests).values({ status: RequestStatusEnum.PENDING });
await notifyUser(userId, { type: NotificationTypeEnum.FAMILY_JOIN_REQUEST });

// ✅ GOOD - const for one-off values
const NOTIFICATION_TYPES = {
  FAMILY_JOIN_REQUEST: 'FAMILY_JOIN_REQUEST',
  ADMIN_APPOINTMENT: 'ADMIN_APPOINTMENT',
} as const;

await notifyUser(userId, { 
  type: NOTIFICATION_TYPES.FAMILY_JOIN_REQUEST 
});
```

**Rationale:**
- Type safety - catch typos at compile time
- Refactoring - change value in one place
- Autocomplete - IDE suggests valid values
- Documentation - enum shows all possible values
- Prevents magic strings throughout codebase

### Types vs Interfaces

**Prefer `type` over `interface` where possible.**

```typescript
// ✅ GOOD
type User = {
  id: string;
  name: string;
};

// ⚠️ Use interface only when extending is needed
interface BaseEntity {
  id: string;
  createdAt: Date;
}

interface User extends BaseEntity {
  name: string;
}
```

---

## React

### useEffect

**Avoid `useEffect` whenever possible.**

```typescript
// ❌ BAD - unnecessary useEffect
const [count, setCount] = useState(0);
const [doubled, setDoubled] = useState(0);

useEffect(() => {
  setDoubled(count * 2);
}, [count]);

// ✅ GOOD - derived state
const [count, setCount] = useState(0);
const doubled = count * 2;
```

```typescript
// ❌ BAD - useEffect for data fetching
useEffect(() => {
  fetchData().then(setData);
}, []);

// ✅ GOOD - use Tanstack Query
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});
```

**Only use `useEffect` when:**
- Synchronizing with external systems (WebSocket, DOM manipulation)
- Setting up subscriptions
- Truly unavoidable side effects

---

## Code Style

### Alignment

**Use columnar alignment for improved readability.**

```typescript
// ✅ GOOD
const user = {
  id        : 'abc123',
  firstName : 'John',
  lastName  : 'Doe',
  email     : 'john@example.com',
};

// ❌ BAD
const user = {
  id: 'abc123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
};
```

### Comments

**Don't add comments that restate what the code does.**

```typescript
// ❌ BAD
// Set the user name
setUserName(name);

// Increment counter
counter++;

// ✅ GOOD
// Normalize phone number to E.164 format for Twilio API
const normalizedPhone = normalizePhoneNumber(phone);

// Retry failed uploads after 5 seconds to handle transient network errors
setTimeout(() => retryUpload(), 5000);
```

**Don't add comments at the end of lines.**

```typescript
// ❌ BAD
const MAX_RETRIES = 3; // Maximum number of retries

// ✅ GOOD
// Maximum number of retries before giving up
const MAX_RETRIES = 3;
```

---

## File Organization

### One File at a Time

**Focus on one file at a time during development.**
- Complete changes to current file before moving to next
- Avoid jumping between multiple files
- Reduces context switching and errors

### Minimal Changes

**Never modify more than 2 files without approval.**
**Never modify more than 50 lines of code at a time.**
- Start with simplest possible solution
- Break large changes into smaller increments
- Request approval for complex features

---

## Package Management

**Use `pnpm` not `npm`.**

```bash
# ✅ GOOD
pnpm install
pnpm add lodash
pnpm run dev

# ❌ BAD
npm install
npm install lodash
npm run dev
```

---

## Development Workflow

### Hot Reload

**Don't recommend restarting dev server unless necessary.**
- Next.js hot reload picks up most changes automatically
- Only restart for:
  - Environment variable changes
  - Next.js config changes
  - Package installations
  - Build errors that won't clear

### Implementation

**Implement only what is explicitly requested.**
- Don't add features not asked for
- Don't predict future requirements
- Don't create nested component hierarchies without approval
- Ask for confirmation before implementing complex features

---

## Models & Data

### Model Location

**ALL models go in `model.md`.**
- Never define models in documentation files
- Reference models from `model.md` in other documents
- Keep single source of truth for data structures

### Base Model Inheritance

**All models extend Base.**
- Every model inherits: `id`, `createdAt`, `updatedAt`, `visible`
- Don't repeat these fields in model definitions
- Use `extends Base` syntax

```typescript
// ✅ GOOD
#### User
extends Base {
  email    : string
  firstName: string
  lastName : string
}

// ❌ BAD
#### User
{
  id       : uuid
  createdAt: timestamp
  updatedAt: timestamp
  visible  : boolean
  email    : string
  firstName: string
  lastName : string
}
```

---

## Business Logic

### No Negative Labels

**Never use negative status labels.**
- No "divorced", "estranged", "banned", "suspended"
- Simply remove relationships or memberships
- Use soft deletes (`visible: false`)
- Preserve historical data without stigmatization

```typescript
// ❌ BAD
status: enum (active, banned, suspended, divorced)

// ✅ GOOD
status: enum (active, pending)
// Removed users: visible = false
```

---

## Git & Version Control

### Commit Messages

**Use conventional commit format:**

```
feat: add user profile page
fix: resolve authentication bug
docs: update API documentation
refactor: simplify voting logic
test: add media deletion tests
```

### Branch Strategy

**Use feature branches:**
- `main` - production
- `develop` - development
- `feature/feature-name` - new features
- `fix/bug-name` - bug fixes

---

## Testing

### Test Coverage

**Prioritize testing:**
- Business logic functions
- API endpoints
- Authentication/authorization
- Payment flows
- Data validation

**Lower priority:**
- UI components (test manually)
- Simple getters/setters
- Configuration files

---

## Documentation

### Code Documentation

**Document WHY, not WHAT:**
- Explain business logic reasoning
- Document edge cases
- Explain non-obvious decisions
- Link to related issues/tickets

### API Documentation

**Use JSDoc for public APIs:**

```typescript
/**
 * Removes a user from a family group.
 * Follows the family's governance model for approval.
 * 
 * @param userId - ID of user to remove
 * @param groupId - ID of family group
 * @returns RemovalRequest with voting status
 * @throws Error if user is not in group
 */
export async function removeUserFromGroup(
  userId: string,
  groupId: string
): Promise<RemovalRequest> {
  // implementation
}
```

---

## Performance

### Database Queries

**Optimize queries:**
- Use indexes on foreign keys
- Paginate all lists
- Use `select` to limit columns
- Avoid N+1 queries

### Caching

**Cache strategically:**
- User profiles (5 minutes)
- Group memberships (10 minutes)
- Static content (1 hour)
- Don't cache real-time data

---

## Security

### Input Validation

**Validate all inputs:**
- Use Zod schemas
- Validate on both client and server
- Sanitize user-generated content
- Escape HTML in user input

### Authentication

**Protect all routes:**
- Verify JWT on every request
- Check permissions before data access
- Use role-based access control
- Log authentication failures

---

## Error Handling

### User-Facing Errors

**Provide helpful error messages:**

```typescript
// ❌ BAD
throw new Error('Invalid input');

// ✅ GOOD
throw new Error('Email address is required and must be valid');
```

### Logging

**Log appropriately:**
- ERROR: System failures, exceptions
- WARN: Recoverable issues, deprecated usage
- INFO: Important state changes
- DEBUG: Detailed debugging info (dev only)

---

## Accessibility

### ARIA Labels

**Add ARIA labels for screen readers:**

```tsx
<button aria-label="Delete message">
  <TrashIcon />
</button>
```

### Keyboard Navigation

**Support keyboard navigation:**
- Tab order makes sense
- Enter/Space activate buttons
- Escape closes modals
- Arrow keys navigate lists

---

## Mobile Development

### React Native

**Follow platform conventions:**
- Use platform-specific components when needed
- Test on both iOS and Android
- Handle safe areas properly
- Optimize images for mobile

### Responsive Design

**Design mobile-first:**
- Start with mobile layout
- Enhance for tablet/desktop
- Use responsive breakpoints
- Test on real devices

---

## AI Development Rules

### File Editing

**Follow these rules when AI assists with development:**
- Do not edit files other than the one currently being worked on
- Do not try to predict what the user will ask next
- If more than 2 attempts fail, pause and ask for guidance
- Implement only what is explicitly requested
- Use Column Alignment