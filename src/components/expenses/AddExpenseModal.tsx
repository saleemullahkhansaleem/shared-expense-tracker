'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BanknotesIcon, WalletIcon } from '@heroicons/react/24/outline'

interface AddExpenseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    groupId?: string
    groupName?: string
    members?: Array<{ id: string; name: string }>
}

interface GroupOption {
    id: string
    name: string
    members: Array<{ id: string; name: string }>
}

const categories = ['Milk', 'Chicken', 'Vegetables', 'Other']
const paymentSources = [
    {
        value: 'COLLECTED',
        title: 'Collected Funds',
        description: 'Use the group’s shared contributions.',
        icon: BanknotesIcon,
    },
    {
        value: 'POCKET',
        title: 'Paid from Pocket',
        description: 'Covered personally and reimbursable later.',
        icon: WalletIcon,
    },
] as const

const today = () => new Date().toISOString().split('T')[0]

const createDefaultFormState = (groupId = '', userId = '') => ({
    groupId,
    userId,
    details: '',
    category: '',
    amount: '',
    date: today(),
    paymentSource: 'COLLECTED' as 'COLLECTED' | 'POCKET',
})

export function AddExpenseModal({ isOpen, onClose, onSuccess, groupId, groupName, members }: AddExpenseModalProps) {
    const router = useRouter()
    const [groups, setGroups] = useState<GroupOption[]>([])
    const [formData, setFormData] = useState(() => createDefaultFormState())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const initialiseGroups = useCallback(async () => {
        if (!isOpen) return
        setError('')

        try {
            if (groupId && members && members.length > 0) {
                const options: GroupOption[] = [
                    {
                        id: groupId,
                        name: groupName ?? 'Selected Group',
                        members,
                    },
                ]
                setGroups(options)
                const defaultUserId = members[0]?.id ?? ''
                setFormData(createDefaultFormState(groupId, defaultUserId))
                return
            }

            const response = await fetch('/api/groups', {
                credentials: 'include',
                cache: 'no-store',
            })

            if (!response.ok) {
                throw new Error(`Failed to load groups (${response.status})`)
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

            const defaultGroupId = mapped[0]?.id ?? ''
            const defaultUserId = mapped[0]?.members[0]?.id ?? ''
            setFormData(createDefaultFormState(defaultGroupId, defaultUserId))
        } catch (err) {
            console.error('Error fetching groups:', err)
            setGroups([])
            setFormData(createDefaultFormState())
        }
    }, [groupId, groupName, isOpen, members])

    useEffect(() => {
        initialiseGroups()
    }, [initialiseGroups])

    useEffect(() => {
        if (!isOpen) return
        if (groups.length === 0) return

        setFormData((prev) => {
            const nextGroupId = prev.groupId && groups.some((group) => group.id === prev.groupId) ? prev.groupId : groups[0].id
            const selectedGroup = groups.find((group) => group.id === nextGroupId)
            const nextUserId =
                prev.userId && selectedGroup?.members.some((member) => member.id === prev.userId)
                    ? prev.userId
                    : selectedGroup?.members[0]?.id ?? ''

            return {
                ...prev,
                groupId: nextGroupId,
                userId: nextUserId,
            }
        })
    }, [groups, isOpen])

    if (!isOpen) return null

    const selectedGroup = groups.find((group) => group.id === formData.groupId)
    const memberOptions = selectedGroup?.members ?? []
    const showGroupSelect = !groupId && groups.length > 1

    const handleChange = (field: string, value: string) => {
        if (field === 'groupId') {
            const targetGroup = groups.find((group) => group.id === value)
            setFormData((prev) => ({
                ...prev,
                groupId: value,
                userId: targetGroup?.members[0]?.id ?? '',
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
        setIsLoading(true)
        setError('')

        if (!formData.groupId) {
            setError('Please select a group')
            setIsLoading(false)
            return
        }

        if (!formData.userId) {
            setError('Please select a member')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.details?.trim() ? formData.details.trim() : 'Expense',
                    category: formData.category,
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    paymentSource: formData.paymentSource,
                    userId: formData.userId,
                    groupId: formData.groupId,
                    details: formData.details?.trim() ?? '',
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add expense')
            }

            const defaultUserId = selectedGroup?.members[0]?.id ?? ''
            setFormData(createDefaultFormState(formData.groupId, defaultUserId))
            onSuccess?.()
            onClose()
            router.refresh()
        } catch (err: any) {
            console.error('Error adding expense:', err)
            setError(err?.message ?? 'Failed to add expense. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Add New Expense</CardTitle>
                    <CardDescription>Record a new expense entry for your group</CardDescription>
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
                            ) : showGroupSelect ? (
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
                            ) : (
                                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                    {selectedGroup?.name ?? groupName ?? 'Selected Group'}
                                </div>
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
                            <p className="block text-sm font-medium text-gray-700 mb-2">Payment Source</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {paymentSources.map((source) => {
                                    const isActive = formData.paymentSource === source.value
                                    const Icon = source.icon
                                    return (
                                        <Button
                                            key={source.value}
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleChange('paymentSource', source.value)}
                                            aria-pressed={isActive}
                                            className={cn(
                                                'h-auto justify-start gap-3 border text-left transition-shadow',
                                                isActive
                                                    ? 'border-primary bg-indigo-50 shadow-md'
                                                    : 'border-gray-200 hover:border-indigo-200'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-5 w-5 flex-shrink-0',
                                                    isActive ? 'text-indigo-600' : 'text-gray-400'
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {source.title}
                                                </p>
                                            </div>
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                                Expense Details <span className="text-xs text-gray-400">(optional)</span>
                            </label>
                            <textarea
                                id="details"
                                value={formData.details}
                                onChange={(event) => handleChange('details', event.target.value)}
                                placeholder="Add notes or context for this expense"
                                rows={3}
                                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                            />
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
                                    !formData.category ||
                                    !formData.amount ||
                                    !formData.paymentSource
                                }
                                className="flex-1"
                            >
                                {isLoading ? 'Adding...' : 'Add Expense'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}