'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddExpenseButton } from './AddExpenseButton'
import { ExpensesListSkeleton } from '@/components/ui/skeletons'

interface Expense {
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

const categories = ['All', 'Milk', 'Chicken', 'Vegetables', 'Other']
const paymentSources = ['All', 'COLLECTED', 'POCKET']

export function ExpensesList() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedPaymentSource, setSelectedPaymentSource] = useState('All')

    const fetchExpenses = async () => {
        try {
            const params = new URLSearchParams()
            if (selectedCategory !== 'All') params.append('category', selectedCategory)
            if (selectedPaymentSource !== 'All') params.append('paymentSource', selectedPaymentSource)
            if (searchTerm) params.append('search', searchTerm)

            const response = await fetch(`/api/expenses?${params}`)
            if (response.ok) {
                const data = await response.json()
                setExpenses(data)
            }
        } catch (error) {
            console.error('Error fetching expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExpenses()
    }, [searchTerm, selectedCategory, selectedPaymentSource])

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
        const matchesPaymentSource = selectedPaymentSource === 'All' || expense.paymentSource === selectedPaymentSource

        return matchesSearch && matchesCategory && matchesPaymentSource
    })

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    if (loading) {
        return <ExpensesListSkeleton />
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Expenses</CardTitle>
                        <CardDescription>Filter and view all expense entries</CardDescription>
                    </div>
                    <AddExpenseButton onSuccess={fetchExpenses} />
                </div>
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

                {filteredExpenses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No expenses found matching your filters.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
