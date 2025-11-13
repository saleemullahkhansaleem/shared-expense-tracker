import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AddContributionButton } from '@/components/contributions/AddContributionButton'
import { AddExpenseButton } from '@/components/expenses/AddExpenseButton'

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
                select: {
                    userId: true,
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    })

    if (!group) {
        notFound()
    }

    const userMembership = group.members.find((member) => member.userId === userId) ?? null
    if (!userMembership) {
        redirect('/dashboard')
    }

    const isGroupAdmin = userMembership.role === 'ADMIN'

    const membersForActions = group.members
        .map((member) => {
            const id = member.user?.id ?? member.userId
            const name = member.user?.name ?? 'Unknown member'
            return { id, name }
        })
        .filter(
            (member, index, self) =>
                member.id !== null && member.id !== undefined && index === self.findIndex((m) => m.id === member.id)
        )

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
                        {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="rounded-full bg-indigo-100 px-3 py-1 font-medium text-indigo-700">
                                {userMembership.role}
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1">
                                Invite Code: <strong>{group.inviteCode}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {isGroupAdmin && (
                            <AddContributionButton
                                groupId={group.id}
                                groupName={group.name}
                                members={membersForActions}
                            />
                        )}
                        <AddExpenseButton
                            groupId={group.id}
                            groupName={group.name}
                            members={membersForActions}
                        />
                    </div>
                </div>
            </div>
            <div>{children}</div>
        </div>
    )
}

