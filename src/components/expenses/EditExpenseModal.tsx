'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    group?: {
        id: string
        name: string
    }
}

interface GroupOption {
    id: string
    name: string
    members: Array<{ id: string; name: string }>
}

interface EditExpenseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    expense: Expense | null
}

const categories = ['Milk', 'Chicken', 'Vegetables', 'Other']
const paymentSources = [
    { value: 'COLLECTED', label: 'From Collected Amount' },
    { value: 'POCKET', label: 'From Own Pocket' },
]

export function EditExpenseModal({ isOpen, onClose, onSuccess, expense }: EditExpenseModalProps) {
    const router = useRouter()
    const [groups, setGroups] = useState<GroupOption[]>([])
    const [formData, setFormData] = useState({
        groupId: '',
        userId: '',
        title: '',
        category: '',
        amount: '',
        date: '',
        paymentSource: 'COLLECTED' as 'COLLECTED' | 'POCKET',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const loadInitialData = useCallback(async () => {
        if (!isOpen || !expense) return

        try {
            const response = await fetch('/api/groups', {
                credentials: 'include',
                cache: 'no-store',
            })
            if (!response.ok) {
                throw new Error('Failed to load groups')
            }

            const data = await response.json()
            const mapped: GroupOption[] = Array.isArray(data)
                ? data.map((group: any) => ({
                      id: group.id,
                      name: group.name,
                      members:
                          group.members?.map((member: any) => ({
                              id: member.user?.id ?? member.id,
                              name: member.user?.name ?? 'Unknown member',
                          })) ?? [],
                  }))
                : []

            setGroups(mapped)

            const defaultGroupId = expense.group?.id ?? mapped[0]?.id ?? ''
            const selectedGroup = mapped.find((group) => group.id === defaultGroupId)
            const defaultUserId =
                expense.userId && selectedGroup?.members.some((member) => member.id === expense.userId)
                    ? expense.userId
                    : selectedGroup?.members[0]?.id ?? ''

            setFormData({
                groupId: defaultGroupId,
                userId: defaultUserId,
                title: expense.title,
                category: expense.category,
                amount: expense.amount.toString(),
                date: expense.date.split('T')[0],
                paymentSource: expense.paymentSource,
            })
            setError('')
        } catch (err) {
            console.error('Error loading edit data:', err)
            setGroups([])
            setError('Failed to load groups for this expense.')
        }
    }, [expense, isOpen])

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    if (!isOpen || !expense) return null

    const selectedGroup = groups.find((group) => group.id === formData.groupId)
    const memberOptions = selectedGroup?.members ?? []

    const handleChange = (field: string, value: string) => {
        if (field === 'groupId') {
            const group = groups.find((item) => item.id === value)
            setFormData((prev) => ({
                ...prev,
                groupId: value,
                userId: group?.members[0]?.id ?? '',
            }))
            return
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!expense) return

        if (!formData.groupId) {
            setError('Please select a group')
            return
        }

        if (!formData.userId) {
            setError('Please select a member')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/expenses/${expense.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    paymentSource: formData.paymentSource,
                    userId: formData.userId,
                    groupId: formData.groupId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update expense')
            }

            onSuccess?.()
            onClose()
            router.refresh()
        } catch (err: any) {
            console.error('Error updating expense:', err)
            setError(err?.message ?? 'Failed to update expense. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Edit Expense</CardTitle>
                    <CardDescription>Update expense information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                                Group
                            </label>
                            {groups.length === 0 ? (
                                <div className="text-sm text-gray-500">No groups available.</div>
                            ) : (
                                <Select value={formData.groupId} onValueChange={(value) => handleChange('groupId', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div>
                            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                                Member
                            </label>
                            <Select
                                value={formData.userId}
                                onValueChange={(value) => handleChange('userId', value)}
                                disabled={memberOptions.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {memberOptions.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {memberOptions.length === 0 && (
                                <p className="mt-1 text-xs text-red-600">
                                    No members available for the selected group.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Expense Title
                            </label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(event) => handleChange('title', event.target.value)}
                                placeholder="e.g., Bought Milk"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
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
                        </div>

                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (PKR)
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                value={formData.amount}
                                onChange={(event) => handleChange('amount', event.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(event) => handleChange('date', event.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="paymentSource" className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Source
                            </label>
                            <Select value={formData.paymentSource} onValueChange={(value) => handleChange('paymentSource', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentSources.map((source) => (
                                        <SelectItem key={source.value} value={source.value}>
                                            {source.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setError('')
                                    onClose()
                                }}
                                className="flex-1"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    !formData.groupId ||
                                    !formData.userId ||
                                    !formData.title ||
                                    !formData.category ||
                                    !formData.amount ||
                                    !formData.paymentSource
                                }
                                className="flex-1"
                            >
                                {isLoading ? 'Saving...' : 'Update Expense'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
