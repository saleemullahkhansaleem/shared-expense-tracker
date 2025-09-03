'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'

// Mock data - replace with real data from API
const mockContributions = [
    {
        id: '1',
        userName: 'Ahmed',
        amount: 12000,
        month: '2025-01',
        date: new Date('2025-01-01'),
        status: 'PAID'
    },
    {
        id: '2',
        userName: 'Fatima',
        amount: 12000,
        month: '2025-01',
        date: new Date('2025-01-02'),
        status: 'PAID'
    },
    {
        id: '3',
        userName: 'Hassan',
        amount: 12000,
        month: '2025-01',
        date: new Date('2025-01-03'),
        status: 'PAID'
    },
    {
        id: '4',
        userName: 'Aisha',
        amount: 12000,
        month: '2025-01',
        date: new Date('2025-01-04'),
        status: 'PAID'
    },
    {
        id: '5',
        userName: 'Omar',
        amount: 12000,
        month: '2025-01',
        date: new Date('2025-01-05'),
        status: 'PAID'
    },
    {
        id: '6',
        userName: 'Zara',
        amount: 0,
        month: '2025-01',
        date: null,
        status: 'PENDING'
    }
]

const months = ['2025-01', '2024-12', '2024-11']
const statuses = ['All', 'PAID', 'PENDING']

export function ContributionsList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('2025-01')
    const [selectedStatus, setSelectedStatus] = useState('All')

    const filteredContributions = mockContributions.filter(contribution => {
        const matchesSearch = contribution.userName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMonth = selectedMonth === 'All' || contribution.month === selectedMonth
        const matchesStatus = selectedStatus === 'All' || contribution.status === selectedStatus

        return matchesSearch && matchesMonth && matchesStatus
    })

    const totalCollected = filteredContributions
        .filter(c => c.status === 'PAID')
        .reduce((sum, contribution) => sum + contribution.amount, 0)

    const pendingCount = filteredContributions.filter(c => c.status === 'PENDING').length

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Contributions</CardTitle>
                <CardDescription>Track contributions for {selectedMonth}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Input
                        placeholder="Search by member name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totalCollected)}
                            </div>
                            <div className="text-sm text-gray-600">Total Collected</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {filteredContributions.length}
                            </div>
                            <div className="text-sm text-gray-600">Total Members</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-orange-600">
                                {pendingCount}
                            </div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Contributions List */}
                <div className="space-y-3">
                    {filteredContributions.map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <h4 className="font-medium text-gray-900">{contribution.userName}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${contribution.status === 'PAID'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {contribution.status}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                    <span>Month: {contribution.month}</span>
                                    {contribution.date && (
                                        <>
                                            <span>•</span>
                                            <span>Paid: {formatDate(contribution.date)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-semibold ${contribution.status === 'PAID' ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {contribution.status === 'PAID'
                                        ? formatCurrency(contribution.amount)
                                        : 'Not paid'
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredContributions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No contributions found matching your filters.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
