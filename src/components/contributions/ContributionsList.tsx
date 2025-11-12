'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddContributionButton } from './AddContributionButton'
import { EditContributionModal } from './EditContributionModal'
import { ContributionsListSkeleton } from '@/components/ui/skeletons'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

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
    group?: {
        id: string
        name: string
    }
}

interface GroupOption {
    id: string
    name: string
}

const statuses = ['All', 'PAID', 'PENDING']

export function ContributionsList() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    const [contributions, setContributions] = useState<Contribution[]>([])
    const [groups, setGroups] = useState<GroupOption[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('All')
    const [selectedStatus, setSelectedStatus] = useState('All')
    const [selectedGroup, setSelectedGroup] = useState('All')
    const [editingContribution, setEditingContribution] = useState<Contribution | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const fetchGroups = useCallback(async () => {
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
                ? data.map((group: any) => ({ id: group.id, name: group.name }))
                : []
            setGroups(mapped)
        } catch (error) {
            console.error('Error fetching groups:', error)
            setGroups([])
        }
    }, [])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    const fetchContributions = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (selectedMonth !== 'All') params.append('month', selectedMonth)
            if (selectedStatus !== 'All') params.append('status', selectedStatus)
            if (selectedGroup !== 'All') params.append('groupId', selectedGroup)
            if (searchTerm) params.append('search', searchTerm)

            const response = await fetch(`/api/contributions?${params}`)
            if (response.ok) {
                const data = await response.json()
                setContributions(data)
            }
        } catch (error) {
            console.error('Error fetching contributions:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedMonth, selectedStatus, selectedGroup, searchTerm])

    useEffect(() => {
        fetchContributions()
    }, [fetchContributions])

    useEffect(() => {
        if (selectedGroup === 'All') return
        if (groups.some((group) => group.id === selectedGroup)) return
        setSelectedGroup('All')
    }, [groups, selectedGroup])

    const uniqueMonths = Array.from(new Set(contributions.map((c) => c.month)))
    const monthOptions = ['All', ...uniqueMonths.sort().reverse()]

    const handleEditContribution = (contribution: Contribution) => {
        setEditingContribution(contribution)
        setIsEditModalOpen(true)
    }

    const handleDeleteContribution = async (contributionId: string) => {
        if (!confirm('Are you sure you want to delete this contribution?')) {
            return
        }

        try {
            const response = await fetch(`/api/contributions/${contributionId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchContributions()
            } else {
                alert('Failed to delete contribution')
            }
        } catch (error) {
            console.error('Error deleting contribution:', error)
            alert('Failed to delete contribution')
        }
    }

    const filteredContributions = contributions.filter((contribution) => {
        const matchesSearch = contribution.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMonth = selectedMonth === 'All' || contribution.month === selectedMonth
        const matchesStatus =
            selectedStatus === 'All' ||
            (selectedStatus === 'PAID' && contribution.amount > 0) ||
            (selectedStatus === 'PENDING' && contribution.amount === 0)
        const matchesGroup = selectedGroup === 'All' || contribution.group?.id === selectedGroup

        return matchesSearch && matchesMonth && matchesStatus && matchesGroup
    })

    const totalCollected = filteredContributions
        .filter((c) => c.amount > 0)
        .reduce((sum, contribution) => sum + contribution.amount, 0)

    const pendingCount = filteredContributions.filter((c) => c.amount === 0).length

    if (loading) {
        return <ContributionsListSkeleton />
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Monthly Contributions</CardTitle>
                            <CardDescription>Track contributions across your groups</CardDescription>
                        </div>
                        <AddContributionButton
                            onSuccess={fetchContributions}
                            disabled={!isAdmin}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                                {monthOptions.map((month) => (
                                    <SelectItem key={month} value={month}>
                                        {month === 'All' ? 'All Months' : month}
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
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Groups</SelectItem>
                                {groups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
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
                                <div className="text-sm text-gray-600">Total Records</div>
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
                        {filteredContributions.map((contribution) => {
                            const status = contribution.amount > 0 ? 'PAID' : 'PENDING'
                            return (
                                <div
                                    key={contribution.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h4 className="font-medium text-gray-900">{contribution.user.name}</h4>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    status === 'PAID'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}
                                            >
                                                {status}
                                            </span>
                                            {contribution.group && (
                                                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                                    {contribution.group.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                            <span>Month: {contribution.month}</span>
                                            {status === 'PAID' && (
                                                <>
                                                    <span>•</span>
                                                    <span>Recorded: {formatDate(new Date(contribution.createdAt))}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-right">
                                            <div className={`font-semibold ${status === 'PAID' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {status === 'PAID' ? formatCurrency(contribution.amount) : 'Not paid'}
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditContribution(contribution)}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteContribution(contribution.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {filteredContributions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No contributions found matching your filters.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Contribution Modal */}
            <EditContributionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingContribution(null)
                }}
                onSuccess={fetchContributions}
                contribution={editingContribution}
            />
        </>
    )
}
