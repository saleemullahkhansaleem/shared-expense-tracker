'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Contribution {
    id: string
    amount: number
    month: string
    createdAt: string
    user: {
        id: string
        name: string
        email?: string
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

interface EditContributionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    contribution: Contribution | null
}

const generateMonthOptions = () => {
    const months: { value: string; label: string }[] = []
    const now = new Date()
    for (let offset = -2; offset <= 10; offset += 1) {
        const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const label = date.toLocaleString('default', { month: 'long', year: 'numeric' })
        months.push({ value, label })
    }
    return months
}

const monthOptions = generateMonthOptions()

export function EditContributionModal({ isOpen, onClose, onSuccess, contribution }: EditContributionModalProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [groups, setGroups] = useState<GroupOption[]>([])
    const [formData, setFormData] = useState({
        groupId: '',
        userId: '',
        amount: '',
        month: monthOptions[0]?.value ?? '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const currentUserId = (session?.user as any)?.id as string | undefined

    const loadInitialData = useCallback(async () => {
        if (!isOpen || !contribution) return

        if (!currentUserId) {
            return
        }

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
                ? data
                      .filter((group: any) =>
                          group.members?.some(
                              (member: any) =>
                                  member.userId === currentUserId && member.role === 'ADMIN'
                          )
                      )
                      .map((group: any) => ({
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

            const defaultGroupId = contribution.group?.id ?? mapped[0]?.id ?? ''
            const selectedGroup = mapped.find((group) => group.id === defaultGroupId)
            const defaultUserId =
                contribution.user?.id && selectedGroup?.members.some((member) => member.id === contribution.user.id)
                    ? contribution.user.id
                    : selectedGroup?.members[0]?.id ?? ''

            setFormData({
                groupId: defaultGroupId,
                userId: defaultUserId,
                amount: contribution.amount.toString(),
                month: contribution.month,
            })
            setError(mapped.length === 0 ? 'You must be a group admin to modify contributions.' : '')
        } catch (err) {
            console.error('Error loading contribution data:', err)
            setGroups([])
            setError('Unable to load groups. Only admins can edit contributions.')
        }
    }, [contribution, currentUserId, isOpen])

    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    if (!isOpen || !contribution) return null

    const selectedGroup = groups.find((group) => group.id === formData.groupId)
    const memberOptions = selectedGroup?.members ?? []

    const handleChange = (field: keyof typeof formData, value: string) => {
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
        if (!contribution) return

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
            const response = await fetch(`/api/contributions/${contribution.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: formData.userId,
                    amount: parseFloat(formData.amount),
                    month: formData.month,
                    groupId: formData.groupId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update contribution')
            }

            onSuccess?.()
            onClose()
            router.refresh()
        } catch (err: any) {
            console.error('Error updating contribution:', err)
            setError(err?.message ?? 'Failed to update contribution. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Edit Contribution</CardTitle>
                    <CardDescription>Update contribution details</CardDescription>
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
                            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                                Month
                            </label>
                            <Select value={formData.month} onValueChange={(value) => handleChange('month', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthOptions.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
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
                                placeholder="12000"
                                min="0"
                                step="0.01"
                                required
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
                                    !formData.amount ||
                                    !formData.month
                                }
                                className="flex-1"
                            >
                                {isLoading ? 'Saving...' : 'Update Contribution'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
