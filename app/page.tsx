import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect to app by default for localhost convenience
  redirect('/app')
}
