import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const isAdmin = (session?.user as any)?.role === 'ADMIN'

        // Admins can see all categories, regular users only see active ones
        const categories = await prisma.category.findMany({
            where: isAdmin ? undefined : { isActive: true },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json(categories)
    } catch (error: any) {
        console.error('Error fetching categories:', error)
        console.error('Error details:', {
            code: error.code,
            name: error.name,
            message: error.message,
            meta: error.meta,
        })

        // Handle Prisma errors
        if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
            return NextResponse.json(
                { error: 'Database connection failed. Please check your connection.' },
                { status: 503 }
            )
        }

        // Check for common Prisma errors
        if (error.code === 'P2001' || error.code === 'P2025') {
            // Record not found or model doesn't exist
            return NextResponse.json(
                {
                    error: 'Category model not found. Please run: npx prisma db push && npx prisma generate',
                    categories: [] // Return empty array as fallback
                },
                { status: 200 } // Return 200 with empty array so UI doesn't break
            )
        }

        // Check if the error message mentions category or model
        const errorMessage = error.message?.toLowerCase() || ''
        if (errorMessage.includes('category') ||
            errorMessage.includes('model') ||
            errorMessage.includes('does not exist') ||
            errorMessage.includes('unknown model')) {
            return NextResponse.json(
                {
                    error: 'Category model not found. Please run: npx prisma db push && npx prisma generate',
                    categories: [] // Return empty array as fallback
                },
                { status: 200 } // Return 200 with empty array so UI doesn't break
            )
        }

        // For MongoDB, if collection doesn't exist, it usually just returns empty array
        // So if we're here, it's likely a different error
        return NextResponse.json(
            {
                error: `Failed to fetch categories: ${error.message || 'Unknown error'}`,
                categories: [], // Return empty array as fallback
                details: process.env.NODE_ENV === 'development' ? {
                    code: error.code,
                    name: error.name,
                    message: error.message,
                } : undefined
            },
            { status: 200 } // Return 200 with empty array so UI doesn't break
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const userRole = (session.user as any)?.role
        if (userRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { name } = body

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            )
        }

        const trimmedName = name.trim()

        // Check if category already exists
        const existing = await prisma.category.findUnique({
            where: { name: trimmedName },
        })

        if (existing) {
            return NextResponse.json(
                { error: 'Category already exists' },
                { status: 400 }
            )
        }

        const category = await prisma.category.create({
            data: {
                name: trimmedName,
                isActive: true,
            },
        })

        return NextResponse.json(category, { status: 201 })
    } catch (error: any) {
        console.error('Error creating category:', error)

        // Handle Prisma errors
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Category already exists' },
                { status: 400 }
            )
        }

        if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
            return NextResponse.json(
                { error: 'Database connection failed. Please check your connection.' },
                { status: 503 }
            )
        }

        // Check if the model doesn't exist (schema not migrated)
        if (error.message?.includes('category') || error.message?.includes('Category')) {
            return NextResponse.json(
                {
                    error: 'Category model not found. Please run: npx prisma db push && npx prisma generate'
                },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                error: 'Failed to create category',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}

