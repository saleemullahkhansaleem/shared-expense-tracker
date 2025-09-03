'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AddContributionModalProps {
    isOpen: boolean
    onClose: () => void
}

// Mock data - replace with real data from API
const mockMembers = [
    { id: '1', name: 'Ahmed' },
    { id: '2', name: 'Fatima' },
    { id: '3', name: 'Hassan' },
    { id: '4', name: 'Aisha' },
    { id: '5', name: 'Omar' },
    { id: '6', name: 'Zara' },
]

const months = [
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-03', label: 'March 2025' },
]

export function AddContributionModal({ isOpen, onClose }: AddContributionModalProps) {
    const [formData, setFormData] = useState({
        memberId: '',
        amount: '',
        month: '',
        date: new Date().toISOString().split('T')[0],
    })
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // TODO: Implement API call to add contribution
            console.log('Adding contribution:', formData)

            // Reset form and close modal
            setFormData({
                memberId: '',
                amount: '',
                month: '',
                date: new Date().toISOString().split('T')[0],
            })
            onClose()
        } catch (error) {
            console.error('Error adding contribution:', error)
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

    const selectedMember = mockMembers.find(m => m.id === formData.memberId)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Add New Contribution</CardTitle>
                    <CardDescription>Record a monthly contribution from a member</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-1">
                                Member
                            </label>
                            <Select value={formData.memberId} onValueChange={(value) => handleChange('memberId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select member" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockMembers.map((member) => (
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

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Date
                            </label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                required
                            />
                        </div>

                        {selectedMember && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    Recording contribution for <strong>{selectedMember.name}</strong>
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
                                {isLoading ? 'Adding...' : 'Add Contribution'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
