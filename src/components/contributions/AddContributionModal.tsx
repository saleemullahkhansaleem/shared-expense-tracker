'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AddContributionModalProps {
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

const today = () => new Date().toISOString().split('T')[0]

const createDefaultForm = (groupId = '', userId = '') => ({
    groupId,
    userId,
    amount: '',
    month: monthOptions[0]?.value ?? '',
    details: '',
})

export function AddContributionModal({ isOpen, onClose, onSuccess, groupId, groupName, members }: AddContributionModalProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [groups, setGroups] = useState<GroupOption[]>([])
    const [formData, setFormData] = useState(() => createDefaultForm())
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const currentUserId = (session?.user as any)?.id as string | undefined

    const loadGroups = useCallback(async () => {
        if (!isOpen) return

        if (!currentUserId && !groupId) {
            return
        }

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
                const defaultMember = members[0]?.id ?? ''
                setFormData(createDefaultForm(groupId, defaultMember))
                setError('')
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

            const defaultGroupId = mapped[0]?.id ?? ''
            const defaultMember = mapped[0]?.members[0]?.id ?? ''
            setFormData(createDefaultForm(defaultGroupId, defaultMember))
            setError(mapped.length === 0 ? 'You must be a group admin to record contributions.' : '')
        } catch (err) {
            console.error('Error loading groups for contributions:', err)
            setGroups([])
            setFormData(createDefaultForm())
            setError('Unable to load groups. Only admins can record contributions.')
        }
    }, [currentUserId, groupId, groupName, isOpen, members])

    useEffect(() => {
        loadGroups()
    }, [loadGroups])

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
            const payload: Record<string, any> = {
                userId: formData.userId,
                amount: parseFloat(formData.amount),
                month: formData.month,
                groupId: formData.groupId,
            }
            const trimmedNotes = formData.details?.trim() ?? ''
            if (trimmedNotes.length > 0) {
                payload.notes = trimmedNotes
            }

            const response = await fetch('/api/contributions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || errorData.details || 'Failed to add contribution')
            }

            const defaultMember = selectedGroup?.members[0]?.id ?? ''
            setFormData(createDefaultForm(formData.groupId, defaultMember))
            onSuccess?.()
            onClose()
            router.refresh()
        } catch (err: any) {
            console.error('Error adding contribution:', err)
            setError(err?.message ?? 'Failed to add contribution. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Add New Contribution</CardTitle>
                    <CardDescription>Record a monthly contribution for a group member</CardDescription>
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

                        <div>
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                                Contribution Details <span className="text-xs text-gray-400">(optional)</span>
                            </label>
                            <textarea
                                id="details"
                                value={formData.details}
                                onChange={(event) => handleChange('details', event.target.value)}
                                placeholder="Add notes or context for this contribution"
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
                                    !formData.amount ||
                                    !formData.month
                                }
                                className="flex-1"
                            >
                                {isLoading ? 'Adding...' : 'Add Contribution'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
