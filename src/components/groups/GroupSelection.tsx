'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon, UserGroupIcon, KeyIcon } from '@heroicons/react/24/outline'
import { CreateGroupModal } from './CreateGroupModal'
import { JoinGroupModal } from './JoinGroupModal'

interface Group {
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

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/groups')
            if (response.ok) {
                const data = await response.json()
                setGroups(data)
            }
        } catch (error) {
            console.error('Error fetching groups:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const handleGroupSelect = (groupId: string) => {
        // Store selected group in localStorage or session
        localStorage.setItem('selectedGroupId', groupId)
        router.push('/dashboard')
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
                            <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                                        <span>{group.name}</span>
                                    </CardTitle>
                                    {group.description && (
                                        <CardDescription>{group.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
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
                                        <div className="pt-2">
                                            <Button
                                                onClick={() => handleGroupSelect(group.id)}
                                                className="w-full"
                                            >
                                                Enter Group
                                            </Button>
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
        </div>
    )
}
