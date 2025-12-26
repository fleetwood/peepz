/**
 * Parameters for paginated requests
 * @template T - Type of data being paginated
 * @example
 * // Request page 2 with 10 items per page
 * const params: PaginationParams = {
 *   page: 2,
 *   limit: 10
 * }
 */
export type PaginationParams = {
  /** Current page number (1-based) */
  page: number
  /** Number of items per page */
  limit: number
  /** Current offset (calculated as (page-1) * limit) */
  offset?: number
}

/**
 * Standard response format for paginated data
 * @template T - Type of items in the data array
 * @property {T[]} data - Array of paginated items
 * @property {number} page - Current page number (1-based)
 * @property {number} limit - Number of items per page
 * @property {number} total - Total number of items available
 * @property {boolean} hasMore - Whether there are more items available
 * @example
 * // Response with posts data
 * const response: PaginatedResponse<Post> = {
 *   data: [post1, post2],
 *   page: 1,
 *   limit: 10,
 *   total: 45,
 *   hasMore: true
 * }
 */
export type PaginatedResponse<T = any> = {
  data: T[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}
