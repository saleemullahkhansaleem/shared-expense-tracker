import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log('Testing database connection...')

        // Test database connection
        const userCount = await prisma.user.count()
        console.log('Database connection successful. User count:', userCount)

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            userCount,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Database connection test failed:', error)

        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
