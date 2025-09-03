'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data - replace with real data from API
const mockExpenses = [
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

const categories = ['All', 'Milk', 'Chicken', 'Vegetables', 'Other']
const paymentSources = ['All', 'COLLECTED', 'POCKET']

export function ExpensesList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedPaymentSource, setSelectedPaymentSource] = useState('All')

    const filteredExpenses = mockExpenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.userName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
        const matchesPaymentSource = selectedPaymentSource === 'All' || expense.paymentSource === selectedPaymentSource

        return matchesSearch && matchesCategory && matchesPaymentSource
    })

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>Filter and view all expense entries</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Input
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedPaymentSource} onValueChange={setSelectedPaymentSource}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select payment source" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentSources.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source === 'COLLECTED' ? 'From Collected Amount' :
                                        source === 'POCKET' ? 'From Own Pocket' : source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                            Showing {filteredExpenses.length} expenses
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                            Total: {formatCurrency(totalAmount)}
                        </span>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="space-y-3">
                    {filteredExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                                    <span className="font-medium">{expense.category}</span>
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

                {filteredExpenses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No expenses found matching your filters.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
