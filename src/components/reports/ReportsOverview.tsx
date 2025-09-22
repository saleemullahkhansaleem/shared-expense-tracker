'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline'

// Mock data - replace with real data from API
const mockMonthlyData = [
    {
        month: '2025-01',
        totalContributions: 72000,
        totalExpenses: 45000,
        remainingBalance: 27000,
        memberContributions: [
            { name: 'Ahmed', amount: 12000, status: 'PAID' },
            { name: 'Fatima', amount: 12000, status: 'PAID' },
            { name: 'Hassan', amount: 12000, status: 'PAID' },
            { name: 'Aisha', amount: 12000, status: 'PAID' },
            { name: 'Omar', amount: 12000, status: 'PAID' },
            { name: 'Zara', amount: 0, status: 'PENDING' },
        ],
        memberExpenses: [
            { name: 'Ahmed', collected: 8000, pocket: 500 },
            { name: 'Fatima', collected: 12000, pocket: 0 },
            { name: 'Hassan', collected: 6000, pocket: 1200 },
            { name: 'Aisha', collected: 8000, pocket: 300 },
            { name: 'Omar', collected: 7000, pocket: 800 },
            { name: 'Zara', collected: 4000, pocket: 0 },
        ]
    }
]

const months = [
    { value: '2025-01', label: 'January 2025' },
    { value: '2024-12', label: 'December 2024' },
    { value: '2024-11', label: 'November 2024' },
]

export function ReportsOverview() {
    const [selectedMonth, setSelectedMonth] = useState('2025-01')

    const currentMonthData = mockMonthlyData.find(data => data.month === selectedMonth)

    if (!currentMonthData) {
        return <div>No data available for selected month</div>
    }

    const { totalContributions, totalExpenses, remainingBalance, memberContributions, memberExpenses } = currentMonthData

    // Calculate settlements
    const settlements = memberExpenses.map(member => {
        const contribution = memberContributions.find(c => c.name === member.name)
        const totalSpent = member.collected + member.pocket
        const contributionAmount = contribution?.amount || 0
        const balance = contributionAmount - totalSpent

        return {
            name: member.name,
            contribution: contributionAmount,
            totalSpent,
            balance,
            owes: balance < 0 ? Math.abs(balance) : 0,
            owed: balance > 0 ? balance : 0
        }
    })

    const totalOwed = settlements.reduce((sum, s) => sum + s.owed, 0)
    const totalOwes = settlements.reduce((sum, s) => sum + s.owes, 0)

    return (
        <div className="space-y-6">
            {/* Month Selector */}
            <div className="flex items-center space-x-4">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Report
                </Button>

                <Button>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download PDF
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalContributions)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalExpenses)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(remainingBalance)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-600">
                            {memberContributions.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Member Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contributions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Member Contributions</CardTitle>
                        <CardDescription>Monthly contributions status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {memberContributions.map((member) => (
                                <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium">{member.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold">
                                            {formatCurrency(member.amount)}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${member.status === 'PAID'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Member Expenses</CardTitle>
                        <CardDescription>Expenses breakdown by member</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {memberExpenses.map((member) => (
                                <div key={member.name} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{member.name}</span>
                                        <span className="font-semibold">
                                            {formatCurrency(member.collected + member.pocket)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Collected: {formatCurrency(member.collected)}</span>
                                        <span>Pocket: {formatCurrency(member.pocket)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settlements */}
            <Card>
                <CardHeader>
                    <CardTitle>Settlements Summary</CardTitle>
                    <CardDescription>Who owes what to whom</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {settlements.map((settlement) => (
                            <div key={settlement.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{settlement.name}</h4>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Contribution: {formatCurrency(settlement.contribution)} |
                                        Total Spent: {formatCurrency(settlement.totalSpent)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {settlement.owes > 0 ? (
                                        <div className="text-red-600 font-semibold">
                                            Owes: {formatCurrency(settlement.owes)}
                                        </div>
                                    ) : settlement.owed > 0 ? (
                                        <div className="text-green-600 font-semibold">
                                            Owed: {formatCurrency(settlement.owed)}
                                        </div>
                                    ) : (
                                        <div className="text-gray-600 font-semibold">
                                            Balanced
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {formatCurrency(totalOwed)}
                                </div>
                                <div className="text-sm text-blue-600">Total to be Collected</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-red-600">
                                    {formatCurrency(totalOwes)}
                                </div>
                                <div className="text-sm text-red-600">Total to be Paid</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
