import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MonieMatch — Meet Your Next FundMate',
  description: 'A trusted platform connecting everyday investors with vetted small businesses raising capital to grow.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'MonieMatch — Connecting Capital to Real-World Hustle',
    description: 'A trusted platform connecting everyday investors with vetted small businesses raising capital to grow.',
    url: 'https://www.moniematch.com',
    siteName: 'MonieMatch',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
