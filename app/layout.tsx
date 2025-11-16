import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export const metadata: Metadata = {
  metadataBase: new URL('https://myaiplug.com'),
  title: {
    default: 'MyAiPlug™ — Professional AI Audio Tools for Creators',
    template: '%s | MyAiPlug™'
  },
  description: 'Transform your audio with studio-grade AI tools. ScrewAI, HalfScrew, StemSplit, and more. Professional audio processing, stem splitting, video creation, and content automation for modern creators. Plug in. Create. Release. Collect.',
  keywords: [
    'AI audio tools',
    'stem splitting',
    'audio separation',
    'music production',
    'video processing',
    'content automation',
    'creator tools',
    'AI music tools',
    'audio effects',
    'vocal isolation',
    'instrumental extraction',
    'DAWless production',
    'MyAiPlug',
    'ScrewAI',
    'HalfScrew',
    'online audio processor',
    'AI-powered mixing',
    'social content creation'
  ],
  authors: [{ name: 'MyAiPlug', url: 'https://myaiplug.com' }],
  creator: 'MyAiPlug',
  publisher: 'MyAiPlug',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myaiplug.com',
    siteName: 'MyAiPlug',
    title: 'MyAiPlug™ — Professional AI Audio Tools for Creators',
    description: 'Transform your audio with studio-grade AI tools. Stem splitting, audio effects, video processing, and content automation. Plug in. Create. Release. Collect.',
    images: [
      {
        url: '/assets/hero-image.png',
        width: 1200,
        height: 630,
        alt: 'MyAiPlug - Professional AI Audio Tools',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyAiPlug™ — Professional AI Audio Tools',
    description: 'Studio-grade AI audio processing, stem splitting, and content creation tools for modern creators',
    images: ['/assets/hero-image.png'],
    creator: '@myaiplug',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://myaiplug.com',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
