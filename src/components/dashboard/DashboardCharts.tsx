'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Mock data - replace with real data from API
const mockExpenseData = [
    { name: 'Milk', value: 12000, color: '#3B82F6' },
    { name: 'Chicken', value: 18000, color: '#EF4444' },
    { name: 'Vegetables', value: 8000, color: '#10B981' },
    { name: 'Other', value: 7000, color: '#F59E0B' },
]

const mockMonthlyData = [
    { month: 'Jan', collected: 60000, expenses: 45000 },
    { month: 'Feb', collected: 60000, expenses: 52000 },
    { month: 'Mar', collected: 60000, expenses: 38000 },
    { month: 'Apr', collected: 60000, expenses: 41000 },
    { month: 'May', collected: 60000, expenses: 47000 },
    { month: 'Jun', collected: 60000, expenses: 43000 },
]

export function DashboardCharts() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Category-wise expense distribution</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockExpenseData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {mockExpenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Amount']}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
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
                        {mockMonthlyData.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">{data.month}</span>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">
                                            PKR {data.collected.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">
                                            PKR {data.expenses.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
