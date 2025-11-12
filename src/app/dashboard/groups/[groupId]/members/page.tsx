import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function GroupMembersPage({
    params,
}: {
    params: { groupId: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect('/auth/signin')
    }

    const userId = (session.user as any)?.id
    const groupId = params.groupId

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
            id: true,
            name: true,
            expenses: {
                where: {
                    paymentSource: 'POCKET',
                },
                select: {
                    userId: true,
                    amount: true,
                },
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: {
                    joinedAt: 'asc',
                },
            },
        },
    })

    if (!group) {
        notFound()
    }

    const membership = group.members.find((member) => member.userId === userId)
    if (!membership) {
        redirect('/dashboard')
    }

    const pocketExpensesByMember = group.expenses.reduce<Record<string, number>>(
        (acc, expense) => {
            acc[expense.userId] = (acc[expense.userId] ?? 0) + expense.amount
            return acc
        },
        {}
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Group Members</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Member
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Joined
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                >
                                    Pocket Balance
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {group.members.map((member) => {
                                const balance = pocketExpensesByMember[member.userId] ?? 0
                                const hasBalance = balance > 0

                                return (
                                    <tr key={member.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="font-medium">{member.user?.name ?? 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">
                                                {member.user?.email ?? 'No email'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    member.role === 'ADMIN'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatDate(new Date(member.joinedAt))}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`font-medium ${
                                                    hasBalance ? 'text-green-600' : 'text-gray-500'
                                                }`}
                                            >
                                                {formatCurrency(balance)}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

