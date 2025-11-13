import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getCurrentMonth } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ClockIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline'

type TransactionItem = {
    id: string
    type: 'CONTRIBUTION' | 'EXPENSE'
    amount: number
    userName: string
    groupName: string
    timestamp: string
    meta?: string
}

type DashboardGroup = {
    id: string
    name: string
    description: string | null
    monthlyAmount: number
    memberCount: number
    createdAt: string
}

type DashboardStats = {
    totalGroups: number
    totalContributions: number
    totalExpenses: number
    totalPayableContributions: number
    paidContributions: number
    pendingContributions: number
    receivables: number
}

type DashboardData = {
    stats: DashboardStats
    transactions: TransactionItem[]
    groups: DashboardGroup[]
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/auth/signin')
    }

    const userId = (session.user as any)?.id as string | undefined

    if (!userId) {
        redirect('/auth/signin')
    }

    const { stats, transactions, groups } = await fetchDashboardData(userId)

    const statCards: StatCardProps[] = [
        {
            title: 'Total Groups',
            value: stats.totalGroups.toString(),
            icon: UserGroupIcon,
            accent: 'text-indigo-600',
        },
        {
            title: 'Total Contributions',
            value: formatCurrency(stats.totalContributions),
            icon: BanknotesIcon,
            accent: 'text-green-600',
        },
        {
            title: 'Total Expenses',
            value: formatCurrency(stats.totalExpenses),
            icon: CurrencyDollarIcon,
            accent: 'text-red-600',
        },
        {
            title: 'Pending Contributions',
            value: formatCurrency(stats.pendingContributions - stats.totalContributions),
            icon: ClockIcon,
            accent: 'text-amber-600',
        },
        {
            title: 'Receivable Amounts',
            value: formatCurrency(stats.receivables),
            icon: ArrowTrendingUpIcon,
            accent: 'text-blue-600',
        },
    ]

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
                <p className="text-gray-600">
                    Quick overview of your shared expense activity across all groups.
                </p>
            </header>

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map((card) => (
                    <StatCard key={card.title} {...card} />
                ))}
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader className="flex items-center justify-between">
                        <div>
                            <CardTitle>Today&apos;s Activity</CardTitle>
                            <p className="text-sm text-gray-500">
                                Latest contributions and expenses from your groups.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/expenses"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            View expenses
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    No transactions recorded today across your groups.
                                </p>
                            )}
                            {transactions.map((transaction) => (
                                <TransactionRow key={transaction.id} transaction={transaction} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex items-center justify-between">
                        <div>
                            <CardTitle>Your Groups</CardTitle>
                            <p className="text-sm text-gray-500">
                                Groups you&apos;re part of. Join or manage from here.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/groups"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {groups.length === 0 && (
                                <p className="text-sm text-gray-500">
                                    You&apos;re not a member of any groups yet.
                                </p>
                            )}
                            {groups.map((group) => (
                                <GroupRow key={group.id} group={group} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string
    icon: ComponentType<SVGProps<SVGSVGElement>>
    accent: string
}

interface TransactionRowProps {
    transaction: TransactionItem
}

interface GroupRowProps {
    group: DashboardGroup
}

async function fetchDashboardData(userId: string): Promise<DashboardData> {
    const memberships = await prisma.groupMember.findMany({
        where: { userId },
        include: {
            group: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    monthlyAmount: true,
                },
            },
        },
    })

    if (memberships.length === 0) {
        return {
            stats: {
                totalGroups: 0,
                totalContributions: 0,
                totalExpenses: 0,
                totalPayableContributions: 0,
                paidContributions: 0,
                pendingContributions: 0,
                receivables: 0,
            },
            transactions: [],
            groups: [],
        }
    }

    const groupIds = memberships.map((membership) => membership.groupId)

    const [groupSummaries, stats, transactions] = await Promise.all([
        prisma.group.findMany({
            where: {
                id: { in: groupIds },
            },
            select: {
                id: true,
                name: true,
                description: true,
                monthlyAmount: true,
                createdAt: true,
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 6,
        }),
        calculateDashboardTotals(memberships, userId),
        fetchTodaysTransactions(groupIds),
    ])

    const groups = groupSummaries.map<DashboardGroup>((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        monthlyAmount: group.monthlyAmount ?? 0,
        memberCount: group._count.members,
        createdAt: group.createdAt.toISOString(),
    }))

    return {
        stats,
        transactions,
        groups,
    }
}

async function calculateDashboardTotals(
    memberships: Array<{
        groupId: string
        group: {
            monthlyAmount: number | null
        } | null
    }>,
    userId: string
): Promise<DashboardStats> {
    const groupIds = memberships.map((membership) => membership.groupId)
    const currentMonth = getCurrentMonth()

    const [contributionSum, expenseSum, userMonthSum, receivableSum] = await Promise.all([
        prisma.contribution.aggregate({
            _sum: { amount: true },
            where: { groupId: { in: groupIds } },
        }),
        prisma.expense.aggregate({
            _sum: { amount: true },
            where: { groupId: { in: groupIds } },
        }),
        prisma.contribution.aggregate({
            _sum: { amount: true },
            where: {
                groupId: { in: groupIds },
                userId,
                month: currentMonth,
            },
        }),
        prisma.expense.aggregate({
            _sum: { amount: true },
            where: {
                groupId: { in: groupIds },
                userId,
                paymentSource: 'POCKET',
            },
        }),
    ])

    const totalPayable = memberships.reduce<number>((sum, membership) => {
        const amount = membership.group?.monthlyAmount ?? 0
        return sum + amount
    }, 0)

    const paidThisMonth = userMonthSum._sum.amount ?? 0
    const pendingAmount = Math.max(totalPayable - paidThisMonth, 0)

    return {
        totalGroups: memberships.length,
        totalContributions: contributionSum._sum.amount ?? 0,
        totalExpenses: expenseSum._sum.amount ?? 0,
        totalPayableContributions: totalPayable,
        paidContributions: paidThisMonth,
        pendingContributions: pendingAmount,
        receivables: receivableSum._sum.amount ?? 0,
    }
}

async function fetchTodaysTransactions(groupIds: string[]): Promise<TransactionItem[]> {
    if (groupIds.length === 0) {
        return []
    }

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const [contributions, expenses] = await Promise.all([
        prisma.contribution.findMany({
            where: {
                groupId: { in: groupIds },
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                user: {
                    select: { name: true },
                },
                group: {
                    select: { name: true },
                },
            },
        }),
        prisma.expense.findMany({
            where: {
                groupId: { in: groupIds },
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                user: {
                    select: { name: true },
                },
                group: {
                    select: { name: true },
                },
            },
        }),
    ])

    const combined: TransactionItem[] = [
        ...contributions.map((contribution) => ({
            id: contribution.id,
            type: 'CONTRIBUTION' as const,
            amount: contribution.amount,
            userName: contribution.user?.name ?? 'Unknown member',
            groupName: contribution.group?.name ?? 'Unassigned group',
            timestamp: contribution.createdAt.toISOString(),
            meta: `Month ${contribution.month}`,
        })),
        ...expenses.map((expense) => ({
            id: expense.id,
            type: 'EXPENSE' as const,
            amount: expense.amount,
            userName: expense.user?.name ?? 'Unknown member',
            groupName: expense.group?.name ?? 'Unassigned group',
            timestamp: expense.date.toISOString(),
            meta: expense.paymentSource === 'POCKET' ? 'Paid from pocket' : 'Paid from collected',
        })),
    ]

    return combined
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8)
}

