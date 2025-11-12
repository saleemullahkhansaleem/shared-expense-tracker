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
            select: {
                id: true,
                name: true,
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

        const contributionByMember = group.members.map((member) => ({
            member,
            total: group.contributions
                .filter((contribution) => contribution.userId === member.userId)
                .reduce((sum, contribution) => sum + contribution.amount, 0),
        }))

        const expenseByMember = group.members.map((member) => ({
            member,
            total: group.expenses
                .filter((expense) => expense.userId === member.userId)
                .reduce((sum, expense) => sum + expense.amount, 0),
        }))

        return NextResponse.json({
            group: {
                id: group.id,
                name: group.name,
            },
            contributionByMember,
            expenseByMember,
            contributions: group.contributions,
            expenses: group.expenses,
        })
    } catch (error) {
        console.error('Error fetching group reports:', error)
        return NextResponse.json(
            { error: 'Failed to fetch group reports' },
            { status: 500 }
        )
    }
}

