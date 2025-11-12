'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    PlusIcon,
    UserGroupIcon,
    KeyIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { CreateGroupModal } from './CreateGroupModal'
import { JoinGroupModal } from './JoinGroupModal'
import { EditGroupModal } from './EditGroupModal'

interface Group {
    canManage: boolean
    canDelete: boolean
    id: string
    name: string
    description: string | null
    inviteCode: string
    monthlyAmount: number | null
    createdAt: string
    creator: {
        id: string
        name: string
        email: string
    }
    members: Array<{
        id: string
        role: string
        user: {
            id: string
            name: string
            email: string
        }
    }>
    _count: {
        members: number
        contributions: number
        expenses: number
    }
}

export function GroupSelection() {
    const { data: session } = useSession()
    const router = useRouter()
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState<Group | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const currentUserId = (session?.user as any)?.id as string | undefined

    const fetchGroups = useCallback(async () => {
        try {
            const response = await fetch('/api/groups')
            if (!response.ok) {
                throw new Error(`Failed to load groups (${response.status})`)
            }

            const data: Group[] = await response.json()
            if (Array.isArray(data)) {
                const mapped = data.map((group) => {
                    const isCreator = currentUserId ? group.creator?.id === currentUserId : false
                    const isGroupAdmin = currentUserId
                        ? group.members?.some(
                              (member) =>
                                  member.user?.id === currentUserId && member.role === 'ADMIN'
                          ) ?? false
                        : false

                    return {
                        ...group,
                        canManage: isCreator || isGroupAdmin,
                        canDelete: isCreator,
                    }
                })
                setGroups(mapped)
            } else {
                setGroups([])
            }
        } catch (error) {
            console.error('Error fetching groups:', error)
            setGroups([])
        } finally {
            setLoading(false)
        }
    }, [currentUserId])

    useEffect(() => {
        if (session !== undefined) {
            fetchGroups()
        }
    }, [fetchGroups, session])

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group)
        setIsEditModalOpen(true)
    }

    const handleDeleteGroup = async (group: Group) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${group.name}"? This action cannot be undone.`
        )

        if (!confirmed) return

        try {
            const response = await fetch(`/api/groups/${group.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error ?? 'Failed to delete group')
            }

            fetchGroups()
        } catch (error: any) {
            console.error('Error deleting group:', error)
            alert(error?.message ?? 'Failed to delete group')
        }
    }

    const handleGroupCreated = () => {
        setIsCreateModalOpen(false)
        fetchGroups()
    }

    const handleGroupJoined = () => {
        setIsJoinModalOpen(false)
        fetchGroups()
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center space-x-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create New Group</span>
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setIsJoinModalOpen(true)}
                    className="flex items-center space-x-2"
                >
                    <KeyIcon className="h-5 w-5" />
                    <span>Join with Code</span>
                </Button>
            </div>

            {/* Groups List */}
            {groups.length > 0 ? (
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Groups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <Card key={group.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>
                                        <Link
                                            href={`/dashboard/groups/${group.id}/overview`}
                                            onClick={() => localStorage.setItem('selectedGroupId', group.id)}
                                            className="flex items-center space-x-2 text-blue-700 hover:text-blue-800"
                                        >
                                            <UserGroupIcon className="h-5 w-5" />
                                            <span className="font-semibold">{group.name}</span>
                                        </Link>
                                    </CardTitle>
                                    {group.description && (
                                        <CardDescription>{group.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Created By
                                        </p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {group.creator?.name ?? 'Unknown'}
                                        </p>
                                        <p className="flex items-center text-xs text-gray-500">
                                            <EnvelopeIcon className="mr-1 h-4 w-4" />
                                            {group.creator?.email ?? 'No email provided'}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Members:</span>
                                            <span className="font-medium">{group._count.members}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Contributions:</span>
                                            <span className="font-medium">{group._count.contributions}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Expenses:</span>
                                            <span className="font-medium">{group._count.expenses}</span>
                                        </div>
                                        {group.monthlyAmount && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Monthly Amount:</span>
                                                <span className="font-medium">${group.monthlyAmount}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 pt-2">
                                            {group.canManage && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleEditGroup(group)}
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    {group.canDelete && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeleteGroup(group)}
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Create your first group or join an existing one to get started
                    </p>
                </div>
            )}

            {/* Modals */}
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleGroupCreated}
            />
            <JoinGroupModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onSuccess={handleGroupJoined}
            />
            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setEditingGroup(null)
                }}
                onSuccess={fetchGroups}
                group={
                    editingGroup
                        ? {
                              id: editingGroup.id,
                              name: editingGroup.name,
                              description: editingGroup.description,
                              monthlyAmount: editingGroup.monthlyAmount,
                          }
                        : null
                }
            />
        </div>
    )
}
