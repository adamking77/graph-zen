import type { Metadata } from 'next'
import { Albert_Sans } from 'next/font/google'
import './globals.css'

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-albert',
})

export const metadata: Metadata = {
  title: 'GraphZen - Find Your Chart Zen',
  description: 'Create beautiful charts with ease. Import from CSV, Excel, or paste data directly. Professional data visualization made simple.',
  generator: 'GraphZen',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#475569"/>
                <stop offset="100%" style="stop-color:#334155"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="16" fill="url(#bg)"/>
            <circle cx="16" cy="16" r="8" stroke="white" fill="none"/>
            <line x1="4" y1="16" x2="28" y2="16" stroke="white"/>
          </svg>
        `),
        type: 'image/svg+xml',
      }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${albertSans.variable} font-albert`} suppressHydrationWarning>{children}</body>
    </html>
  )
}
