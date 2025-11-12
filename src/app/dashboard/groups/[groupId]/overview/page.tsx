import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddContributionButton } from '@/components/contributions/AddContributionButton'
import { GroupRecentExpensesCard } from '@/components/groups/GroupRecentExpensesCard'

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
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            contributions: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            expenses: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
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
    const collectedExpenses = group.expenses
        .filter((expense) => expense.paymentSource === 'COLLECTED')
        .reduce((sum, expense) => sum + expense.amount, 0)
    const collectedBalance = totalContributions - collectedExpenses
    const memberCount = group.members.length
    const isGroupAdmin = membership.role === 'ADMIN'
    const groupMembersForModal = group.members
        .map((member) =>
            member.user
                ? {
                      id: member.user.id,
                      name: member.user.name,
                  }
                : null
        )
        .filter((member): member is { id: string; name: string } => member !== null)

    const initialExpenses = group.expenses.map((expense) => ({
        id: expense.id,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        date: expense.date instanceof Date ? expense.date.toISOString() : new Date(expense.date).toISOString(),
        paymentSource: expense.paymentSource,
        userId: expense.userId,
        user: expense.user
            ? {
                  id: expense.user.id,
                  name: expense.user.name,
                  email: expense.user.email ?? undefined,
              }
            : null,
    }))

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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
                        <CardTitle>Collected Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-semibold ${collectedBalance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                            {formatCurrency(collectedBalance)}
                        </p>
                        <p className="text-sm text-gray-500">
                            Net of {formatCurrency(totalContributions)} collected minus
                            {formatCurrency(collectedExpenses)} expenses from collection
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
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Contributions</CardTitle>
                            {isGroupAdmin && (
                                <AddContributionButton
                                    groupId={group.id}
                                    groupName={group.name}
                                    members={groupMembersForModal}
                                />
                            )}
                        </div>
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
                                            {contribution.user?.name ?? 'Unknown member'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {contribution.month} • {formatDate(new Date(contribution.createdAt))}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-green-600">
                                        +{formatCurrency(contribution.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <GroupRecentExpensesCard
                    groupId={group.id}
                    groupName={group.name}
                    initialExpenses={initialExpenses}
                    members={groupMembersForModal}
                    currentUserId={userId}
                    isGroupAdmin={isGroupAdmin}
                />
            </div>
        </div>
    )
}

