'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface User {
    id: string
    name: string
    email: string
    role: string
    isActive?: boolean
    createdAt: string
    _count?: {
        contributions: number
        expenses: number
    }
}

interface UserFormState {
    name: string
    email: string
    role: string
    password: string
    isActive: boolean
}

const defaultFormState: UserFormState = {
    name: '',
    email: '',
    role: '',
    password: '',
    isActive: true,
}

interface EditUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    user: User | null
    allowStatusToggle?: boolean
}

const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'USER', label: 'Member' }
]

export function EditUserModal({ isOpen, onClose, onSuccess, user, allowStatusToggle = false }: EditUserModalProps) {
    const [formData, setFormData] = useState<UserFormState>({ ...defaultFormState })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '',
                isActive: user.isActive ?? true,
            })
        } else if (isOpen && !user) {
            setFormData({ ...defaultFormState })
        }
    }, [isOpen, user])

    useEffect(() => {
        if (!isOpen) {
            setFormData({ ...defaultFormState })
        }
    }, [isOpen])

    if (!isOpen || !user) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password || undefined,
                    ...(allowStatusToggle ? { isActive: formData.isActive } : {}),
                })
            })

            if (response.ok) {
                onSuccess?.()
                onClose()
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to update user')
            }
        } catch (error) {
            console.error('Error updating user:', error)
            setError('Failed to update user. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = <K extends keyof UserFormState>(field: K, value: UserFormState[K]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Edit Member</CardTitle>
                    <CardDescription>Update member information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {allowStatusToggle && (
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                <div>
                                    <Label htmlFor="user-status" className="text-sm font-medium text-gray-900">
                                        Account Status
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        Deactivate to temporarily revoke access without deleting data.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium text-gray-500">
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <Switch
                                        id="user-status"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleChange('isActive', checked)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password (Optional)
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="Leave blank to keep current password"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Only enter a new password if you want to change it
                            </p>
                        </div>

                        {/* User Statistics */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Member Statistics</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Contributions:</span>
                                    <span className="ml-2 font-medium">{user._count?.contributions || 0}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Expenses:</span>
                                    <span className="ml-2 font-medium">{user._count?.expenses || 0}</span>
                                </div>
                            </div>
                            <div className="mt-2 text-sm">
                                <span className="text-gray-600">Joined:</span>
                                <span className="ml-2 font-medium">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
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
                                disabled={isLoading || !formData.name || !formData.email || !formData.role}
                                className="flex-1"
                            >
                                {isLoading ? 'Updating...' : 'Update Member'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
