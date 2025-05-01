import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KIRII Project Gantt Chart',
  description: 'A simple Gantt chart for project management',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer style={{width: '100%', marginTop: '40px', padding: '16px 0', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '1.1rem', color: '#222'}}>
          Copyright © Kirii (Hong Kong) Limited. All Rights Reserved.
        </footer>
        <Toaster />
      </body>
    </html>
  )
}
