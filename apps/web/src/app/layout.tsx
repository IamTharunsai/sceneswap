import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/hooks/useToast'

export const metadata: Metadata = {
  title: {
    template: '%s | SceneSwap',
    default: 'SceneSwap — Your Background Pays You',
  },
  description:
    'Upload your video. AI finds the ad surfaces. Brands pay you per view. The marketplace where creator backgrounds earn.',
  keywords: ['creator monetization', 'video advertising', 'brand campaigns', 'CPM', 'earn from content'],
  openGraph: {
    title: 'SceneSwap — Your Background Pays You',
    description: 'AI-powered marketplace where creator backgrounds earn from brand campaigns.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SceneSwap — Your Background Pays You',
    description: 'AI-powered marketplace where creator backgrounds earn from brand campaigns.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  )
}
