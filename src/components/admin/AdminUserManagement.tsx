'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { PencilIcon, PowerIcon, TrashIcon } from '@heroicons/react/24/outline'
import { EditUserModal } from '@/components/members/EditUserModal'

interface AdminUser {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'USER'
    isActive: boolean
    createdAt: string
    _count: {
        contributions: number
        expenses: number
    }
}

const roleFilters = [
    { label: 'All Roles', value: 'All' },
    { label: 'Admins', value: 'ADMIN' },
    { label: 'Members', value: 'USER' },
]

const statusFilters = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
]

export function AdminUserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('All')
    const [selectedStatus, setSelectedStatus] = useState('All')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/users', {
                credentials: 'include',
                cache: 'no-store',
            })

            if (!response.ok) {
                throw new Error(`Failed to load users (${response.status})`)
            }

            const data: AdminUser[] = await response.json()
            setUsers(data)
            setFilteredUsers(data)
        } catch (err: any) {
            console.error('Error fetching users:', err)
            setError(err?.message ?? 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    useEffect(() => {
        const normalizedSearch = searchTerm.toLowerCase()

        const next = users.filter((user) => {
            const matchesRole = selectedRole === 'All' || user.role === selectedRole
            const matchesStatus =
                selectedStatus === 'All' ||
                (selectedStatus === 'ACTIVE' && user.isActive) ||
                (selectedStatus === 'INACTIVE' && !user.isActive)
            const matchesSearch =
                user.name.toLowerCase().includes(normalizedSearch) ||
                user.email.toLowerCase().includes(normalizedSearch)

            return matchesRole && matchesStatus && matchesSearch
        })

        setFilteredUsers(next)
    }, [users, searchTerm, selectedRole, selectedStatus])

    const handleOpenEdit = (user: AdminUser) => {
        setSelectedUser(user)
        setIsEditModalOpen(true)
    }

    const handleCloseEdit = () => {
        setIsEditModalOpen(false)
        setSelectedUser(null)
    }

    const handleToggleStatus = async (user: AdminUser) => {
        const nextStatus = !user.isActive

        try {
            const response = await fetch(`/api/users/${user.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: nextStatus }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error ?? 'Failed to update user status')
            }

            await fetchUsers()
        } catch (err: any) {
            console.error('Error updating user status:', err)
            alert(err?.message ?? 'Failed to update user status')
        }
    }

    const handleDeleteUser = async (user: AdminUser) => {
        const confirmation = confirm(
            `Are you sure you want to delete ${user.name}? This action cannot be undone.`
        )
        if (!confirmation) return

        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error ?? 'Failed to delete user')
            }

            await fetchUsers()
        } catch (err: any) {
            console.error('Error deleting user:', err)
            alert(err?.message ?? 'Failed to delete user')
        }
    }

    const activeCount = users.filter((user) => user.isActive).length
    const adminCount = users.filter((user) => user.role === 'ADMIN').length

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                    <p className="text-gray-600">
                        Review, edit, deactivate, or delete users across the platform.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                        <CardDescription>Across the entire platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-gray-900">{users.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                        <CardDescription>Users with an active account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-green-600">{activeCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Inactive Users</CardTitle>
                        <CardDescription>Currently suspended accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-amber-600">{users.length - activeCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
                        <CardDescription>Users with elevated permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold text-indigo-600">{adminCount}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>All Users</CardTitle>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full md:w-64"
                            />
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleFilters.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusFilters.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="py-8 text-center text-sm text-gray-500">Loading users…</p>
                    ) : filteredUsers.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500">
                            No users match the current filters.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Activity
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Joined
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.role === 'ADMIN'
                                                            ? 'bg-indigo-100 text-indigo-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}
                                                >
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-4">
                                                    <span>
                                                        Contributions:{' '}
                                                        <strong>{user._count?.contributions ?? 0}</strong>
                                                    </span>
                                                    <span>
                                                        Expenses: <strong>{user._count?.expenses ?? 0}</strong>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {formatDate(new Date(user.createdAt))}
                                            </td>
                                            <td className="px-4 py-4 text-right text-sm">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(user)}
                                                    >
                                                        <PencilIcon className="mr-1 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={user.isActive ? 'text-amber-600' : 'text-green-600'}
                                                    >
                                                        <PowerIcon className="mr-1 h-4 w-4" />
                                                        {user.isActive ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteUser(user)}
                                                    >
                                                        <TrashIcon className="mr-1 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
                onSuccess={fetchUsers}
                user={selectedUser}
                allowStatusToggle
            />
        </div>
    )
}

