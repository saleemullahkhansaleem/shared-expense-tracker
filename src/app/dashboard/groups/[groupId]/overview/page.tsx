import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function GroupOverviewPage({
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
        include: {
            members: {
                include: {
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
                take: 5,
            },
            expenses: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { date: 'desc' },
                take: 5,
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

    const totalContributions = group.contributions.reduce(
        (sum, contribution) => sum + contribution.amount,
        0
    )

    const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const memberCount = group.members.length

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-green-600">
                            {formatCurrency(totalContributions)}
                        </p>
                        <p className="text-sm text-gray-500">
                            {group.contributions.length} contributions recorded
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-red-600">
                            {formatCurrency(totalExpenses)}
                        </p>
                        <p className="text-sm text-gray-500">
                            {group.expenses.length} expenses recorded
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-blue-600">{memberCount}</p>
                        <p className="text-sm text-gray-500">Active participants in this group</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {group.contributions.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No contributions recorded for this group yet.
                                </p>
                            )}
                            {group.contributions.map((contribution) => (
                                <div
                                    key={contribution.id}
                                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatCurrency(contribution.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {contribution.user?.name ?? 'Unknown'} •{' '}
                                            {formatDate(new Date(contribution.createdAt))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {group.expenses.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No expenses recorded for this group yet.
                                </p>
                            )}
                            {group.expenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {expense.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {expense.user?.name ?? 'Unknown'} •{' '}
                                            {formatDate(new Date(expense.date))}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-red-600">
                                        -{formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

