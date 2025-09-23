'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AddExpenseModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

interface User {
    id: string
    name: string
    email: string
    role: string
}

const categories = ['Milk', 'Chicken', 'Vegetables', 'Other']
const paymentSources = [
    { value: 'COLLECTED', label: 'From Collected Amount' },
    { value: 'POCKET', label: 'From Own Pocket' }
]

export function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
    const [users, setUsers] = useState<User[]>([])
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentSource: '',
        userId: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

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

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    paymentSource: formData.paymentSource,
                    userId: formData.userId
                })
            })

            if (response.ok) {
                // Reset form and close modal
                setFormData({
                    title: '',
                    category: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    paymentSource: '',
                    userId: ''
                })
                onSuccess?.()
                onClose()
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to add expense')
            }
        } catch (error) {
            console.error('Error adding expense:', error)
            setError('Failed to add expense. Please try again.')
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Add New Expense</CardTitle>
                    <CardDescription>Record a new expense entry</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                                Member
                            </label>
                            <Select value={formData.userId} onValueChange={(value) => handleChange('userId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Expense Title
                            </label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
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
                                onChange={(e) => handleChange('amount', e.target.value)}
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
                                onChange={(e) => handleChange('date', e.target.value)}
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
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.userId || !formData.title || !formData.category || !formData.amount || !formData.paymentSource}
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
