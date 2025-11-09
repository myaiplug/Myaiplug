import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'MyAiPlug™ NoDAW — Professional AI Audio Tools',
  description: 'Transform your audio with studio-grade AI tools. ScrewAI, HalfScrew, StemSplit and more. Plug in. Create. Release. Collect.',
  keywords: ['AI audio', 'audio tools', 'DAWless', 'music production', 'MyAiPlug', 'NoDAW'],
  authors: [{ name: 'MyAiPlug', url: 'https://myaiplug.com' }],
  openGraph: {
    title: 'MyAiPlug™ NoDAW — Professional AI Audio Tools',
    description: 'Transform your audio with studio-grade AI tools. Plug in. Create. Release. Collect.',
    url: 'https://myaiplug.com',
    siteName: 'MyAiPlug',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyAiPlug™ NoDAW',
    description: 'Professional AI Audio Tools',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
