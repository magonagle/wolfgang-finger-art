import type { Metadata } from 'next'
import { Bodoni_Moda, DM_Sans } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { CartProvider } from '@/context/cart'
import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Wolfgang Finger — Artist',
    template: '%s | Wolfgang Finger',
  },
  description: 'Original paintings, sculpture, and flamework art by Wolfgang Finger.',
  openGraph: {
    siteName: 'Wolfgang Finger',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${dmSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
