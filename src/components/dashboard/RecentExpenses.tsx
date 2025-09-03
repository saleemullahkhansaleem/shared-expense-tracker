'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data - replace with real data from API
const mockRecentExpenses = [
    {
        id: '1',
        title: 'Bought Milk',
        category: 'Milk',
        amount: 1200,
        date: new Date('2025-01-15'),
        paymentSource: 'COLLECTED',
        userName: 'Ahmed'
    },
    {
        id: '2',
        title: 'Chicken for dinner',
        category: 'Chicken',
        amount: 2500,
        date: new Date('2025-01-14'),
        paymentSource: 'COLLECTED',
        userName: 'Fatima'
    },
    {
        id: '3',
        title: 'Fresh vegetables',
        category: 'Vegetables',
        amount: 800,
        date: new Date('2025-01-13'),
        paymentSource: 'POCKET',
        userName: 'Hassan'
    },
    {
        id: '4',
        title: 'Bread and eggs',
        category: 'Other',
        amount: 450,
        date: new Date('2025-01-12'),
        paymentSource: 'COLLECTED',
        userName: 'Aisha'
    },
    {
        id: '5',
        title: 'Rice and lentils',
        category: 'Other',
        amount: 1200,
        date: new Date('2025-01-11'),
        paymentSource: 'COLLECTED',
        userName: 'Omar'
    }
]

export function RecentExpenses() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest expense entries from all members</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockRecentExpenses.map((expense) => (
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
                                    <span>{expense.userName}</span>
                                    <span>•</span>
                                    <span>{formatDate(expense.date)}</span>
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
            </CardContent>
        </Card>
    )
}
