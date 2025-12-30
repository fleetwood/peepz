**IMPORTANT RULE:** When documenting Service methods, we need to track how the db is being used, and make sure the method adheres to local scope only

# JSDOC Rules:

**ADD JSDOC COMMENTS DIRECTLY TO THE SOURCE CODE FUNCTIONS - DO NOT CREATE SEPARATE DOCUMENTATION FILES**

Use standard JSDoc comment syntax (/** ... */) with md formatting above each function. Use @link to link to external files or type definitions.

1. Explain specifically what the method does
2. List in order of execution the db operations being performed: SELECT, INSERT, UPDATE, DELETE
    - For optional calls: italicize and proceed with "?"
    - For calls in a loop: bold and proceed with "!"
    - Only for the immediate scope of the function (do NOT include delegations)
3. List all external calls being made (use @link)
4. List all params
5. Include dbScope:
    - Total number of db calls being made
    - Total number of db tables interacted with
    - **Scope violations**: Flag if method directly modifies tables outside its domain
        - Example: EventService should only modify `writing_events` and `event_participants` tables
        - If EventService directly modifies `hashtags` table → SCOPE VIOLATION (should delegate to HashtagService)
        - External service calls are OK, direct table access outside domain is NOT
6. Flag any method >50 lines of code

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
        - scope: ✅ clean (delegates related_table operations to RelatedService)
    */