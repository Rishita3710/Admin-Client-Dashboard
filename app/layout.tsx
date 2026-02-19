import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'TaskFlow — Client Task Dashboard',
  description: 'Financial-grade client task management with role-based access control',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              border: '1px solid #e0effe',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(12,132,234,0.12)',
              fontFamily: 'DM Sans, system-ui, sans-serif',
            },
            success: {
              iconTheme: { primary: '#0c84ea', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
