import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const hostname = headersList.get('host') || ''

  // On production main domain, redirect to landing page
  if (hostname === 'graph-zen.app') {
    redirect('/landing')
  }

  // On localhost or charts subdomain, redirect to app
  redirect('/app')
}
