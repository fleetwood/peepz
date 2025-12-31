**IMPORTANT RULE:** Before creating any new functions, files, or types (including enum values), perform a comprehensive search of the codebase to ensure a similar entity does not already exist.

**IMPORTANT RULE:** DO NOT USE INTERFACES. Use types instead.
- Never export types from components or services. Create/update a types file in packages/types only (barrel-only exports).

**IMPORTANT RULE:** You may not modify more than 2 files without first confirming with the user.
- If the correct fix requires >2 files, STOP and ask for approval.
- Do NOT introduce workaround abstractions to avoid asking for approval.

**IMPORTANT RULE:** USE NAMED TYPES for functions with more than 1 parameter.
## TYPES SINGLE SOURCE OF TRUTH (HARD RULE)

**Intent:** ZERO duplicate type declarations across the repo.

### Definitions
- **Shared type**: any `type`/`enum`/`interface`/`zod infer`/etc that is referenced outside the file it is declared in.
- **Local type**: used only in the declaring file.

### Rules (non-negotiable)
1. ✅ Local-only types may be declared in the file that uses them, but MUST NOT be exported.
2. ❌ If a type is needed by ANY other file, it MUST be moved into `packages/types` and exported from there.
3. ❌ No other package/file may export shared types (including `packages/db`, `packages/services`, `apps/*`, `packages/utils`, etc).
4. ✅ Shared types MUST be imported **BARREL-ONLY** from `@peeps/types`.
5. ❌ Forbidden: deep imports like `@peeps/types/foo/bar` (unless explicitly approved by the user).
6. ✅ If a duplicate type is found, consolidate into ONE canonical type in `packages/types` and update all imports to the `@peeps/types` barrel export.
7. ✅ Before creating any new type, search the codebase to confirm it does not already exist in `packages/types`.

### Enforcement
- If following these rules requires creating a new types file under `packages/types`, you MUST ask for confirmation first (no file creation without approval).

**IMPORTANT RULE:** DO NOT USE console FOR LOGGING. Follow all the logging rules in `util.logger.ts`.

**IMPORTANT RULE:** You may not make any changes to SQL migrations.

**💀💀 CRITICAL DATABASE RULE:** YOU MAY NEVER RUN DRIZZLE COMMANDS, MIGRATIONS, OR ANY DATABASE OPERATIONS. THIS INCLUDES BUT IS NOT LIMITED TO:
- `drizzle-kit migrate`
- `drizzle-kit generate`
- `drizzle-kit push`
- `drizzle-kit studio`
- `drizzle-kit drop`
- ANY command that modifies the database schema or data

**💀💀 SEVERE CONSEQUENCE:** Running database commands could DESTROY PRODUCTION DATA. You are FORBIDDEN from executing any database operations under any circumstances. If a migration or schema change is needed, STOP IMMEDIATELY and ask the user to run it manually.

**💀💀 DATABASE SAFETY PROTOCOL:**
1. Schema changes: Update .ts files only
2. Migration files: NEVER CREATE - USER handles all DB changes through Drizzle
3. Database operations: NEVER - USER ONLY, see rule 2

**💀💀 ABSOLUTE DATABASE PROHIBITION:** 
- ❌ DO NOT create SQL migration files
- ❌ DO NOT run `drizzle-kit` commands
- ❌ DO NOT modify database schema directly
- ❌ DO NOT touch any database-related files except TypeScript schema definitions
- ✅ ONLY update .ts schema files and ask user to handle database changes

**💀💀 IF YOU SEE A DATABASE OPERATION NEEDED:**
1. Update the TypeScript schema file
2. STOP and inform the user: "Schema updated. Please run the migration manually."
3. DO NOT proceed until user confirms database changes are applied 

**💀💀 IMPORTANT RULE:** You may not make any changes to drizzle schema without first confirming with the user. You may only change one schema at a time, and then stop and wait for user to review.

**IMPORTANT RULE:** You may not make any changes to routes without first confirming with the user.

**IMPORTANT RULE:** You may not CREATE or DELETE any files without first confirming with the user. All work must be done within existing `.ts` and `.tsx` files.

**IMPORTANT RULE:** If a file is empty or no longer needed, mark it as deprecated in the file, add a TODO item to remove it, and add it to the `USER FOLLOW-UP REQUIRED` list in the plan file.

**IMPORTANT RULE:** NEVER use inline imports. Unless it requires refactoring, imports should happen once at the top of the file. If an inline import is used, explain why and justify the decision so the user can confirm it is appropriate.

**IMPORTANT RULE:** After completing a step in the plan, you must self-review:
- Ensure your code is concise, DRY, and closely matches the established pattern. 
- Avoid verbose logic, excessive comments, or complex case code.
- There can be no TS errors remaining after self-review.
- There can be no runtime errors remaining after self-review.
- do not use `useEffect`.  instead use 'useLoggedEffect' from '@/lib/util.effect'. (this requires a logger instance.)

**IMPORTANT RULE:** 
READ THE @style-guide.md FILE NEXT