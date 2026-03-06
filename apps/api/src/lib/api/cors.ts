/**
 * Standard CORS headers for all API routes
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-peeps-api-key',
  'Access-Control-Allow-Credentials': 'true',
} as const

/**
 * Standard OPTIONS handler for CORS preflight requests.
 * Export this from every API route file to handle CORS automatically.
 * 
 * @example
 * ```ts
 * export { handleOPTIONS as OPTIONS } from '@/lib/api/cors'
 * 
 * export async function GET(request: Request) {
 *   // your handler
 * }
 * ```
 */
export async function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  })
}

/**
 * Get CORS headers to add to response
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': CORS_HEADERS['Access-Control-Allow-Origin'],
    'Access-Control-Allow-Credentials': CORS_HEADERS['Access-Control-Allow-Credentials'],
  }
}
