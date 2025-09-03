import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Shared Expense Tracker',
    description: 'Track monthly contributions, expenses, and settlements with friends',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProvider>
                    {children}
                </SessionProvider>
            </body>
        </html>
    )
}
