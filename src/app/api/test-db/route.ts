import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        console.log('Testing database connection...')
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
        console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL)
        
        // Try different connection approaches
        let userCount = 0
        let connectionMethod = 'default'
        
        try {
            // Try with default prisma client
            userCount = await prisma.user.count()
            connectionMethod = 'default-prisma'
        } catch (defaultError: any) {
            console.log('Default connection failed, trying fresh client...')
            
            try {
                // Try with fresh Prisma client
                const freshPrisma = new PrismaClient({
                    datasources: {
                        db: {
                            url: process.env.DATABASE_URL
                        }
                    }
                })
                userCount = await freshPrisma.user.count()
                connectionMethod = 'fresh-prisma'
                await freshPrisma.$disconnect()
            } catch (freshError: any) {
                console.log('Fresh client also failed, trying with timeout...')
                
                // Try with timeout
                const timeoutPrisma = new PrismaClient({
                    datasources: {
                        db: {
                            url: process.env.DATABASE_URL
                        }
                    }
                })
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
                )
                
                userCount = await Promise.race([
                    timeoutPrisma.user.count(),
                    timeoutPromise
                ]) as number
                connectionMethod = 'timeout-prisma'
                await timeoutPrisma.$disconnect()
            }
        }
        
        console.log('Database connection successful. User count:', userCount, 'Method:', connectionMethod)
        
        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            userCount,
            connectionMethod,
            envVars: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasDirectUrl: !!process.env.DIRECT_URL,
                databaseUrlLength: process.env.DATABASE_URL?.length || 0
            },
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Database connection test failed:', error)
        
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            name: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            envVars: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasDirectUrl: !!process.env.DIRECT_URL,
                databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...',
                nodeEnv: process.env.NODE_ENV
            },
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
