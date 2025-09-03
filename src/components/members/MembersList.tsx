'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { UserPlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

// Mock data - replace with real data from API
const mockMembers = [
    {
        id: '1',
        name: 'Ahmed',
        email: 'ahmed@example.com',
        role: 'ADMIN',
        joinedAt: new Date('2024-01-01'),
        totalContributions: 144000,
        totalExpenses: 96000,
        currentBalance: 48000
    },
    {
        id: '2',
        name: 'Fatima',
        email: 'fatima@example.com',
        role: 'USER',
        joinedAt: new Date('2024-01-01'),
        totalContributions: 144000,
        totalExpenses: 120000,
        currentBalance: 24000
    },
    {
        id: '3',
        name: 'Hassan',
        email: 'hassan@example.com',
        role: 'USER',
        joinedAt: new Date('2024-01-01'),
        totalContributions: 144000,
        totalExpenses: 72000,
        currentBalance: 72000
    },
    {
        id: '4',
        name: 'Aisha',
        email: 'aisha@example.com',
        role: 'USER',
        joinedAt: new Date('2024-01-01'),
        totalContributions: 144000,
        totalExpenses: 80000,
        currentBalance: 64000
    },
    {
        id: '5',
        name: 'Omar',
        email: 'omar@example.com',
        role: 'USER',
        joinedAt: new Date('2024-01-01'),
        totalContributions: 144000,
        totalExpenses: 84000,
        currentBalance: 60000
    },
    {
        id: '6',
        name: 'Zara',
        email: 'zara@example.com',
        role: 'USER',
        joinedAt: new Date('2024-01-01'),
        totalContributions: 120000,
        totalExpenses: 40000,
        currentBalance: 80000
    }
]

const roles = ['ADMIN', 'USER']

export function MembersList() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('All')
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)

    const filteredMembers = mockMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === 'All' || member.role === selectedRole

        return matchesSearch && matchesRole
    })

    const totalMembers = filteredMembers.length
    const totalContributions = filteredMembers.reduce((sum, member) => sum + member.totalContributions, 0)
    const totalExpenses = filteredMembers.reduce((sum, member) => sum + member.totalExpenses, 0)
    const totalBalance = filteredMembers.reduce((sum, member) => sum + member.currentBalance, 0)

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {totalMembers}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalContributions)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalExpenses)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(totalBalance)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Group Members</CardTitle>
                    <CardDescription>Manage member roles and view financial summaries</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                                        <span className={`px-2 py-1 text-xs rounded-full ${member.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                        <span>{member.email}</span>
                                        <span>•</span>
                                        <span>Joined: {member.joinedAt.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-6 mt-2 text-sm">
                                        <span className="text-green-600">
                                            Contributions: {formatCurrency(member.totalContributions)}
                                        </span>
                                        <span className="text-red-600">
                                            Expenses: {formatCurrency(member.totalExpenses)}
                                        </span>
                                        <span className="text-blue-600">
                                            Balance: {formatCurrency(member.currentBalance)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                        <PencilIcon className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    {member.role !== 'ADMIN' && (
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                            <TrashIcon className="h-4 w-4 mr-1" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No members found matching your filters.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* TODO: Add Member Modal */}
            {isAddMemberModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Add New Member</CardTitle>
                            <CardDescription>Invite a new member to the group</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-gray-600 py-4">
                                Member invitation functionality will be implemented here.
                            </p>
                            <Button onClick={() => setIsAddMemberModalOpen(false)} className="w-full">
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
