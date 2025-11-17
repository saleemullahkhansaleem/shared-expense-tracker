import type { ComponentType, SVGProps } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { GroupExpenseCategoryChart } from '@/components/groups/GroupExpenseCategoryChart'
import { GroupTransactionsList, GroupTransactionItem } from '@/components/groups/GroupTransactionsList'
import {
    ArrowPathIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ChartPieIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    WalletIcon,
} from '@heroicons/react/24/outline'

type TransactionItem = GroupTransactionItem

type StatCardProps = {
    title: string
    primary: string
    secondary?: string
    icon: ComponentType<SVGProps<SVGSVGElement>>
    accent: string
}

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

    let group
    try {
        group = await prisma.group.findUnique({
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
            },
            expenses: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { date: 'desc' },
                },
            },
        })
    } catch (error: any) {
        // Handle database connection errors
        if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
            console.error('Database connection error:', error)
            throw new Error('Unable to connect to the database. Please check your connection and try again.')
        }
        throw error
    }

    if (!group) {
        notFound()
    }

    const membership = group.members.find((member) => member.userId === userId)
    if (!membership) {
        redirect('/dashboard')
    }

    const totalMembers = group.members.length
    const totalCollectedContributions = group.contributions.reduce(
        (sum, contribution) => sum + contribution.amount,
        0
    )
    const expectedContributionPerMember = group.monthlyAmount ?? 0
    const totalExpectedContributions = expectedContributionPerMember * totalMembers
    const totalPendingContributions = Math.max(totalExpectedContributions - totalCollectedContributions, 0)

    const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const expensesFromContributions = group.expenses
        .filter((expense) => expense.paymentSource === 'COLLECTED')
        .reduce((sum, expense) => sum + expense.amount, 0)
    const expensesFromMembersPockets = group.expenses
        .filter((expense) => expense.paymentSource === 'POCKET')
        .reduce((sum, expense) => sum + expense.amount, 0)
    const pocketExpenseCount = group.expenses.filter((expense) => expense.paymentSource === 'POCKET').length
    const totalBalance = totalCollectedContributions - totalExpenses

    const categoryMap = new Map<string, number>()
    group.expenses.forEach((expense) => {
        const category = expense.category || 'Uncategorized'
        categoryMap.set(category, (categoryMap.get(category) ?? 0) + expense.amount)
    })

    const categoryChartData = Array.from(categoryMap.entries())
        .map(([category, amount]) => ({
            name: category,
            value: amount,
        }))
        .sort((a, b) => b.value - a.value)

    const latestTransactions: TransactionItem[] = [
        ...group.contributions.map((contribution) => {
            const createdAt =
                contribution.createdAt instanceof Date
                    ? contribution.createdAt
                    : new Date(contribution.createdAt)
            return {
                id: contribution.id,
                type: 'CONTRIBUTION' as const,
                entity: 'contribution' as const,
                amount: contribution.amount,
                userName: contribution.user?.name ?? 'Unknown member',
                timestamp: createdAt.toISOString(),
                linkHref: `/dashboard/groups/${group.id}/contributions?highlight=${contribution.id}`,
                meta: `Contribution for ${contribution.month}`,
                contribution: {
        id: contribution.id,
        amount: contribution.amount,
        month: contribution.month,
                    createdAt: createdAt.toISOString(),
        userId: contribution.userId,
                    notes: (contribution as any).notes ?? null,
        user: contribution.user
            ? {
                  id: contribution.user.id,
                  name: contribution.user.name,
                  email: contribution.user.email ?? undefined,
              }
            : null,
        group: {
            id: group.id,
            name: group.name,
        },
                },
            }
        }),
        ...group.expenses.map((expense) => {
            const date = expense.date instanceof Date ? expense.date : new Date(expense.date)
            return {
                id: expense.id,
                type: 'EXPENSE' as const,
                entity: 'expense' as const,
                amount: expense.amount,
                userName: expense.user?.name ?? 'Unknown member',
                timestamp: date.toISOString(),
                linkHref: `/dashboard/groups/${group.id}/expenses?highlight=${expense.id}`,
                meta: expense.paymentSource === 'POCKET' ? 'Paid from pocket' : 'Paid from contributions',
                expense: {
        id: expense.id,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
                    date: date.toISOString(),
        paymentSource: expense.paymentSource,
        userId: expense.userId,
        user: expense.user
            ? {
                  id: expense.user.id,
                  name: expense.user.name,
                  email: expense.user.email ?? undefined,
              }
            : null,
                    notes: (expense as any).details ?? null,
                    group: {
                        id: group.id,
                        name: group.name,
                    },
                },
            }
        }),
    ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50)

    const pocketShare = totalExpenses > 0 ? Math.round((expensesFromMembersPockets / totalExpenses) * 100) : 0
    const collectedShare = totalExpenses > 0 ? Math.round((expensesFromContributions / totalExpenses) * 100) : 0

    const stats: StatCardProps[] = [
        {
            title: 'Total Members',
            primary: totalMembers.toString(),
            icon: UserGroupIcon,
            accent: 'text-indigo-600',
        },
        {
            title: 'Collected vs Expected',
            primary: formatCurrency(totalCollectedContributions),
            secondary: `Expected ${formatCurrency(totalExpectedContributions)}`,
            icon: BanknotesIcon,
            accent: 'text-green-600',
        },
        {
            title: 'Pending Contributions',
            primary: formatCurrency(totalPendingContributions),
            secondary: totalPendingContributions > 0 ? 'Collect from members' : 'All caught up',
            icon: ClockIcon,
            accent: 'text-amber-600',
        },
        {
            title: 'Total Balance',
            primary: formatCurrency(totalBalance),
            secondary: `${formatCurrency(totalCollectedContributions)} collected • ${formatCurrency(totalExpenses)} spent`,
            icon: ArrowTrendingUpIcon,
            accent: 'text-sky-600',
        },
        {
            title: 'Pocket Reimbursements',
            primary: formatCurrency(expensesFromMembersPockets),
            secondary: pocketExpenseCount > 0 ? `${pocketExpenseCount} pocket expense${pocketExpenseCount === 1 ? '' : 's'}` : 'No outstanding reimbursements',
            icon: WalletIcon,
            accent: 'text-purple-600',
        },
        {
            title: 'Total Expenses',
            primary: formatCurrency(totalExpenses),
            secondary: `${group.expenses.length} expense${group.expenses.length === 1 ? '' : 's'}`,
            icon: CurrencyDollarIcon,
            accent: 'text-red-600',
        },
        {
            title: 'Expenses from Contributions',
            primary: formatCurrency(expensesFromContributions),
            secondary: totalExpenses > 0 ? `${collectedShare}% of total spend` : 'No recorded expenses',
            icon: ChartPieIcon,
            accent: 'text-teal-600',
        },
        {
            title: 'Expenses from Members',
            primary: formatCurrency(expensesFromMembersPockets),
            secondary: totalExpenses > 0 ? `${pocketShare}% of total spend` : 'No recorded expenses',
            icon: ArrowPathIcon,
            accent: 'text-rose-600',
        },
    ]

    const isGroupAdmin = membership.role === 'ADMIN'
    return (
        <div className="space-y-8">
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader className="flex items-center justify-between">
                        <div>
                            <CardTitle>Latest Transactions</CardTitle>
                        <p className="text-sm text-gray-500">
                                Most recent contributions and expenses for this group.
                            </p>
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
                            Last {latestTransactions.length} items
                        </span>
                    </CardHeader>
                    <CardContent>
                        <GroupTransactionsList
                            initialTransactions={latestTransactions}
                            isGroupAdmin={isGroupAdmin}
                            currentUserId={userId}
                        />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GroupExpenseCategoryChart data={categoryChartData} />
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle>Group Activity Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-gray-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Members</p>
                            <p className="text-lg font-semibold text-gray-900">{totalMembers}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Contributions Logged</p>
                            <p className="text-lg font-semibold text-gray-900">{group.contributions.length}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Expenses Logged</p>
                            <p className="text-lg font-semibold text-gray-900">{group.expenses.length}</p>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Outstanding Pocket Claims</p>
                            <p className="text-lg font-semibold text-gray-900">{pocketExpenseCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

function StatCard({ title, primary, secondary, icon: Icon, accent }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
                    {secondary && <p className="mt-1 text-xs text-gray-400">{secondary}</p>}
                </div>
                <Icon className={`h-5 w-5 ${accent}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold text-gray-900">{primary}</div>
            </CardContent>
        </Card>
    )
}

