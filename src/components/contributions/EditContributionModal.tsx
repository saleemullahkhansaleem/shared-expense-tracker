'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface Contribution {
    id: string
    amount: number
    month: string
    createdAt: string
    user: {
        id: string
        name: string
        email: string
    }
}

interface EditContributionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    contribution: Contribution | null
}

const months = [
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-03', label: 'March 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-05', label: 'May 2025' },
    { value: '2025-06', label: 'June 2025' },
]

export function EditContributionModal({ isOpen, onClose, onSuccess, contribution }: EditContributionModalProps) {
    const [users, setUsers] = useState<User[]>([])
    const [formData, setFormData] = useState({
        memberId: '',
        amount: '',
        month: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
            if (contribution) {
                setFormData({
                    memberId: contribution.user.id,
                    amount: contribution.amount.toString(),
                    month: contribution.month
                })
            }
        }
    }, [isOpen, contribution])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users')
            if (response.ok) {
                const usersData = await response.json()
                setUsers(usersData)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    if (!isOpen || !contribution) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/contributions/${contribution.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: formData.memberId,
                    amount: parseFloat(formData.amount),
                    month: formData.month
                })
            })

            if (response.ok) {
                onSuccess?.()
                onClose()
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to update contribution')
            }
        } catch (error) {
            console.error('Error updating contribution:', error)
            setError('Failed to update contribution. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const selectedMember = users.find(m => m.id === formData.memberId)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Edit Contribution</CardTitle>
                    <CardDescription>Update contribution information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
                                Member
                            </label>
                            <Select value={formData.memberId} onValueChange={(value) => handleChange('memberId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    {months.map((month) => (
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
                                onChange={(e) => handleChange('amount', e.target.value)}
                                placeholder="12000"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        {selectedMember && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    Updating contribution for <strong>{selectedMember.name}</strong>
                                    for <strong>{months.find(m => m.value === formData.month)?.label}</strong>
                                </p>
                            </div>
                        )}

                        <div className="flex space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.memberId || !formData.amount || !formData.month}
                                className="flex-1"
                            >
                                {isLoading ? 'Updating...' : 'Update Contribution'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
