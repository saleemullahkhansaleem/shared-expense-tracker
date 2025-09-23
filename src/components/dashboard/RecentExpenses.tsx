'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { RecentExpensesSkeleton } from '@/components/ui/skeletons'

interface RecentExpense {
    id: string
    title: string
    category: string
    amount: number
    date: string
    paymentSource: 'COLLECTED' | 'POCKET'
    user: {
        id: string
        name: string
        email: string
    }
}

export function RecentExpenses() {
    const [expenses, setExpenses] = useState<RecentExpense[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRecentExpenses = async () => {
            try {
                const response = await fetch('/api/expenses/recent?limit=5')
                if (response.ok) {
                    const data = await response.json()
                    setExpenses(data)
                }
            } catch (error) {
                console.error('Error fetching recent expenses:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecentExpenses()
    }, [])
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest expense entries from all members</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <RecentExpensesSkeleton />
                ) : (
                    <>
                        <div className="space-y-4">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h4 className="font-medium text-gray-900">{expense.title}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${expense.paymentSource === 'COLLECTED'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                                }`}>
                                                {expense.paymentSource === 'COLLECTED' ? 'Collected' : 'Pocket'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                            <span>{expense.category}</span>
                                            <span>•</span>
                                            <span>{expense.user.name}</span>
                                            <span>•</span>
                                            <span>{formatDate(new Date(expense.date))}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">
                                            {formatCurrency(expense.amount)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-center">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View all expenses →
                            </button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
