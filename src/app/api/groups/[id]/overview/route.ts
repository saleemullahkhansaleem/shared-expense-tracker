import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const userId = (session.user as any)?.id
        const groupId = params.id

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                members: {
                    select: {
                        id: true,
                        userId: true,
                        role: true,
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
                contributions: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                expenses: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                    orderBy: { date: 'desc' },
                },
            },
        })

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }

        const membership = group.members.find((member) => member.userId === userId)
        if (!membership) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const totalContributions = group.contributions.reduce(
            (sum, contribution) => sum + contribution.amount,
            0
        )

        const totalExpenses = group.expenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        )

        return NextResponse.json({
            group: {
                id: group.id,
                name: group.name,
                description: group.description,
                inviteCode: group.inviteCode,
            },
            stats: {
                totalContributions,
                totalExpenses,
                memberCount: group.members.length,
                contributionCount: group.contributions.length,
                expenseCount: group.expenses.length,
            },
            recentContributions: group.contributions.slice(0, 5),
            recentExpenses: group.expenses.slice(0, 5),
        })
    } catch (error) {
        console.error('Error fetching group overview:', error)
        return NextResponse.json(
            { error: 'Failed to fetch group overview' },
            { status: 500 }
        )
    }
}

