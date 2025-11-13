'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddContributionButton } from '@/components/contributions/AddContributionButton'
import { EditContributionModal } from '@/components/contributions/EditContributionModal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type ContributionSummary = {
    id: string
    amount: number
    month: string
    createdAt: string
    userId: string
    notes?: string | null
    user: {
        id: string
        name: string
        email?: string
    } | null
    group?: {
        id: string
        name: string
    }
}

interface GroupRecentContributionsCardProps {
    groupId: string
    groupName: string
    initialContributions: ContributionSummary[]
    members: Array<{ id: string; name: string }>
    isGroupAdmin: boolean
    showAddButton?: boolean
}

const normalizeContribution = (
    contribution: ContributionSummary,
    fallbackGroup: { id: string; name: string }
): ContributionSummary => ({
    ...contribution,
    notes: contribution.notes ?? null,
    user: contribution.user
        ? {
              id: contribution.user.id,
              name: contribution.user.name,
              email: contribution.user.email,
          }
        : null,
    group: contribution.group ?? fallbackGroup,
})

export function GroupRecentContributionsCard({
    groupId,
    groupName,
    initialContributions,
    members,
    isGroupAdmin,
    showAddButton = true,
}: GroupRecentContributionsCardProps) {
    const fallbackGroup = useMemo(
        () => ({
            id: groupId,
            name: groupName,
        }),
        [groupId, groupName]
    )
    const [contributions, setContributions] = useState<ContributionSummary[]>(() =>
        initialContributions.map((contribution) => normalizeContribution(contribution, fallbackGroup))
    )
    const [editingContribution, setEditingContribution] = useState<ContributionSummary | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        setContributions(
            initialContributions.map((contribution) => normalizeContribution(contribution, fallbackGroup))
        )
    }, [initialContributions, fallbackGroup])

    const refreshContributions = useCallback(async () => {
        try {
            setIsRefreshing(true)
            const response = await fetch(`/api/contributions?groupId=${groupId}`)
            if (!response.ok) {
                throw new Error('Failed to refresh contributions')
            }
            const data = await response.json()
            const normalized = Array.isArray(data)
                ? data
                      .slice(0, 5)
                      .map((contribution: ContributionSummary) => normalizeContribution(contribution, fallbackGroup))
                : []
            setContributions(normalized)
        } catch (error) {
            console.error('Error refreshing group contributions:', error)
        } finally {
            setIsRefreshing(false)
        }
    }, [groupId, fallbackGroup])

    const handleEdit = (contribution: ContributionSummary) => {
        setEditingContribution(contribution)
        setIsEditModalOpen(true)
    }

    const handleDelete = async (contribution: ContributionSummary) => {
        if (!confirm('Are you sure you want to delete this contribution?')) {
            return
        }

        try {
            const response = await fetch(`/api/contributions/${contribution.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete contribution')
            }

            await refreshContributions()
        } catch (error) {
            console.error('Error deleting contribution:', error)
            alert(error instanceof Error ? error.message : 'Failed to delete contribution')
        }
    }

    const displayedContributions = useMemo(() => contributions.slice(0, 5), [contributions])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Contributions</CardTitle>
                    {isGroupAdmin && showAddButton && (
                        <AddContributionButton
                            onSuccess={refreshContributions}
                            groupId={groupId}
                            groupName={groupName}
                            members={members}
                        />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayedContributions.length === 0 && (
                        <p className="text-sm text-gray-500">
                            No contributions recorded for this group yet.
                        </p>
                    )}
                    {displayedContributions.map((contribution) => (
                        <div
                            key={contribution.id}
                            className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {contribution.user?.name ?? 'Unknown member'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {contribution.month} • {formatDate(new Date(contribution.createdAt))}
                                </p>
                                {contribution.notes && (
                                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{contribution.notes}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-green-600">
                                    +{formatCurrency(contribution.amount)}
                                </p>
                                {isGroupAdmin && (
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(contribution)}
                                            title="Edit contribution"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(contribution)}
                                            className="text-red-600 hover:text-red-700"
                                            title="Delete contribution"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {isRefreshing && (
                    <p className="mt-4 text-xs text-gray-400">Refreshing contributions…</p>
                )}
            </CardContent>

            <EditContributionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingContribution(null)
                }}
                onSuccess={refreshContributions}
                contribution={editingContribution}
            />
        </Card>
    )
}

