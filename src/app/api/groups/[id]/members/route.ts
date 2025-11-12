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
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, createdAt: true },
                        },
                    },
                    orderBy: { joinedAt: 'asc' },
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

        return NextResponse.json({
            group: {
                id: group.id,
                name: group.name,
            },
            members: group.members,
        })
    } catch (error) {
        console.error('Error fetching group members:', error)
        return NextResponse.json(
            { error: 'Failed to fetch group members' },
            { status: 500 }
        )
    }
}

