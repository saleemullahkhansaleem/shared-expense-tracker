import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export default async function GroupReportsPage({
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
        notFound()
    }

    const membership = group.members.find((member) => member.userId === userId)
    if (!membership) {
        redirect('/dashboard')
    }

    const contributionByMember = group.members.map((member) => {
        const total = group.contributions
            .filter((contribution) => contribution.userId === member.userId)
            .reduce((sum, contribution) => sum + contribution.amount, 0)

        return {
            member,
            total,
        }
    })

    const expenseByMember = group.members.map((member) => {
        const total = group.expenses
            .filter((expense) => expense.userId === member.userId)
            .reduce((sum, expense) => sum + expense.amount, 0)

        return {
            member,
            total,
        }
    })

    const groupBalance = contributionByMember.reduce((sum, item) => sum + item.total, 0) -
        expenseByMember.reduce((sum, item) => sum + item.total, 0)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Group Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total Contributions</p>
                        <p className="text-2xl font-semibold text-green-600">
                            {formatCurrency(
                                contributionByMember.reduce((sum, item) => sum + item.total, 0)
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total Expenses</p>
                        <p className="text-2xl font-semibold text-red-600">
                            {formatCurrency(
                                expenseByMember.reduce((sum, item) => sum + item.total, 0)
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Group Balance</p>
                        <p
                            className={cn(
                                'text-2xl font-semibold',
                                groupBalance >= 0 ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {formatCurrency(groupBalance)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contributions by Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {contributionByMember.map(({ member, total }) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {member.user?.name ?? 'Unknown member'}
                                        </p>
                                        <p className="text-xs text-gray-500">Role: {member.role}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600">
                                        {formatCurrency(total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expenses by Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {expenseByMember.map(({ member, total }) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {member.user?.name ?? 'Unknown member'}
                                        </p>
                                        <p className="text-xs text-gray-500">Role: {member.role}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-red-600">
                                        {formatCurrency(total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Contributions
                        </h3>
                        <div className="mt-3 space-y-2">
                            {group.contributions.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No contribution records available.
                                </p>
                            )}
                            {group.contributions.map((contribution) => (
                                <div
                                    key={contribution.id}
                                    className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {contribution.user?.name ?? 'Unknown member'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(new Date(contribution.createdAt))}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600">
                                        {formatCurrency(contribution.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Expenses
                        </h3>
                        <div className="mt-3 space-y-2">
                            {group.expenses.length === 0 && (
                                <p className="text-sm text-gray-500">No expense records available.</p>
                            )}
                            {group.expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between rounded-md border border-gray-100 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {expense.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {expense.user?.name ?? 'Unknown member'} •{' '}
                                            {formatDate(new Date(expense.date))}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-red-600">
                                        -{formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

