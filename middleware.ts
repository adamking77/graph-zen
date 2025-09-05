import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Check if this is an embed request
  const isEmbed = request.nextUrl.searchParams.get('embed') === 'true'
  
  if (isEmbed) {
    // Add embed-specific headers
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set('Content-Security-Policy', "frame-ancestors *")
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin')
    
    // Add cache headers for embed content
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
  } else {
    // Regular page headers (more restrictive)
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://*.notion.so https://notion.so https://*.notion.site")
  }

  // Add some debugging headers in development
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Chart-Maker-Mode', isEmbed ? 'embed' : 'normal')
    response.headers.set('X-Chart-Maker-Origin', request.nextUrl.origin)
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}