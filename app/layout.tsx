import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GraphZen - Find Your Chart Zen',
  description: 'Create beautiful charts with ease. Import from CSV, Excel, or paste data directly. Professional data visualization made simple.',
  generator: 'GraphZen',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
