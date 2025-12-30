/**
 * Parameters for paginated requests
 * @template T - Type of data being paginated
 * @example
 * // Request the next page with a cursor and limit
 * const params: PaginationParams = {
 *   cursor: 'eyJpZCI6IjEyMyJ9',
 *   limit : 20,
 * }
 */
export type PaginationParams = {
  /** Cursor for the next page (null/undefined means first page) */
  cursor?: string | null
  /** Number of items per page */
  limit  : number
}

/**
 * Standard response format for paginated data
 * @template T - Type of items in the data array
 * @property {T[]} items - Array of paginated items
 * @property {object} pageInfo - Pagination metadata for TanStack Query
 * @example
 * // Response with posts data
 * const response: PaginatedResponse<Post> = {
 *   items: [post1, post2],
 *   pageInfo: {
 *     nextCursor : 'eyJpZCI6IjEyMyJ9',
 *     hasNextPage: true,
 *   },
 * }
 */
export type PaginatedResponse<T = any> = {
  items   : T[]
  pageInfo: {
    nextCursor : string | null
    hasNextPage: boolean
  }
}
