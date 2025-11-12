'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EditGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    group: {
        id: string
        name: string
        description: string | null
        monthlyAmount: number | null
    } | null
}

export function EditGroupModal({ isOpen, onClose, onSuccess, group }: EditGroupModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        monthlyAmount: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && group) {
            setFormData({
                name: group.name ?? '',
                description: group.description ?? '',
                monthlyAmount: group.monthlyAmount !== null ? String(group.monthlyAmount) : '',
            })
            setError('')
        }
    }, [isOpen, group])

    if (!isOpen || !group) return null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/groups/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : null,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error ?? 'Failed to update group')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            console.error('Error updating group:', err)
            setError(err?.message ?? 'Failed to update group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Edit Group</CardTitle>
                    <CardDescription>Update the group information for your members.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="group-name">Group Name *</Label>
                            <Input
                                id="group-name"
                                value={formData.name}
                                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="group-description">Description</Label>
                            <Input
                                id="group-description"
                                value={formData.description}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                                }
                                placeholder="Optional description"
                            />
                        </div>

                        <div>
                            <Label htmlFor="group-monthly-amount">Monthly Amount per Person</Label>
                            <Input
                                id="group-monthly-amount"
                                type="number"
                                step="0.01"
                                value={formData.monthlyAmount}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, monthlyAmount: event.target.value }))
                                }
                                placeholder="e.g., 100.00"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    onClose()
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

