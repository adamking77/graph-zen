import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''

  // Production: graph-zen.app → landing page
  if (hostname === 'graph-zen.app' || hostname.startsWith('graph-zen.app:')) {
    redirect('/landing')
  }

  // Production: charts.graph-zen.app → chart maker
  if (hostname === 'charts.graph-zen.app' || hostname.startsWith('charts.graph-zen.app:')) {
    redirect('/app')
  }

  // Localhost: default to app for convenience
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    redirect('/app')
  }

  // Fallback: redirect to app
  redirect('/app')
}
