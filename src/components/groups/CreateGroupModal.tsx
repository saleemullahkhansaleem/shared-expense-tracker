'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        monthlyAmount: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : null,
                }),
            })

            if (response.ok) {
                const group = await response.json()
                setFormData({ name: '', description: '', monthlyAmount: '' })
                onSuccess()
                alert(`Group created successfully! Invite code: ${group.inviteCode}`)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to create group')
            }
        } catch (error) {
            setError('Failed to create group')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create New Group</CardTitle>
                    <CardDescription>
                        Create a group to manage shared expenses with friends
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="name">Group Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Roommates, Friends Trip"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>

                        <div>
                            <Label htmlFor="monthlyAmount">Monthly Amount per Person</Label>
                            <Input
                                id="monthlyAmount"
                                type="number"
                                step="0.01"
                                value={formData.monthlyAmount}
                                onChange={(e) => setFormData({ ...formData, monthlyAmount: e.target.value })}
                                placeholder="e.g., 100.00"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Optional: Set a default monthly contribution amount
                            </p>
                        </div>

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
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Creating...' : 'Create Group'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
