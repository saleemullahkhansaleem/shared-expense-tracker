'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    XMarkIcon,
    UserIcon,
    CurrencyDollarIcon,
    ReceiptPercentIcon,
    CalendarIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline'
import { EditUserModal } from './EditUserModal'

interface UserProfile {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    totalContributions: number
    totalExpenses: number
    currentBalance: number
    contributions: Array<{
        id: string
        amount: number
        month: string
        createdAt: string
    }>
    expenses: Array<{
        id: string
        title: string
        category: string
        amount: number
        date: string
        paymentSource: string
        createdAt: string
    }>
    _count: {
        contributions: number
        expenses: number
    }
}

interface UserProfileModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string | null
    onUserUpdate?: () => void
}

export function UserProfileModal({ isOpen, onClose, userId, onUserUpdate }: UserProfileModalProps) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const fetchUserProfile = useCallback(async () => {
        if (!userId) return

        setLoading(true)
        try {
            const response = await fetch('/api/profile')
            if (response.ok) {
                const users = await response.json()
                const user = users.find((u: UserProfile) => u.id === userId)
                if (user) {
                    setUserProfile(user)
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserProfile()
        }
    }, [isOpen, userId, fetchUserProfile])

    const handleDeleteUser = async () => {
        if (!userProfile) return

        if (!confirm(`Are you sure you want to delete ${userProfile.name}? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`/api/users/${userProfile.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                onUserUpdate?.()
                onClose()
            } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to delete user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Failed to delete user')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                            <p className="text-gray-600">Detailed user information and financial data</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {userProfile && userProfile.role !== 'ADMIN' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteUser}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    ) : userProfile ? (
                        <div className="space-y-6">
                            {/* Financial Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                                        <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatCurrency(userProfile.totalContributions)}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {userProfile._count.contributions} contributions
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                        <ReceiptPercentIcon className="h-4 w-4 text-red-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            {formatCurrency(userProfile.totalExpenses)}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {userProfile._count.expenses} expenses
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                                        <UserIcon className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${userProfile.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(userProfile.currentBalance)}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {userProfile.currentBalance >= 0 ? 'In credit' : 'In debt'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* User Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>User account details and membership information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-sm text-gray-600">Name:</span>
                                                    <span className="ml-2 font-medium">{userProfile.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Email:</span>
                                                    <span className="ml-2 font-medium">{userProfile.email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Role:</span>
                                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${userProfile.role === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {userProfile.role}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-600">Member since:</span>
                                                    <span className="ml-2 font-medium">
                                                        {formatDate(new Date(userProfile.createdAt))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Contributions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Contributions</CardTitle>
                                        <CardDescription>Latest contribution entries</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {userProfile.contributions.slice(0, 5).map((contribution) => (
                                                <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {formatCurrency(contribution.amount)}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {contribution.month} • {formatDate(new Date(contribution.createdAt))}
                                                        </div>
                                                    </div>
                                                    <div className="text-green-600 font-medium">
                                                        +{formatCurrency(contribution.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                            {userProfile.contributions.length === 0 && (
                                                <p className="text-center text-gray-500 py-4">No contributions yet</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Expenses */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Expenses</CardTitle>
                                        <CardDescription>Latest expense entries</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {userProfile.expenses.slice(0, 5).map((expense) => (
                                                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{expense.title}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {expense.category} • {formatDate(new Date(expense.date))}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {expense.paymentSource === 'COLLECTED' ? 'From Collected' : 'From Pocket'}
                                                        </div>
                                                    </div>
                                                    <div className="text-red-600 font-medium">
                                                        -{formatCurrency(expense.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                            {userProfile.expenses.length === 0 && (
                                                <p className="text-center text-gray-500 py-4">No expenses yet</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">User not found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {userProfile && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={() => {
                        fetchUserProfile()
                        onUserUpdate?.()
                    }}
                    user={userProfile}
                />
            )}
        </div>
    )
}
