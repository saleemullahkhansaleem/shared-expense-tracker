'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DashboardOverviewSkeleton } from '@/components/ui/skeletons'
import {
    CreditCardIcon,
    ReceiptPercentIcon,
    BanknotesIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface DashboardData {
    totalCollected: number
    totalExpenses: number
    remainingBalance: number
    daysLeft: number
    averageDailySpend: number
    lowBalanceWarning: boolean
}

export function DashboardOverview() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard')
                if (response.ok) {
                    const dashboardData = await response.json()
                    setData(dashboardData)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return <DashboardOverviewSkeleton />
    }

    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error loading data</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const { totalCollected, totalExpenses, remainingBalance, daysLeft, averageDailySpend, lowBalanceWarning } = data

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                    <CreditCardIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalCollected)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Monthly contributions
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <ReceiptPercentIcon className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        From collected amount
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                    <BanknotesIcon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(remainingBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Available for expenses
                    </p>
                </CardContent>
            </Card>

            <Card className={lowBalanceWarning ? 'border-red-200 bg-red-50' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                    <ExclamationTriangleIcon className={`h-4 w-4 ${lowBalanceWarning ? 'text-red-600' : 'text-yellow-600'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${lowBalanceWarning ? 'text-red-600' : 'text-yellow-600'}`}>
                        {formatCurrency(averageDailySpend)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {daysLeft} days left in month
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
