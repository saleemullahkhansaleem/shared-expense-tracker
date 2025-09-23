import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
    const baseUrl = `postgresql://postgres:3319282306@db.mbwpvodwjsjgkuyohzne.supabase.co`

    const connectionStrings = [
        // Original pooled connection
        `${baseUrl}:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1`,
        // Without connection_limit
        `${baseUrl}:6543/postgres?pgbouncer=true&sslmode=require`,
        // Without pgbouncer
        `${baseUrl}:6543/postgres?sslmode=require`,
        // Direct connection on 5432
        `${baseUrl}:5432/postgres?sslmode=require`,
        // With schema parameter
        `${baseUrl}:6543/postgres?pgbouncer=true&sslmode=require&schema=public`,
        // IPv4 connection pooler
        `${baseUrl}:6543/postgres?pgbouncer=true&sslmode=require&connect_timeout=10`,
    ]

    const results = []

    for (let i = 0; i < connectionStrings.length; i++) {
        const connectionString = connectionStrings[i]
        let result = {
            index: i + 1,
            connectionString: connectionString.replace('3319282306', '***'),
            success: false,
            error: null as any,
            userCount: 0,
            timing: 0
        }

        try {
            console.log(`Testing connection ${i + 1}:`, connectionString.replace('3319282306', '***'))
            const startTime = Date.now()

            const prisma = new PrismaClient({
                datasources: {
                    db: {
                        url: connectionString
                    }
                }
            })

            // Set a timeout for each connection attempt
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Connection timeout after 15s')), 15000)
            )

            const userCount = await Promise.race([
                prisma.user.count(),
                timeoutPromise
            ]) as number

            await prisma.$disconnect()

            result.success = true
            result.userCount = userCount
            result.timing = Date.now() - startTime

            console.log(`Connection ${i + 1} successful! Users: ${userCount}, Time: ${result.timing}ms`)

            // If we found a working connection, we can break early
            results.push(result)
            break

        } catch (error: any) {
            console.log(`Connection ${i + 1} failed:`, error.message)
            result.error = {
                message: error.message,
                code: error.code,
                name: error.name
            }
            result.timing = Date.now() - (Date.now() - 15000)
        }

        results.push(result)
    }

    const workingConnection = results.find(r => r.success)

    return NextResponse.json({
        success: !!workingConnection,
        message: workingConnection
            ? `Found working connection (option ${workingConnection.index})`
            : 'No working connections found',
        workingConnection,
        allResults: results,
        timestamp: new Date().toISOString()
    }, {
        status: workingConnection ? 200 : 500
    })
}
