import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const host = headersList.get('host') || ''

  // Extract hostname without port
  const hostname = host.split(':')[0].toLowerCase()

  // This page should only handle localhost and Vercel preview deployments
  // Production domains are handled by middleware rewrites

  // Localhost → redirect to /app for convenience
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    redirect('/app')
  }

  // Vercel preview deployments → redirect to /landing
  // Handles: graph-zen-git-main-username.vercel.app
  if (hostname.includes('vercel.app')) {
    if (hostname.includes('charts')) {
      redirect('/app')
    } else {
      redirect('/landing')
    }
  }

  // Fallback for unknown domains → redirect to /app
  redirect('/app')
}
