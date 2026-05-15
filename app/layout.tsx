import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MonieMatch — Meet Your Next FundMate',
  description: 'MonieMatch matches Investors with small but already-profitable businesses and facilitates win-win deals for both parties.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'MonieMatch — Meet Your Next FundMate',
    description: 'MonieMatch matches Investors with small but already-profitable businesses and facilitates win-win deals.',
    url: 'https://www.moniematch.com',
    siteName: 'MonieMatch',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
