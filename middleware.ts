import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Define your domains
  const mainDomain = 'graph-zen.app'
  const chartsDomain = 'charts.graph-zen.app'

  // For local development
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // Check if this is an embed request
  const isEmbed = url.searchParams.get('embed') === 'true'

  // Handle subdomain routing
  let response: NextResponse

  // Localhost: Rewrite root to /app for convenience, allow direct path access for others
  if (isLocalhost) {
    if (url.pathname === '/' && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
      url.pathname = '/app'
      response = NextResponse.rewrite(url)
    } else {
      response = NextResponse.next()
    }
  }
  // Production: charts.graph-zen.app → serve chart maker app
  else if (hostname === chartsDomain) {
    if (!url.pathname.startsWith('/app') && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
      url.pathname = `/app${url.pathname === '/' ? '' : url.pathname}`
      response = NextResponse.rewrite(url)
    } else {
      response = NextResponse.next()
    }
  }
  // Production: graph-zen.app → serve landing page
  else if (hostname === mainDomain) {
    if (!url.pathname.startsWith('/landing') && !url.pathname.startsWith('/app') && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
      url.pathname = `/landing${url.pathname === '/' ? '' : url.pathname}`
      response = NextResponse.rewrite(url)
    } else {
      response = NextResponse.next()
    }
  }
  // Unknown domain
  else {
    response = NextResponse.next()
  }

  // Add embed-specific headers
  if (isEmbed) {
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set('Content-Security-Policy', "frame-ancestors *")
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin')
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
    response.headers.set('X-Chart-Maker-Hostname', hostname)
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