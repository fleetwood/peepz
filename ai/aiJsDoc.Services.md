**IMPORTANT RULE:** When documenting Service methods, we need to track how the db is being used, and make sure the method adheres to local scope only

# JSDOC Rules:

**ADD JSDOC COMMENTS DIRECTLY TO THE SOURCE CODE FUNCTIONS - DO NOT CREATE SEPARATE DOCUMENTATION FILES**

**VIOLATIONS should be marked with `❌ VIOLATION`**
**CLEAN methods should be marked with `✅ CLEAN`**
**WARNINGS should be marked with `❗ WARNING`**

Use standard JSDoc comment syntax (/** ... */) with md formatting above each function. Use @link to link to external files or type definitions.

For the documentation operation, you may ignore the 50 LOC restriction. Documentation needs to be comprehensive, not brief.

1. Explain specifically what the method does
2. List in order of execution the db operations being performed: SELECT, INSERT, UPDATE, DELETE
    - For optional calls: italicize and proceed with "?"
    - For calls in a loop: bold and proceed with "!"
    - Only for the immediate scope of the function (do NOT include delegations)
    - Call out any string literals that should be converted to enums (see [ai/style-guide.md](./style-guide.md))
3. List all external calls being made (use @link)
4. List all params
5. Include dbScope:
    - Total number of db calls being made
    - Total number of db tables interacted with
    - **VIOLATION**: Flag if method directly modifies tables outside its domain
        - Example: FooService should only modify `foo` and `foo_derivative` tables
        - If FooService directly modifies `bar` table → SCOPE VIOLATION (should delegate to BarService)
        - External service calls are OK, direct table access outside domain is NOT
6. **WARNING**: Flag any method >50 lines of code
7. **VIOLATION**: Flag any string literals that should be converted to enums (see [ai/style-guide.md](./style-guide.md))
8. **VIOLATION**: exported types should be moved to `packages/types` and barrel-exported from there
9. **WARNING**: Complex inline parameters or returns should use named types
   - EXAMPLE: 
   ```typescript
   static async doSomeFooThing(params: { fooId: string; bar: string; baz: string; buzz: string; tx?: Transaction }): Promise<FooResult<{ foobar: string; buzzBooBar: Date }>>
   ```

## EXAMPLE:
   /**
    * Creates a new resource with optional related entity association.
    * 
    * Manages transaction internally to ensure atomic creation.
    * Special cases must use specialized creation methods.
    * 
    * Database Operations:
    * - INSERT: main_table (create primary resource)
    * - *?UPDATE: main_table (link related entity if provided)*
    * - **!SELECT: related_table (fetch related data in loop)**
    * 
    * External Calls:
    * - {@link RelatedService.upsert} (creates/links related entity if provided)
    * 
    * @param params - {@link CreateResourceParams} resource creation data
    * @returns The created resource record
    * @throws Error if validation fails
    * @throws Error if insertion fails
    
    * DB SCOPE: 
        - calls: 3 + N (N+1 in loop)
        - tables: 2 (main_table, related_table)
        - scope: ✅ clean (delegates related_table operations to RelatedService, no string literals)
    */