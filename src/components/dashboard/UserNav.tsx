'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import {
    UserCircleIcon,
    ChevronDownIcon,
    UserIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline'

interface UserNavProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
}

interface GroupSummary {
    id: string
    name: string
}

export function UserNav({ user }: UserNavProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [groups, setGroups] = useState<GroupSummary[]>([])
    const [isLoadingGroups, setIsLoadingGroups] = useState(true)

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch('/api/groups', {
                    credentials: 'include',
                    cache: 'no-store',
                })

                if (!response.ok) {
                    throw new Error(`Failed to load groups (${response.status})`)
                }

                const data = await response.json()
                setGroups(
                    Array.isArray(data)
                        ? data.map((group: any) => ({
                            id: group.id,
                            name: group.name,
                        }))
                        : []
                )
            } catch (error) {
                console.error('Error fetching groups:', error)
                setGroups([])
            } finally {
                setIsLoadingGroups(false)
            }
        }

        if (isDropdownOpen) {
            fetchGroups()
        }
    }, [isDropdownOpen])

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' })
    }

    return (
        <div className="relative">
            {/* Avatar Button */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name ? getInitials(user.name) : <UserCircleIcon className="h-5 w-5" />}
                </div>

                {/* User Info (hidden on mobile) */}
                <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                        {user.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                        {user.role?.toLowerCase() || 'member'}
                    </div>
                </div>

                {/* Dropdown Arrow */}
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsDropdownOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {user.name ? getInitials(user.name) : <UserCircleIcon className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                        {user.name || 'User'}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {user.email}
                                    </div>
                                    {user.role && (
                                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role === 'ADMIN' ? 'Administrator' : 'Member'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-2">
                            <Link
                                href="/dashboard/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                                My Profile
                            </Link>

                            <Link
                                href="/dashboard/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                                Settings
                            </Link>

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-2"></div>

                            {/* Groups Section */}
                            <div className="px-4 py-2">
                                <div className="flex items-center mb-2">
                                    <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        My Groups
                                    </span>
                                </div>
                                {isLoadingGroups ? (
                                    <div className="text-xs text-gray-400 py-1">Loading...</div>
                                ) : groups.length === 0 ? (
                                    <div className="text-xs text-gray-400 py-1">No groups yet</div>
                                ) : (
                                    <div className="space-y-1">
                                        <Link
                                            href="/dashboard/groups"
                                            className="block px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            All Groups
                                        </Link>
                                        {groups.slice(0, 5).map((group) => (
                                            <Link
                                                key={group.id}
                                                href={`/dashboard/groups/${group.id}/overview`}
                                                className="block px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors truncate"
                                                onClick={() => setIsDropdownOpen(false)}
                                                title={group.name}
                                            >
                                                {group.name}
                                            </Link>
                                        ))}
                                        {groups.length > 5 && (
                                            <div className="text-xs text-gray-400 px-2 py-1">
                                                +{groups.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-2"></div>

                            {/* Sign Out */}
                            <button
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
