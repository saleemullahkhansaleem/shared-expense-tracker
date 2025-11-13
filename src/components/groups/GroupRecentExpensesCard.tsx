'use client'

import { useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddExpenseButton } from '@/components/expenses/AddExpenseButton'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type PaymentSource = 'COLLECTED' | 'POCKET'

type ExpenseSummary = {
    id: string
    title: string
    category: string
    amount: number
    date: string
    paymentSource: PaymentSource
    userId: string
    user: {
        id: string
        name: string
        email?: string
    } | null
}

interface GroupRecentExpensesCardProps {
    groupId: string
    groupName: string
    initialExpenses: ExpenseSummary[]
    members: Array<{ id: string; name: string }>
    currentUserId?: string
    isGroupAdmin: boolean
}

export function GroupRecentExpensesCard({
    groupId,
    groupName,
    initialExpenses,
    members,
    currentUserId,
    isGroupAdmin,
}: GroupRecentExpensesCardProps) {
    const [expenses, setExpenses] = useState<ExpenseSummary[]>(initialExpenses)
    const [editingExpense, setEditingExpense] = useState<ExpenseSummary | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const refreshExpenses = useCallback(async () => {
        try {
            setIsRefreshing(true)
            const response = await fetch(`/api/expenses?groupId=${groupId}`)
            if (!response.ok) {
                throw new Error('Failed to refresh expenses')
            }
            const data = await response.json()
            setExpenses(Array.isArray(data) ? data.slice(0, 5) : [])
        } catch (error) {
            console.error('Error refreshing group expenses:', error)
        } finally {
            setIsRefreshing(false)
        }
    }, [groupId])

    const handleEdit = (expense: ExpenseSummary) => {
        setEditingExpense(expense)
        setIsEditModalOpen(true)
    }

    const handleDelete = async (expense: ExpenseSummary) => {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return
        }

        try {
            const response = await fetch(`/api/expenses/${expense.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete expense')
            }

            await refreshExpenses()
        } catch (error) {
            console.error('Error deleting expense:', error)
            alert(error instanceof Error ? error.message : 'Failed to delete expense')
        }
    }

    const canManageExpense = useCallback(
        (expense: ExpenseSummary) => {
            if (!currentUserId) return false
            if (expense.userId === currentUserId) return true
            if (isGroupAdmin) return true
            return false
        },
        [currentUserId, isGroupAdmin]
    )

    const paymentLabel = useCallback((source: PaymentSource) => {
        return source === 'COLLECTED' ? 'Collected' : 'Pocket'
    }, [])

    const displayedExpenses = useMemo(() => expenses.slice(0, 5), [expenses])

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Recent Expenses</CardTitle>
                    <AddExpenseButton
                        onSuccess={refreshExpenses}
                        groupId={groupId}
                        groupName={groupName}
                        members={members}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayedExpenses.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No expenses recorded for this group yet.
                        </p>
                    )}
                    {displayedExpenses.map((expense) => {
                        const manageable = canManageExpense(expense)
                        return (
                            <div
                                key={expense.id}
                                className="rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                        {expense.title}
                                    </p>
                                    <p className="text-xs text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <span>{expense.user?.name ?? 'Unknown'}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{formatDate(new Date(expense.date))}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{paymentLabel(expense.paymentSource)}</span>
                                    </p>
                                </div>
                                <div className="mt-3 flex flex-col gap-3 sm:mt-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm font-medium text-red-600 sm:text-right">
                                        -{formatCurrency(expense.amount)}
                                    </p>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(expense)}
                                            disabled={!manageable}
                                            title={
                                                manageable
                                                    ? 'Edit expense'
                                                    : 'Only the payer or group admins can edit this expense'
                                            }
                                            className="w-full sm:w-auto"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(expense)}
                                            className="w-full text-red-600 hover:text-red-700 sm:w-auto"
                                            disabled={!manageable}
                                            title={
                                                manageable
                                                    ? 'Delete expense'
                                                    : 'Only the payer or group admins can delete this expense'
                                            }
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {isRefreshing && (
                    <p className="mt-4 text-xs text-gray-400">Refreshing expenses…</p>
                )}
            </CardContent>

            <EditExpenseModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingExpense(null)
                }}
                onSuccess={refreshExpenses}
                expense={editingExpense}
            />
        </Card>
    )
}
