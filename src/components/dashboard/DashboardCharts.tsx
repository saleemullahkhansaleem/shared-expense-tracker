'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/ui/skeletons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ExpenseBreakdown {
    name: string
    value: number
}

interface MonthlyData {
    month: string
    collected: number
    expenses: number
}

interface DashboardChartsData {
    expenseBreakdown: ExpenseBreakdown[]
    monthlyData: MonthlyData[]
}

const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316']

export function DashboardCharts() {
    const [data, setData] = useState<DashboardChartsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard')
                if (response.ok) {
                    const dashboardData = await response.json()
                    setData({
                        expenseBreakdown: dashboardData.expenseBreakdown.map((item: any, index: number) => ({
                            name: item.name,
                            value: item.value,
                            color: colors[index % colors.length]
                        })),
                        monthlyData: dashboardData.monthlyData
                    })
                }
            } catch (error) {
                console.error('Error fetching dashboard charts data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])
    if (loading) {
        return <ChartSkeleton />
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Error loading charts</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Category-wise expense distribution</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        {data.expenseBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.expenseBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {data.expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Amount']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No expense data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                    <CardDescription>Contributions vs Expenses trend</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.monthlyData.length > 0 ? (
                            data.monthlyData.map((monthData, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">{monthData.month}</span>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">
                                                PKR {monthData.collected.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">
                                                PKR {monthData.expenses.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No monthly data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
