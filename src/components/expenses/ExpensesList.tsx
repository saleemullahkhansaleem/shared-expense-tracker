'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddExpenseButton } from './AddExpenseButton'
import { EditExpenseModal } from './EditExpenseModal'
import { ExpensesListSkeleton } from '@/components/ui/skeletons'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Expense {
    id: string
    title: string
    category: string
    amount: number
    date: string
    paymentSource: 'COLLECTED' | 'POCKET'
    userId: string
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
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const fetchExpenses = useCallback(async () => {
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
    }, [selectedCategory, selectedPaymentSource, searchTerm])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense)
        setIsEditModalOpen(true)
    }

    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return
        }

        try {
            const response = await fetch(`/api/expenses/${expenseId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchExpenses() // Refresh the list
            } else {
                alert('Failed to delete expense')
            }
        } catch (error) {
            console.error('Error deleting expense:', error)
            alert('Failed to delete expense')
        }
    }

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
        <>
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
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">
                                            {formatCurrency(expense.amount)}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditExpense(expense)}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteExpense(expense.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
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

            {/* Edit Expense Modal */}
            <EditExpenseModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingExpense(null)
                }}
                onSuccess={fetchExpenses}
                expense={editingExpense}
            />
        </>
    )
}
