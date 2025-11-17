import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params
        const body = await request.json()
        const { name, isActive } = body

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Category name is required' },
                    { status: 400 }
                )
            }

            const trimmedName = name.trim()

            // Check if another category with this name exists
            const existing = await prisma.category.findFirst({
                where: {
                    name: trimmedName,
                    id: { not: id },
                },
            })

            if (existing) {
                return NextResponse.json(
                    { error: 'Category name already exists' },
                    { status: 400 }
                )
            }
        }

        const updateData: any = {}
        if (name !== undefined) {
            updateData.name = name.trim()
        }
        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive)
        }

        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(category)
    } catch (error: any) {
        console.error('Error updating category:', error)

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Category name already exists' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params

        // Get the category first
        const category = await prisma.category.findUnique({
            where: { id },
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Instead of deleting, deactivate the category
        await prisma.category.update({
            where: { id },
            data: { isActive: false },
        })

        return NextResponse.json({ message: 'Category deactivated successfully' })
    } catch (error: any) {
        console.error('Error deleting category:', error)

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}

