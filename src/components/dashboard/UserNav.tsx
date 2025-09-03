'use client'

import { signOut } from 'next-auth/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface UserNavProps {
    user: {
        name?: string | null
        email?: string | null
        role?: string | null
    }
}

export function UserNav({ user }: UserNavProps) {
    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {user.role && (
                        <div className="text-xs text-blue-600 font-medium capitalize">{user.role}</div>
                    )}
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
            >
                Sign out
            </Button>
        </div>
    )
}