function StatCard({ title, value, icon: Icon, accent }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
                <Icon className={`h-5 w-5 ${accent}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
            </CardContent>
        </Card>
    )
}

function TransactionRow({ transaction }: TransactionRowProps) {
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 sm:flex sm:items-center sm:justify-between">
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${transaction.type === 'CONTRIBUTION'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {transaction.type === 'CONTRIBUTION' ? 'Contribution' : 'Expense'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{transaction.userName}</span>
                    <span className="text-sm text-gray-400">in</span>
                    <span className="text-sm font-medium text-indigo-600">{transaction.groupName}</span>
                </div>
                <div className="text-xs text-gray-500">
                    {formatDate(new Date(transaction.timestamp))}
                    {transaction.meta && (
                        <>
                            <span className="mx-2 text-gray-300">•</span>
                            <span>{transaction.meta}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="mt-3 text-sm font-semibold text-gray-900 sm:mt-0 sm:text-right">
                {formatCurrency(transaction.amount)}
            </div>
        </div>
    )
}

function GroupRow({ group }: GroupRowProps) {
    return (
        <div className="rounded-lg border border-gray-100 p-4 hover:border-indigo-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{group.name}</h3>
                    {group.description && <p className="text-xs text-gray-500">{group.description}</p>}
                </div>
                <div className="text-xs text-gray-400">Joined {formatDate(new Date(group.createdAt))}</div>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <span>
                    {group.memberCount} member{group.memberCount === 1 ? '' : 's'}
                </span>
                <span>
                    Monthly contribution:{' '}
                    <span className="font-medium text-gray-900">{formatCurrency(group.monthlyAmount)}</span>
                </span>
            </div>
        </div>
    )
}
