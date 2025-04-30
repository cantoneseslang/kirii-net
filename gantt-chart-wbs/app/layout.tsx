import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}
        <footer style={{width: '100%', marginTop: '40px', padding: '16px 0', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '1.1rem', color: '#222'}}>
          Copyright © Kirii (Hong Kong) Limited. All Rights Reserved.
        </footer>
      </body>
    </html>
  )
}
