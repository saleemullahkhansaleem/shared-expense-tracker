import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Test database connection
        await prisma.$connect()

        return NextResponse.json({
            message: 'Database connection successful',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Database connection error:', error)
        return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}
