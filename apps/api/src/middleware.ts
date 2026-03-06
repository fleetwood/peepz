import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE CALLED ===')
  console.log('Method:', request.method)
  console.log('URL:', request.url)
  console.log('Path:', request.nextUrl.pathname)
  console.log('Headers:', Object.fromEntries(request.headers.entries()))
  console.log('========================')
  
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log('API route detected:', request.method, request.url)
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight')
      const response = new Response(null, { status: 200 })
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      console.log('OPTIONS response sent')
      return response
    }
    
    // For actual requests, add CORS headers and continue
    console.log('Adding CORS headers to:', request.method)
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    
    console.log('CORS headers added for:', request.method)
    return response
  }
  
  console.log('Non-API route, passing through')
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
