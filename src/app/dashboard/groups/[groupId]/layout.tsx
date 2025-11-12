import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function GroupLayout({
    children,
    params,
}: {
    children: ReactNode
    params: { groupId: string }
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    const userId = (session.user as any)?.id
    const groupId = params.groupId

    if (!groupId) {
        notFound()
    }

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
            id: true,
            name: true,
            description: true,
            inviteCode: true,
            monthlyAmount: true,
            createdAt: true,
            members: {
                where: { userId },
                select: { role: true },
            },
        },
    })

    if (!group) {
        notFound()
    }

    const userMembership = Array.isArray(group.members) ? group.members[0] : null
    if (!userMembership) {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
                        {group.description && (
                            <p className="text-sm text-gray-500">{group.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-700">
                            {userMembership.role}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                            Invite Code: <strong>{group.inviteCode}</strong>
                        </span>
                    </div>
                </div>
            </div>
            <div>{children}</div>
        </div>
    )
}

