import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const host = headersList.get('host') || ''

  // Extract hostname without port
  const hostname = host.split(':')[0].toLowerCase()

  // Localhost → app
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    redirect('/app')
  }

  // Charts subdomain → app
  if (hostname === 'charts.graph-zen.app') {
    redirect('/app')
  }

  // Main domain (with or without www) → landing
  if (hostname === 'graph-zen.app' || hostname === 'www.graph-zen.app') {
    redirect('/landing')
  }

  // Vercel preview deployments containing the domain name → landing
  // Handles: graph-zen-git-main-username.vercel.app
  if (hostname.includes('graph-zen') && !hostname.includes('charts')) {
    redirect('/landing')
  }

  // All other cases (Vercel previews, unknown domains) → app as safe fallback
  redirect('/app')
}
