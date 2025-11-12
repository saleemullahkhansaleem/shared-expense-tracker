'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import {
    UsersIcon,
    Squares2X2Icon,
    UserGroupIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline'

type DashboardNavLink = {
    name: string
    href: string
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type GroupNavLink = {
    name: string
    href: string
}

type GroupNavSection = {
    id: string
    name: string
    links: GroupNavLink[]
}

interface GroupSummary {
    id: string
    name: string
}

export function DashboardNav() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [groups, setGroups] = useState<GroupSummary[]>([])
    const [isLoadingGroups, setIsLoadingGroups] = useState(true)
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

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

        fetchGroups()
    }, [])

    const generalLinks: DashboardNavLink[] = useMemo(() => {
        const base: DashboardNavLink[] = [
            { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
        ]

        if (isAdmin) {
            base.push({ name: 'Users', href: '/dashboard/users', icon: UsersIcon })
        }

        return base
    }, [isAdmin])

    const groupSections: GroupNavSection[] = useMemo(() => {
        return groups.map((group) => ({
            id: group.id,
            name: group.name,
            links: [
                {
                    name: 'Overview',
                    href: `/dashboard/groups/${group.id}/overview`,
                },
                {
                    name: 'Members',
                    href: `/dashboard/groups/${group.id}/members`,
                },
                {
                    name: 'Transactions & Reports',
                    href: `/dashboard/groups/${group.id}/reports`,
                },
            ],
        }))
    }, [groups])

    return (
        <nav className="mt-5 flex-1 px-2 space-y-6">
            <div>
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    General
                </p>
                <div className="mt-2 space-y-1">
                    {generalLinks.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon ?? Squares2X2Icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                    'group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors rounded-md'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                                        'mr-3 h-5 w-5'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div>
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    My Groups
                </p>

                {isLoadingGroups && (
                    <div className="mt-2 flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        <span>Loading groups...</span>
                    </div>
                )}

                {!isLoadingGroups && groupSections.length === 0 && (
                    <div className="mt-2 px-3 py-2 text-sm text-gray-500">
                        You&apos;re not a member of any groups yet.
                    </div>
                )}

                <div className="mt-2 space-y-4">
                    {groupSections.map((section) => (
                        <div key={section.id}>
                            <div className="flex items-center px-3 py-2 text-sm font-semibold text-gray-700">
                                <UserGroupIcon className="mr-2 h-5 w-5 text-gray-400" />
                                <span className="truncate">{section.name}</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {section.links.map((link) => {
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                isActive
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                                'group flex items-center pl-9 pr-3 py-2 text-sm border-l-4 transition-colors rounded-md'
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    )
}
