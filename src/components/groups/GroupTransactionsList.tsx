'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { EditContributionModal } from '@/components/contributions/EditContributionModal'
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal'
import { ArrowTopRightOnSquareIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type TransactionContribution = {
    id: string
    amount: number
    month: string
    createdAt: string
    userId: string
    user: {
        id: string
        name: string
        email?: string
    } | null
    group: {
        id: string
        name: string
    }
}

type TransactionExpense = {
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
        email?: string
    } | null
    group: {
        id: string
        name: string
    }
}

export type GroupTransactionItem = {
    id: string
    type: 'CONTRIBUTION' | 'EXPENSE'
    entity: 'contribution' | 'expense'
    amount: number
    userName: string
    timestamp: string
    meta?: string
    linkHref: string
    contribution?: TransactionContribution
    expense?: TransactionExpense
}

interface GroupTransactionsListProps {
    initialTransactions: GroupTransactionItem[]
    isGroupAdmin: boolean
    currentUserId?: string
}

export function GroupTransactionsList({
    initialTransactions,
    isGroupAdmin,
    currentUserId,
}: GroupTransactionsListProps) {
    const router = useRouter()
    const [transactions, setTransactions] = useState<GroupTransactionItem[]>(initialTransactions)
    const [visibleCount, setVisibleCount] = useState(10)
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
    const [editingContribution, setEditingContribution] = useState<TransactionContribution | null>(null)
    const [editingExpense, setEditingExpense] = useState<TransactionExpense | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    useEffect(() => {
        const sorted = [...initialTransactions].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        setTransactions(sorted)
        setVisibleCount(10)
    }, [initialTransactions])

    useEffect(() => {
        if (transactions.length < visibleCount) {
            setVisibleCount(transactions.length)
        }
    }, [transactions.length, visibleCount])

    const visibleTransactions = useMemo(
        () => transactions.slice(0, visibleCount),
        [transactions, visibleCount]
    )

    const canManageTransaction = (transaction: GroupTransactionItem) => {
        if (transaction.type === 'CONTRIBUTION') {
            return isGroupAdmin
        }

        if (isGroupAdmin) {
            return true
        }

        if (transaction.expense?.userId && currentUserId) {
            return transaction.expense.userId === currentUserId
        }

        return false
    }

    const handleEdit = (transaction: GroupTransactionItem) => {
        if (!canManageTransaction(transaction)) {
            return
        }

        if (transaction.type === 'CONTRIBUTION' && transaction.contribution) {
            setEditingContribution(transaction.contribution)
            setIsContributionModalOpen(true)
            return
        }

        if (transaction.type === 'EXPENSE' && transaction.expense) {
            setEditingExpense(transaction.expense)
            setIsExpenseModalOpen(true)
        }
    }

    const removeTransaction = (transaction: GroupTransactionItem) => {
        setTransactions((prev) =>
            prev.filter(
                (item) =>
                    !(item.id === transaction.id && item.type === transaction.type)
            )
        )
    }

    const handleDelete = async (transaction: GroupTransactionItem) => {
        if (!canManageTransaction(transaction)) {
            return
        }

        if (!confirm('Are you sure you want to delete this transaction?')) {
            return
        }

        const deleteKey = `${transaction.type}-${transaction.id}`
        setPendingDeleteId(deleteKey)

        try {
            const endpoint =
                transaction.type === 'CONTRIBUTION'
                    ? `/api/contributions/${transaction.id}`
                    : `/api/expenses/${transaction.id}`

            const response = await fetch(endpoint, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error ?? 'Failed to delete transaction')
            }

            removeTransaction(transaction)
            router.refresh()
        } catch (error) {
            console.error('Error deleting transaction:', error)
            alert(error instanceof Error ? error.message : 'Failed to delete transaction.')
        } finally {
            setPendingDeleteId(null)
        }
    }

    const handleEditSuccess = () => {
        setIsContributionModalOpen(false)
        setIsExpenseModalOpen(false)
        setEditingContribution(null)
        setEditingExpense(null)
        router.refresh()
    }

    if (transactions.length === 0) {
        return <p className="text-sm text-gray-500">No transactions recorded yet for this group.</p>
    }

    return (
        <>
            <div className="space-y-4">
                {visibleTransactions.map((transaction) => {
                    const deleteKey = `${transaction.type}-${transaction.id}`
                    const canManage = canManageTransaction(transaction)
                    const amountLabel =
                        transaction.type === 'EXPENSE'
                            ? `-${formatCurrency(transaction.amount)}`
                            : formatCurrency(transaction.amount)
                    const amountClass =
                        transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'

                    return (
                        <div
                            key={`${transaction.type}-${transaction.id}`}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-4 sm:flex sm:items-center sm:justify-between"
                        >
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            transaction.type === 'CONTRIBUTION'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {transaction.type === 'CONTRIBUTION' ? 'Contribution' : 'Expense'}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {transaction.userName}
                                    </span>
                                    <Link
                                        href={transaction.linkHref}
                                        className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        View
                                        <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatDateTime(new Date(transaction.timestamp))}
                                    {transaction.meta && (
                                        <>
                                            <span className="mx-2 text-gray-300">•</span>
                                            <span>{transaction.meta}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 flex flex-col items-start gap-3 sm:mt-0 sm:flex-row sm:items-center sm:gap-4">
                                <span className={`text-sm font-semibold ${amountClass}`}>{amountLabel}</span>
                                <div className="flex items-center gap-2">
                                    {canManage && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(transaction)}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canManage && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDelete(transaction)}
                                            disabled={pendingDeleteId === deleteKey}
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {visibleCount < transactions.length && (
                <div className="pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setVisibleCount((count) => Math.min(count + 10, transactions.length))
                        }
                    >
                        Load more
                    </Button>
                </div>
            )}

            {visibleCount > 10 && (
                <div className="pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setVisibleCount(10)}>
                        Show less
                    </Button>
                </div>
            )}

            <EditContributionModal
                isOpen={isContributionModalOpen}
                onClose={() => {
                    setIsContributionModalOpen(false)
                    setEditingContribution(null)
                }}
                onSuccess={handleEditSuccess}
                contribution={editingContribution}
            />

            <EditExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false)
                    setEditingExpense(null)
                }}
                onSuccess={handleEditSuccess}
                expense={editingExpense}
            />
        </>
    )
}

